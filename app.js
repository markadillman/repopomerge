var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var styles = require('stylus');
var SVG = require('svg.js');
var xmlParse = require('xml2js').parseString;
const util = require('util');
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
//database url
var dbUrl = 'mongodb://127.0.0.1:27017/test'

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

//make process trackable
process.title = "ariesApp";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const coordinatePairs = {"ul": {"x":-1,"y":-1,"canvasId":"aboveLeftDivCanvas"},//------upper left ("ul")
					     "uc": {"x":0,"y":-1,"canvasId":"aboveDivCanvas"},     //------upper middle ("uc")
					     "ur": {"x":1,"y":-1,"canvasId":"aboveRightDivCanvas"},//------upper right ("ur")
					     "cl": {"x":-1,"y":0,"canvasId":"leftDivCanvas"},      //------center left ("cl")
					     "cm": {"x":0,"y":0,"canvasId":"svgCanvas"},           //------center middle ("cm") <-dummy for index loops
					     "cr": {"x":1,"y":0,"canvasId":"rightDivCanvas"},      //------center right ("cr")
					     "bl": {"x":-1,"y":1,"canvasId":"belowLeftDivCanvas"}, //------bottom left ("bl")
					     "bm": {"x":0,"y":1,"canvasId":"belowDivCanvas"},      //------bottom middle ("bm")
					     "br": {"x":1,"y":1,"canvasId":"belowRightDivCanvas"}  //------bottom right ("br")
					};
					//all coordinates below are actually adjustment factors and not hard coded coords
const initPullPairs = { "-2,-2":{"x":-2,"y":-2},
						"-2,-1":{"x":-2,"y":-1},
						"-2,0":{"x":-2,"y":0},
						"-2,1":{"x":-2,"y":1},
						"-2,2":{"x":-2,"y":2},
						"-1,-2":{"x":-1,"y":-2},
						"-1,-1":{"x":-1,"y":-1},
						"-1,0":{"x":-1,"y":0},
						"-1,1":{"x":-1,"y":1},
						"-1,2":{"x":-1,"y":2},
						"0,-2":{"x":0,"y":-2},
						"0,-1":{"x":0,"y":-1},
						"0,0":{"x":0,"y":0},
						"0,1":{"x":0,"y":1},
						"0,2":{"x":0,"y":2},
						"1,-2":{"x":1,"y":-2},
						"1,-1":{"x":1,"y":-1},
						"1,0":{"x":1,"y":0},
						"1,1":{"x":1,"y":1},
						"1,2":{"x":1,"y":2},
						"2,-2":{"x":2,"y":-2},
						"2,-1":{"x":2,"y":-1},
						"2,0":{"x":2,"y":0},
						"2,1":{"x":2,"y":1},
						"2,2":{"x":2,"y":2},
				};
				//these are used for movement-triggered pulls to maintain a memory buffer in the client
const pullSets = {	"top pull" : {0:{"x":-2,"y":-3},1:{"x":-1,"y":-3},2:{"x":0,"y":-3},3:{"x":1,"y":-3},4:{"x":2,"y":-3}},
					"bottom pull" : {0:{"x":-2,"y":3},1:{"x":-1,"y":3},2:{"x":0,"y":3},3:{"x":1,"y":3},4:{"x":2,"y":3}},
					"left pull" : {0:{"x":-3,"y":-2},1:{"x":-3,"y":-1},2:{"x":-3,"y":0},3:{"x":-3,"y":1},4:{"x":-3,"y":2}},
					"right pull" : {0:{"x":3,"y":-2},1:{"x":3,"y":-1},2:{"x":3,"y":0},3:{"x":3,"y":1},4:{"x":3,"y":2}}
				};

//HELPER FUNCTION FOR SVG VALIDITY
function isValidSvg(svgString){
	//parse and see if there are any errors
	var xmlObject = xmlParse(svgString,function(err,result){
			//this saves from ANY malformed XML, and therefore SVG
			if (err) {
				return false;
			}
			else {
				//if there are an improper number of groups or nested tags incorrect
				if (result.svg.g.length != 2) {
					return false;
				}
				//if those groups have id's other than the valid ones (inserting non-functional groups)
				if (!(result.svg.g[0].$.id === "drawingGroup" && result.svg.g[1].$.id === "platformsGroup")){
					return false;
				}
			}
			//if here, SVG XML is valid
			return true;
	});
	return xmlObject;
}

//handle submitted tile edit requests
app.post('/edit',function(req,res){
	var xcoord = parseInt(req.body.xcoord);
	var ycoord = parseInt(req.body.ycoord);
	//var graphic = req.body.graphic //UNCOMMENT LATER
	var isBeingEdited;
	if (req.body.isBeingEdited){
		isBeingEdited = req.body.isBeingEdited;
	}
	else {
		//if this value is assigned by a spoofed request it won't matter unless
		//they know the password.
		isBeingEdited = false;
	}
	var pw;
	if (req.body.pw)
	{
		pw = req.body.pw;
	}
	else {
		pw = "";
	}
	var rawSVG = req.body.svg;
	//if tile coordinates are not a number or out of bounds, reject
	if (!(Number.isInteger(xcoord)&&Number.isInteger(ycoord))){
		res.status(511).send("Tile coordinates invalid or out of bounds.");
		return;
	}
	//if SVG XML is invalid or contains non-functional groups (from perspective of game engine), reject
	if (!isValidSvg(rawSVG)){
		res.status(511).send("Invalid SVG string.");
		return;
	}
	//parse out the groups. precondition verifies this is already well-formed
	//clip out everything prior to first closing xml bracket
	rawSVG = rawSVG.substring(rawSVG.indexOf('>')+1)
	//clip off the closing </svg> by removing last 6 characters from string
	rawSVG = rawSVG.slice(0,(rawSVG.length-6));
	//construct query to send to db
	var insertDoc = {};
	insertDoc['xcoord'] = xcoord;
	insertDoc['ycoord'] = ycoord;
	insertDoc['pw'] = pw;
	insertDoc['svg'] = rawSVG;
	insertDoc['isBeingEdited'] = isBeingEdited;
	//insertDoc['graphic'] = graphic //UNCOMMENT LATER
	var filter = {};
	filter['xcoord'] = xcoord;
	filter['ycoord'] = ycoord;
	filter['pw'] = pw;
	console.log(util.inspect(insertDoc,false,null));
	MongoClient.connect(dbUrl,function(err,db){
		//test for errors, pop out if there are errors present
		assert.equal(null,err);
		console.log("connected succesfully to server");
		insertDocument(db,insertDoc,filter,res,insertCallback,insertDoc);
	});
});

var insertDocument = function(db,insertDoc,filter,res,callback){
	var collection = db.collection('tiles');
	//insert the document
	console.log("About to insert:");
	console.log(util.inspect(insertDoc));
	collection.update(filter,insertDoc,{upsert:true},function(err,result){
		if (err === null){
			console.log("Inserted tile into database");
			console.log(result);
		}
		else {
			console.log(err);
		}
		callback(db,res,insertDoc);
	});
}


var insertCallback = function(db,res,initCoords){
	console.log("in callback");
	db.close();
	var sendCoords = {};
	sendCoords.xcoord = initCoords.xcoord;
	sendCoords.ycoord = initCoords.ycoord;
	console.log();
	res.status(200).send(JSON.stringify(sendCoords));
}

var insertDocumentNoCallback = function(db,insertDoc,filter,res){
	var collection = db.collection('tiles');
	//insert the document
	console.log("About to insert:");
	console.log(util.inspect(insertDoc));
	collection.update(filter,insertDoc,{upsert:true},function(err,result){
		if (err === null){
			console.log("Inserted tile into database");
			console.log(result);
		}
		else {
			console.log(err);
		}
		db.close();
	});
}

var findDocument = function(db,query,req,res,callback,initCoords,setname){
	var collection = db.collection('tiles');
	console.log("FOR");
	console.log(callback.toString());
	console.log(util.inspect(query));
	var fields = {};
	fields.xcoord = 1;
	fields.ycoord = 1;
	fields.svg = 1;
	fields.isBeingEdited = 1;
	//fields.graphic = 1; //'UNEDIT THIS LATER'
	collection.find(query,fields).toArray(function(err,docs){
		//if error, pop
		assert.equal(err,null);
		console.log("Found following records:");
		console.log(docs);
		console.log("Size of docs:");
		console.log(docs.length);
		if (initCoords && setname){
			console.log("logic1");
			callback(db,req,res,docs,initCoords,setname);
		}
		else if (initCoords){
			console.log("logic1");
			callback(db,req,res,docs,initCoords);
		} else {
			console.log("logic1");
			callback(db,req,res,docs);
		}
		console.log("---end callback");
	});
}

//same as findDocument but will return the password. NEVER RETURN A LIST OF DOCS
//GENERATED FROM THIS QUERY HELPER TO THE CLIENT. IT WILL RESULT IN A PLAINTEXT
//PASSWORD LEAK. Separating these functions by function name avoids fancy arg
//overloading that could cause leaks.
var findDocumentPW = function(db,query,req,res,callback,initCoords,setname){
	var collection = db.collection('tiles');
	console.log("this query gon return passwords:");
	console.log(util.inspect(query));
	var fields = {};
	fields.xcoord = 1;
	fields.ycoord = 1;
	fields.svg = 1;
	fields.isBeingEdited = 1;
	fields.pw = 1;
	//fields.graphic = 1;
	collection.find(query,fields).toArray(function(err,docs){
		//if error, pop
		assert.equal(err,null);
		console.log("Found following records:");
		console.log(docs);
		console.log("Size of docs:");
		console.log(docs.length);
		if (initCoords && setname){
			callback(db,req,res,docs,initCoords,setname);
		}
		else if (initCoords){
			callback(db,req,res,docs,initCoords);
		} else {
			callback(db,req,res,docs);
		}
	});
}

var findCallback = function(db,req,res,docs,initCoords){
	if (docs.length === 1){
		//now that the doc is retrieved, set as being edited.
		var xcoord = docs[0]['xcoord'];
		var ycoord = docs[0]['ycoord'];
		setEdited(xcoord,ycoord,true);
		//construct header
		res.setHeader('Content-Type','application/json');
		console.log("shippin out some troublin docs.");
		console.log(util.inspect(docs));
		console.log("docs array accessor");
		console.log(util.inspect(docs[0]));
		res.status(200).send(JSON.stringify(docs));
	}
	else if (docs.length === 0) {
		res.status(242).send("No coordinate / password matches found.");
	}
	else {
		res.status(566).send("Database error: duplicate entries.");
	}
	db.close();
}

//helper function to adjust the editing status of a tile with coordinates
var setEdited = function(xcoord,ycoord,editStatus){
	//if any coordinates are not legit, exit the function
	if ((xcoord === null || xcoord === undefined)|| (ycoord === null || ycoord === undefined)){
		return;
	}
	var insertDoc = {$set : {isBeingEdited : editStatus}};
	var filter = {};
	filter.xcoord = xcoord;
	filter.ycoord = ycoord;
	//console.log("edit status filter");
	//console.log(util.inspect(filter));
	MongoClient.connect(dbUrl,function(err,db){
		//test for errors, pop out if there are errors present
		assert.equal(null,err);
		//console.log("connected succesfully to server");
		//perform update
		var collection = db.collection('tiles');
		//insert the document
		//console.log("About to update edit:");
		//console.log(util.inspect(insertDoc));
		collection.update(filter,insertDoc,{upsert:true},function(err,result){
			if (err === null){
				//console.log("Updated editing status");
				//console.log(result);
			}
			else {
				//console.log(err);
			}
		});
	});
}

/*this pull takes 8 sets of coordinates. Payload body format, coordinates as integer pairs
-----"ul":{<upper left coords>}
-----"um":{<upper middle coords>}
-----"ur":{<upper right coords>}
-----"cl":{<center left coords>}
-----"cr":{<center right coords>}
-----"bl":{<bottom left coords>}
-----"bm":{<bottom middle coords>}
-----"br":{<bottom right coords>}

RETURN PACKET WILL FOLLOW SAME CONVENTION IN BODY
*/
var readSurroundingsCallback = function(db,req,res,docs,initCoords){
	//initialize response object
	var responseObject = {};
	console.log("init coords");
	console.log(initCoords);
	//outer loop iterates over required response fieldsreturned matches that have been edited and are owned
	for (tile in coordinatePairs){
		console.log("tile");
		console.log(tile);
		console.log("init coords");
		console.log(initCoords);
		//inner loop iterates over returned matches that have been edited and are owned
		for (doc in docs){
			//if there are custom art assets at a given tile, add that document to the response body
			if ((docs[doc]['xcoord'] - initCoords.x == coordinatePairs[tile]['x']) &&
				 docs[doc]['ycoord'] - initCoords.y == coordinatePairs[tile]['y'])
			{
				responseObject[tile] = docs[doc];
				console.log("match found");
			}
		}
	}
	//send response
	res.setHeader('Content-Type','application/json');
	res.status(200);
	console.log("res status:");
	console.log(JSON.stringify(res._headers))
	res.status(200).send(JSON.stringify(responseObject));
}

app.post('/retrieve',function(req,res){
	var query = {};
	query['xcoord'] = req.body.xcoord;
	query['ycoord'] = req.body.ycoord;
	if (req.body.pw){
		query['pw'] = req.body.pw;
		console.log("pw in da body");
		console.log(req.body.pw);
		console.log("query in retrieve");
		console.log(util.inspect(query));
	}
	else {
		query['pw']="";
		console.log("dere wud no pw so pw now");
	}
	if (!(Number.isInteger(query['xcoord'])&&Number.isInteger(query['ycoord']))){
		console.log("NOT A FUCKIN NUMBER FOR SOME REASON. THE QUERY M'LORD:");
		console.log(util.inspect(query));
		res.status(527).send("Tile coordinates invalid or out of bounds.");
		return;
	}
	MongoClient.connect(dbUrl,function(err,db){
		//test for errors, pop out if there are errors present
		assert.equal(null,err);
		console.log("connected succesfully to server");
		//perform lookup
		console.log("rye b4 query");
		console.log(util.inspect(query));
		findDocument(db,query,req,res,findCallback);
	});
});

app.post('/readpull',function(req,res){
	console.log(util.inspect(req.body));
	var query = {};
	var variableArray = new Array();
	//iteratively create variableArray
	var initCoords = {};
	initCoords.x = req.body.cl.x + 1;
	initCoords.y = req.body.cl.y;
	for (key in req.body){
		var tempCoords = {};
		tempCoords['xcoord'] = req.body[key]['x'];
		tempCoords['ycoord'] = req.body[key]['y'];
		variableArray.push(tempCoords);
	}
	console.log(util.inspect(variableArray));
	query['$or'] = variableArray;
	console.log(util.inspect(query));
	MongoClient.connect(dbUrl,function(err,db){
		//test for errors, pop out if there are errors present
		assert.equal(null,err);
		console.log("connected succesfully to server");
		//perform lookup
		findDocument(db,query,req,res,readSurroundingsCallback,initCoords);
	});
	return;
});

//callback function for the initial pull of 25 tile assets
var initPullCallback = function(db,req,res,docs,initCoords){
	//send response
	res.setHeader('Content-Type','application/json');
	res.status(200);
	res.status(200).send(JSON.stringify(docs));
}

/*this pulls a block of 25 tiles surrounding the current tile. Used for origin pull
  at start of game, or when a user enacts teleportation. The data packet is simpy the
  tile cooridnate of the central tile in the 25 tile array.*/
app.post('/initpull',function(req,res){
	//log request body for debug
	console.log(util.inspect(req.body));
	//constuct query argument
	var query = {};
	var variableArray = new Array();
	var initCoords = {};
	initCoords.x = req.body.x;
	initCoords.y = req.body.y;
	for (key in initPullPairs){
		var tempCoords = {};
		//apply adjustment factor for every tile in the 25 tile buffer, then add to query
		tempCoords['xcoord'] = Number.parseInt(initCoords.x) + initPullPairs[key]['x'];
		tempCoords['ycoord'] = Number.parseInt(initCoords.y) + initPullPairs[key]['y'];
		variableArray.push(tempCoords);
	}
	console.log(util.inspect(variableArray));
	query['$or'] = variableArray;
	console.log(util.inspect(query));
	MongoClient.connect(dbUrl,function(err,db){
		//test for errors, pop out if there are errors present
		assert.equal(null,err);
		console.log("connected succesfully to server");
		//perform lookup
		findDocument(db,query,req,res,initPullCallback,initCoords);
	});
	return;
});

//callback function that populates the adjusted coordinates
var dynamicPullCallback = function(db,req,res,docs,initCoords,setname){
	console.log("init coords");
	console.log(initCoords);
	//send response
	res.setHeader('Content-Type','application/json');
	res.status(200);
	console.log("res status:");
	console.log(JSON.stringify(res._headers));
	console.log(JSON.stringify(docs));
	res.status(200).send(JSON.stringify(docs));
};

//helper function that takes a type of pull and init coords as arguments; then pulls the correct set
var pullHelper = function(req,res,setname,initCoords){
	console.log("target set:");
	console.log(util.inspect(pullSets[setname]));
	console.log();
	var query = {};
	var variableArray = new Array();
	for (var i = 0 ; i < 5 ; i += 1){
		var tempCoords = {};
		tempCoords['xcoord'] = Number.parseInt(initCoords.x) + pullSets[setname][i]['x'];
		tempCoords['ycoord'] = Number.parseInt(initCoords.y) + pullSets[setname][i]['y'];
		console.log("temp coords");
		console.log(util.inspect(tempCoords));
		variableArray.push(tempCoords);
	}
	console.log(util.inspect(variableArray));
	query['$or'] = variableArray;
	console.log(util.inspect(query));
	MongoClient.connect(dbUrl,function(err,db){
		//test for errors, pop out if there are errors present
		assert.equal(null,err);
		console.log("connected succesfully to server");
		//perform lookup
		findDocument(db,query,req,res,dynamicPullCallback,initCoords,setname);
	});
};

//callbacks for editcheck and pwcheck functions
var editCheckCallback = function(db,req,res,docs,initCoords){
	//if no match, this tile is good to edit. (coordinates in bounds verified earlier)
	var payload = {};
	if (docs.length === 0 || docs.length === undefined){
		payload.message = "Tile available for immediate edit: no previous owner";
		//create the tile
		newTile = {};
		newTile.xcoord = initCoords.xcoord;
		newTile.ycoord = initCoords.ycoord;
		var coords = {};
		coords.xcoord = initCoords.xcoord;
		coords.ycoord = initCoords.ycoord;
		newTile.pw = "";
		newTile.isBeingEdited = true;
		//add it to the db
		insertDocumentNoCallback(db,newTile,coords,res);
		payload.xcoord = initCoords.xcoord;
		payload.ycoord = initCoords.ycoord;
		res.status(224).send(JSON.stringify(payload));
	}
	//if previously edited, check for a password. If password is not blank, prompt
	//user to enter password with response.
	else if (docs.length === 1){
		//make sure not to pass doc directly. since it contains password
		payload.xcoord = docs[0]['xcoord'];
		payload.ycoord = docs[0]['ycoord'];
		//these logic checks will not be null after length is confirmed to be one
		if (docs[0]['isBeingEdited'] === true){
			//notify of document being edited
			console.log("schtuff dun gettin edited");
			payload.message = "This tile is currently being edited by another player.";
			res.status(242).send(JSON.stringify(payload));
		}
		//if password is blank, send an approval to edit
		else if (docs[0]['pw'] === ''){
			console.log("no dadgum password man, go hed");
			payload.message = "No password set on this tile: edit OK.";
			console.log("224 loggie");
			console.log(util.inspect(payload));
			res.status(224).send(JSON.stringify(payload));
		}
		//else password is set. Tell client to collect user password and compare
		//in password check middleware.
		else {
			console.log("we in the realm of the password check.");
			payload.message = "Please enter the password for this tile to begin editing.";
			payload.xcoord = docs[0]['xcoord'];
			payload.ycoord = docs[0]['ycoord'];
			res.status(233).send(JSON.stringify(payload));
		}
	}
	else {
		res.status(500);
		res.send();
	}
};

var pwCheckCallback = function(db,req,res,docs,args){
	//if no match, this tile is good to edit. (coordinates in bounds verified earlier)
	var payload = {};
	if (docs.length === 1){
		//these logic checks will not be null after length is confirmed to be one
		payload.xcoord = docs[0]['xcoord'];
		payload.ycoord = docs[0]['ycoord'];
		if (docs[0]['isBeingEdited'] === true){
			//notify of document being edited
			payload.message = "This tile is currently being edited by another player.";
			res.status(242).send(JSON.stringify(payload));
		}
		//if password matches, send approval to edit
		else if (docs[0]['pw'] === args.pw || docs[0][pw] === ''){
			payload.message = "Passwords match.";
			res.status(224).send(JSON.stringify(payload));
		}
		//else password is set. Tell client to collect user password and compare
		//in password check middleware.
		else {
			payload.message = "The password does not match.";
			payload.xcoord = args.xcoord;
			payload.ycoord = args.ycoord;
			res.status(299).send(JSON.stringify(payload));
		}
	}
	else {
		payload.message = "The password does not match.";
		payload.xcoord = args.xcoord;
		payload.ycoord = args.ycoord;
		res.status(299);
		res.send(JSON.stringify(payload));
	}
};

/*This function compares the password of an owned cell to that provided by a client:
Data structure is:
{pw:password,xcoord:x,ycoord:y}
*/
app.post('/pwcheck',function(req,res){
	var args = {};
	args.xcoord = req.body.x;
	args.ycoord = req.body.y;
	args.pw = req.body.pw;
	MongoClient.connect(dbUrl,function(err,db){
		//test for errors, pop out if there are errors present
		assert.equal(null,err);
		console.log("connected succesfully to server");
		//perform lookup
		findDocumentPW(db,args,req,res,pwCheckCallback,args);
	});
});

//callback for the final submission password check
var finalPwCheckCallback = function(db,req,res,docs,args){
	//if no match, this tile is good to edit. (coordinates in bounds verified earlier)
	var payload = {};
	if (docs.length === 1){
		if (docs[0]['pw'] === args.pw || docs[0][pw] === ''){
			payload.message = "Passwords match.";
			res.status(224).send(JSON.stringify(payload));
		}
		//else password is set. Tell client to collect user password and compare
		//in password check middleware.
		else {
			payload.message = "The password does not match.";
			payload.xcoord = args.xcoord;
			payload.ycoord = args.ycoord;
			res.status(299).send(JSON.stringify(payload));
		}
	}
	else {
		payload.message = "The password does not match.";
		payload.xcoord = args.xcoord;
		payload.ycoord = args.ycoord;
		res.status(299);
		res.send(JSON.stringify(payload));
	}
};

//same as pwcheck middleware but disregards editing status as it will always be true
app.post('/finalpwcheck',function(req,res){
	var args = {};
	args.xcoord = req.body.x;
	args.ycoord = req.body.y;
	args.pw = req.body.pw;
	MongoClient.connect(dbUrl,function(err,db){
		//test for errors, pop out if there are errors present
		assert.equal(null,err);
		console.log("connected succesfully to server");
		//perform lookup
		findDocumentPW(db,args,req,res,finalPwCheckCallback,args);
	});
});

/* This function is involved in setting a password for the first time. It is only
   used wehen the password is set, not every time a user decides to keep a tile
   edit-locked with a password.
   {xcoord,ycoord,pw,newpw}
*/
app.post('/pwset',function(req,res){
	//query on the old password as a password check
	var args = {};
	args.xcoord = req.body.xcoord;
	args.ycoord = req.body.ycoord;
	if (req.body.pw)
	{
		args.pw = req.body.pw;
	}
	else {
		args.pw = '';
	}
	if (args.pw === null || args.pw === undefined){
		args.pw = '';
	}
	//the set field will be the new password

	if (!(req.body.newpw === undefined) && !(req.body.newpw === null)){
		var setField = {$set : {pw : req.body.newpw}};
	}
	else {
		var setField = {$set : {pw : ''}};
	}
	MongoClient.connect(dbUrl,function(err,db){
		//test for errors, pop out if there are errors present
		assert.equal(null,err);
		console.log("connected succesfully to server");
		//perform lookup
		updatePw(db,args,setField,req,res,pwSetCallback,args);
	});
});

//helper function updatePw filters database and changes applicable setFields 
var updatePw = function(db,filter,setField,req,res,callback,args){
	var collection = db.collection('tiles');
	//insert the document
	console.log("About to insert:");
	console.log(util.inspect(setField));
	console.log("pwd update filters:");
	console.log(util.inspect(filter));
	collection.update(filter,setField,{upsert:false},function(err,result){
		if (err === null){
			console.log(util.inspect(result));
			callback(db,res);
		}
		else {
			console.log(err);
			callback(db,res,err);
		}
	});
}

//callback function for password update
var pwSetCallback = function (db,res,err){
	if (err){
		res.status(588).send(JSON.stringify(err));
	}
	else {
		res.status(200).send();
	}
}

/*this function checks to see if a cell is owned at all, or, if it is, is it currently being edited.
If no docs are returned, then create a doc with the tile coordinates and 
Data structure is:
{xcoord:x,ycoord:y}
*/
app.post('/editcheck',function(req,res){
	var initCoords = {};
	initCoords.xcoord = req.body.xcoord;
	initCoords.ycoord = req.body.ycoord;
	MongoClient.connect(dbUrl,function(err,db){
		//test for errors, pop out if there are errors present
		assert.equal(null,err);
		console.log("connected succesfully to server");
		//perform lookup
		findDocumentPW(db,initCoords,req,res,editCheckCallback,initCoords);
	});
});

//multiple routes using helper function.
app.post('/pulltop',function(req,res){
	console.log(req.body);
	console.log(req.body.x);
	console.log(req.body.y);
	var initCoords = {};
	initCoords.x = req.body.x;
	initCoords.y = req.body.y;
	pullHelper(req,res,'top pull',initCoords);
});

app.post('/pullbottom',function(req,res){
	console.log(req.body);
	console.log(req.body.x);
	console.log(req.body.y);
	var initCoords = {};
	initCoords.x = req.body.x;
	initCoords.y = req.body.y;
	pullHelper(req,res,'bottom pull',initCoords);
});

app.post('/pullleft',function(req,res){
	console.log(req.body);
	console.log(req.body.x);
	console.log(req.body.y);
	var initCoords = {};
	initCoords.x = req.body.x;
	initCoords.y = req.body.y;
	pullHelper(req,res,'left pull',initCoords);
});

app.post('/pullright',function(req,res){
	console.log(req.body);
	console.log(req.body.x);
	console.log(req.body.y);
	var initCoords = {};
	initCoords.x = req.body.x;
	initCoords.y = req.body.y;
	pullHelper(req,res,'right pull',initCoords);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
