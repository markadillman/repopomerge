/*

Antonina (Toni) York
Lucia Blackwell
Mark Dillman
OSU CS 467 Spring 2017
Capstone Team Aries
Main Game Script
game.js

Uses CraftyJS to create game "scenes" and run
the client side of The Blank.

*/

var titleString = "THE BLANK";
var creditsText = titleString + "<br>" +
	"a clone of Evan Balster's original game titled \"Infinite Blank\"<br>" +
	"developed as a capstone project for OSU's CS 467 in the Spring 2017 term<br><br>" +
	"CAPSTONE TEAM ARIES<br>" +
	"Game Developer: Lucia Blackwell<br>" +
	"Network Developer: Mark Dillman<br>" +
	"Art Developer: Antonina (Toni) York<br><br>" +
	"BETA TESTING<br>" +
	"The Folks at Polital Enterprises<br>" +
	"The Nerdfighers of ANF<br><br>" +
	"GAME MUSIC<br>" +
	"Antonina (Toni) York";


var tileWidth = 600;
var tileHeight = 350;
var canvasEdge = 50;
var screenWidth = tileWidth + (2 * canvasEdge);
var screenHeight = tileHeight + (2 * canvasEdge);	
var currentCenterX = 0;
var currentCenterY = 0;
var currentUpperLeftX = 0;
var currentUpperLeftY = 0;
var spriteWidth = 15;
var spriteHeight = 30;
var avatarMultiplier = 5.8; // factor between avatar size and size of oval in drawing tool
var playerSpawnX = canvasEdge + 365;	// spawn in hole in tree
var playerSpawnY = canvasEdge + 75;
var playerSpawnDelay = 1000; // ms to wait before spawning player on first world entry
var titleTextColor = '#373854';
var selectedButtonColor = '#99CCFF';
var panTime = 500; // ms

//BEGIN CODE ADDED BY MARK

//global value holder for socket.io socket and socketId
var socket;
var socketId;
var playerGlob;
//global constant to determine number of logical frames per network frame
const netFrameRate = 50;
var playerPositionMap = {};
//END CODE ADDED BY MARK

//MARK ADDED DATA STRUCTURE THAT OUTLINES THE ENVIRONMENT TILES LOADED
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
						"0,0":{"x":0,"y":0}, //CENTER TILE, ALL OTHERS RELATIVE TO THIS
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
var svgPrefix = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">";
var svgPostfix = "</svg>";

// Toni added a flag for being on first load of avatar or not
var firstWorldEntry = true;
// and globals to track player's current position
var currentPlayerX;
var currentPlayerY;

// Toni added variables for the avatar carousel
var numAvatars = 0;
var myAvatars = "myAvatars";
var libraryAvatars = "libararyAvatars";
var carouselContents = myAvatars;
var carouselStage;
var carouselData = [];
var carouselIndex = 0;
// Toni is very sorry this is so ugly, but it's an easy way to have the svg string for the New Avatar image
const newAvatarImg = "<!--FROM THE BLANK--><svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">" +
		"<clipPath id=\"avatarClipPath\"><ellipse cx=\"300\" cy=\"175\" rx=\"87\" ry=\"174\">" + 
		"</ellipse></clipPath><g xmlns=\"http://www.w3.org/2000/svg\" id=\"drawingGroup\" " +
		"style=\"opacity: 1\" clip-path=\"url(#avatarClipPath)\"><polyline id=\"o1\" " +
		"points=\"234.5 252 229.5 117 264.5 249 266.5 118\" style=\"fill: none; stroke: " +
		"#000000; stroke-width: 5\"/><polyline id=\"o2\" points=\"307.5 170 278.5 169 278.5 245 " +
		"304.5 243\" style=\"fill: none; stroke: #000000; stroke-width: 5\"/><polyline id=\"o3\" " +
		"points=\"278.5 207 294.5 207\" style=\"fill: none; stroke: #000000; stroke-width: 5\"/>" +
		"<polyline id=\"o4\" points=\"319.5 162 324.5 243 342.5 205 358.5 241 375.5 163\" " +
		"style=\"fill: none; stroke: #000000; stroke-width: 5\"/><polygon id=\"o5\" points=\"267.5 " +
		"56 324.5 130 336.5 121 278.5 45\" style=\"fill: none; fill-rule: evenodd; stroke: #000000; " +
		"stroke-width: 5\"/><polygon id=\"o6\" points=\"323.5 129 348.5 149 336.5 120\" style=\"fill: " +
		"#000000; fill-rule: evenodd; stroke: #000000; stroke-width: 5\"/><polygon id=\"o7\" points=\"259.5 " +
		"49 272.5 36 276.5 45 267.5 54\" style=\"fill: #000000; fill-rule: evenodd; stroke: #000000; " +
		"stroke-width: 5\"/><polyline id=\"o8\" points=\"243.5 269 357.5 267\" style=\"fill: none; " +
		"stroke: #000000; stroke-width: 5\"/><polyline id=\"o9\" points=\"259.5 288 340.5 287\" " +
		"style=\"fill: none; stroke: #000000; stroke-width: 5\"/><polyline id=\"o10\" " +
		"points=\"269.5 311 326.5 313\" style=\"fill: none; stroke: #000000; stroke-width: " +
		"5\"/></g><g xmlns=\"http://www.w3.org/2000/svg\" id=\"platformsGroup\" " +
		"style=\"visibility: hidden\"/></svg>";
// Toni used this for testing the size/shape of avatars rendered in Crafty
const ovalAvatarImg = "<!--FROM THE BLANK--><svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">" +
		"<clipPath id=\"avatarClipPath\"><ellipse cx=\"300\" cy=\"175\" rx=\"87\" " +
		"ry=\"174\"></ellipse></clipPath><g xmlns=\"http://www.w3.org/2000/svg\" " +
		"id=\"drawingGroup\" style=\"opacity: 1\" clip-path=\"url(#avatarClipPath)\">" +
		"<rect id=\"o1\" x=\"186.5\" y=\"0\" width=\"205\" height=\"351\" " +
		"style=\"fill: #000000; stroke: #000000; stroke-width: 5\"/></g>" +
		"<g xmlns=\"http://www.w3.org/2000/svg\" id=\"platformsGroup\" " +
		"style=\"visibility: hidden\"/></svg>"


//this will load socket.io from CDN
function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);

    //create the socket io and assign to global variable
    //BEGIN CODE ADDED BY MARK
	//create socket.io connection DIFFERENT ON LOCAL AND SERVER. ADJUST.
}

Game =
{
	start: function()
	{
		Crafty.init(screenWidth, screenHeight, document.getElementById('gameDiv'));
		Crafty.background(bgroundColor);

		// Start screen scene
		Crafty.defineScene('HomeScreen', function()
		{
			// Title
			Crafty.e('myText, 2D, DOM, Text')
				.attr({x: 0, y: screenHeight / 3,
					   w: screenWidth, h: screenHeight})
				.text(titleString)
				.textFont({family: 'Trebuchet MS',
						   size: '50px',
						   weight: 'bold'})
				.textColor(titleTextColor)
				.textAlign('center');

			// start Toni's code
			// switch to using clickable buttons on this screen
			// button to see help screen
			Crafty.e('myButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: (screenWidth / 2) - 50,
					y: screenHeight - 220,
					w: 100, h: 25})
				.color(bgroundColor)
				.text('Help')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', function(MouseEvent) {
					displayHelpScreen();
				});

			// button to see credits screen
			Crafty.e('myButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: (screenWidth / 2) - 50,
					y: screenHeight - 190,
					w: 100, h: 25})
				.color(bgroundColor)
				.text('Credits')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', function(MouseEvent) {
					Crafty.enterScene('CreditsScreen');
				});

			// button to start playing game
			Crafty.e('myButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: (screenWidth / 2) - 50,
					y: screenHeight - 160,
					w: 100, h: 25})
				.color(bgroundColor)
				.text('Play')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', function(MouseEvent) {
					Crafty.enterScene('SetupScreen');
				});
			// end Toni's code
		});


		// start Toni's code
		// credits screen
		Crafty.defineScene('CreditsScreen', function() {	
			// debug message
			if (debugging) {
				console.log("Displayed credits scene.");
			}
			
			// text
			Crafty.e('myText, 2D, DOM, Text')
				.attr({x: 0, y: canvasEdge, w: screenWidth, h: screenHeight})

				.text(creditsText)
				.textFont({family: 'Trebuchet MS', size: '18px'})
				.textAlign('center');

			// button to return to home screen
			Crafty.e('myButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: (screenWidth / 2) - 50, y: screenHeight - canvasEdge,
					   w: 100, h: 25})
				.color(bgroundColor)
				.text('Done')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', function(MouseEvent) {
					Crafty.enterScene('HomeScreen');
	
					// debug message
					if (debugging) {
						console.log("Hid credits scene.");
					}
				});
		});
		// end Toni's code

		// Player setup screen scene
		Crafty.defineScene('SetupScreen', function()
		{
			// start Toni's code
			// left arrow button
			Crafty.e('myButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: screenWidth/6 + 70, y: screenHeight/3 + canvasEdge, w: 40, h: 100})
				.color(bgroundColor)
				.text('<')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '80px'})
				.bind('Click', doLeftButtonClick);

			// right arrow button
			Crafty.e('myButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: (screenWidth/6)*5 - 110, y: screenHeight/3 + canvasEdge, w: 40, h: 100})
				.color(bgroundColor)
				.text('>')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '80px'})
				.bind('Click', doRightButtonClick);

			// button to load the carousel with "My Avatars" data
			// these are the user-drawn avatars stored via cookie
			Crafty.e('myButton, myAvatarButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: canvasEdge*2 + 30, y: 20, w: 200, h: 25})
				.color(selectedButtonColor)
				.text('Viewing My Avatars')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', myAvatarButtonClick);

			// button to load the carousel with "Avatar Library" data
			// the default avatars we're offering will always be the first of the ones shown here
			Crafty.e('myButton, myLibraryButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: screenWidth - canvasEdge*3 - 200, y: 20, w: 230, h: 25})
				.color(bgroundColor)
				.text('View Avatar Library')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', myLibraryButtonClick);			

			// button to edit the avatar currently selected in the carousel
			// if the "new avatar" element then load editor blank
			// else load chosen avatar's data
			Crafty.e('myButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: screenWidth/2 - 75, y: canvasEdge, w: 150, h: 25})
				.color(bgroundColor)
				.text('Edit Avatar')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', myEditAvatarClick);

			// button to send the avatar currently selected in the carousel to the library
			// only visible/clickable when in "View My Avatars" mode
			Crafty.e('myButton, mySubmitButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: screenWidth/2 - 200, y: canvasEdge + 25, w: 400, h: 25})
				.color(bgroundColor)
				.text('Submit Avatar to Public Library')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', submitAvatarToLibrary);

			// button to delete the avatar currently selected in the carousel from the local storage
			// only visible/clickable when in "View My Avatars" mode
			Crafty.e('myButton, myDeleteButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: screenWidth/2 - 100, y: canvasEdge + 50, w: 200, h: 25})
				.color(bgroundColor)
				.text('Delete Avatar')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', deleteLocalAvatar);

			// add help and quit clickable buttons to this scene
			// because honestly the hotkeys were a nightmare in the world / gameplay scene
			// button to view help screen
			Crafty.e('myButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: (screenWidth / 2) - 50, y: screenHeight - 75, w: 100, h: 25})
				.color(bgroundColor)
				.text('Help')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', displayHelpScreen);

			// button to return to home screen
			Crafty.e('myButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: (screenWidth / 2) - 50, y: screenHeight - 50, w: 100, h: 25})
				.color(bgroundColor)
				.text('Quit')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', function(MouseEvent) {
					Crafty.enterScene('HomeScreen');
				});

			// button to enter game world
			Crafty.e('myButton, myEnterButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: (screenWidth / 2) - 75, y: screenHeight - 25, w: 150, h: 25})
				.color(bgroundColor)
				.text('Enter the Blank')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', doEnterButton);
				
			// the carousel's stage / selected / shown avatar
			carouselStage = Crafty.e('2D, Canvas, Sprite')
				.attr({x: screenWidth/6 + canvasEdge*4 - canvasEdge/2, y: screenHeight/3 - 15,
					   z: 1});
			// load initial data to carousel
			loadMyAvatarsToCarousel(0);
			// end Toni's code
		});
		
		// Main game world scene
		Crafty.defineScene('World', function()
		{
			// start Toni's code
			// set playing flag from tool.js
			playing = true;
			
			//CANNOT FIGURE OUT WHERE TO PUT THIS FOR PROPER SCOPE. LET'S TRY HERE
			socket = io('http://192.168.2.50:8080');
			socket.on('assign id', function(data){
				socketId = data.id;
				console.log("GOT SOCKET ID:");
				console.log(data.id);
			});

			// load world art using global tile coords from tool.js
			initAssetRequest(xTile, yTile,socket);
			// this will now call the code to load platforms and player, too

			//BEGIN CODE ADDED BY MARK
	    	//this will trigger the player to call the function that adds to list of known players
	    	socket.on('new player',function(data){
	        	//actual event trigger
	       		playerGlob.trigger('NewPlayer',data);
	    	});
	    	//this will trigger when server responds with updated positions
	    	socket.on('position response',function(data){
	       		//actual event trigger
	       		playerGlob.trigger('UpdateMap',data);
	    	});
	    	//this will trigger when a player logs off
	    	socket.on('player logoff',function(data){
	       		//actual event trigger
	       		playerGlob.trigger('OtherPlayerLogoff',data);
	    	});
	    	//END CODE ADDED BY MARK		
		}, function() {
			// start Toni's code
			// adding an uninit function
			
			// set flag from tool.js
			playing = false;
			
			// clear out platforms and player
			Crafty('Platform').each().destroy();
			Crafty('Player').destroy();
			
			// end Toni's code
		});

		// Mark's code was here until Toni moved it down below
		// now we can call those helper functions from tool.js as well

		// Start game on home screen
		Crafty.enterScene('HomeScreen');

	}
}

// loadPlatforms code moved here
function loadPlatforms() {
	// Platforms
	Crafty.e('Platform, 2D, Canvas, Color')
		.attr({x: 0, y: 250, w: 250, h: 10})
		.color('green');
	Crafty.e('Platform, 2D, Canvas, Color')
		.attr({x: 400, y: 300, w: 250, h: 10})
		.color('green');
	Crafty.e('Platform, 2D, Canvas, Color')
		.attr({x: 130, y: 450, w: 100, h: 10})
		.color('green');
	Crafty.e('Platform, 2D, Canvas, Color')
		.attr({x: 170, y: 540, w: 100, h: 10})
		.color('green');
	// Toni added a platform under the spawn point
	Crafty.e('Platform, 2D, Canvas, Color')
		.attr({x: playerSpawnX - 35, y: playerSpawnY + 125, w: 100, h: 10})
		.color('green');
	// Toni added platforms to allow us to get to the top 3 tiles for now
	Crafty.e('Platform, 2D, Canvas, Color')
		.attr({x: playerSpawnX - 50, y: playerSpawnY - 30, w: 100, h: 10})
		.color('green');
	Crafty.e('Platform, 2D, Canvas, Color')
		.attr({x: -1000, y: 10, w: 2000, h: 10})
		.color('green');
	// Toni added a platform to allow us to get to the middle 2 outside tiles for now
	Crafty.e('Platform, 2D, Canvas, Color')
		.attr({x: -1000, y: canvasHeight - canvasEdge, w: 2000, h: 10})
		.color('green');
	// Floor
	Crafty.e('Platform, 2D, Canvas, Color')
		.attr({x: -4000, y: 590, w: 8000, h: 10})
		.color('green');
		
	// set platform z between background and avatar
	Crafty('Platform').each(function() {
		this.z = 1;
	});
		
	// debug message
	if (debugging) {
		console.log("Loaded platforms.");
	}
}

// loadPlayer code moved here
function loadPlayer(argsocket) {
	// Toni added code to set player position
	var xCoord;
	var yCoord;
	if (firstWorldEntry) {
		xCoord = playerSpawnX;
		yCoord = playerSpawnY;
		firstWorldEntry = false;
	} else {
		xCoord = currentPlayerX;
		yCoord = currentPlayerY;
	}
	
	// Player sprite
	var player = Crafty.e('Player, 2D, Canvas, Color, Multiway, Jumper, Gravity')
		
		// Initial position and size
		// inside the hole in the tree
		.attr({x: xCoord, y: yCoord})				
		
		// Enable 2D movement 
		// Toni modified to be via Multiway instead,
		// which required referencing Crafty's code for how Twoway works
		.multiway({x: 200}, {RIGHT_ARROW: 0, LEFT_ARROW: 180})
		// Set platforms to stop falling player
		.gravity('Platform')
		.gravityConst(600)
		// Bind spacebar to jump action
		.jumper(400, [Crafty.keys.SPACE])

		// Allow player to drop through platforms
		.bind('KeyDown', function(e)
		{
			// Check for ability to move
			if (mode == gameMode && playing == true)
			{
				this.enableControl();
			}
			else
			{
				this.disableControl();
			}
			// Toni added mode conditions below b/c it was still using down arrow while in art mode
			if(e.key == Crafty.keys.DOWN_ARROW && mode == gameMode && playing == true)
			{
				this.antigravity();
				this.gravity('Platform');
			}
		})
		.bind('KeyUp', function(e)
		{
			// Toni added mode conditions below b/c it was still using down arrow while in art mode
			if(e.key == Crafty.keys.DOWN_ARROW && mode == gameMode && playing == true)
			{
				this.gravity('Platform');
			}

			// start Toni's code
			// bind the gameplay mode hotkeys
			if (mode == gameMode) { // only read these if in gameplay mode
				if (e.key == Crafty.keys.E) {
					if (verboseDebugging) {
						console.log("Go go gadget edit mode!");
						console.log("current (x,y)");
						console.log(Math.floor(currentUpperLeftX / tileWidth));
						console.log(Math.floor(currentUpperLeftY / tileHeight));
					}
					// call function in tool.js
					doTileEdit(Math.floor(currentUpperLeftX / tileWidth),
							   Math.floor(currentUpperLeftY / tileHeight));
				}
				if (e.key == Crafty.keys.M) {
					// ### switch to map mode
					// remember to have map mode have a way to switch
					// back on another M keypress
				}
				if (e.key == Crafty.keys.Q) {
					// quit to home screen
					// ### server cleanup stuff here?
					doQuitToHomeScreen(); // tool.js cleanup
					Crafty.enterScene('HomeScreen');
				}
				if (e.key == Crafty.keys.T) {
					// drop a teleportation marker
					// ### check to make sure one doesn't already exist at these coordinates?
					// ### create marker at player's current coordinates in the world
				}
				if (e.key == Crafty.keys.W) {
					// toggle wall view mode
					
					// toggle platforms using z index
					Crafty('Platform').each(function() {
						this.z *= -1;
					});
					
					// ### consider adding fade to background art
					// and toggling that here
					// just adding Color component to the art and setting its
					// strength doesn't work... already tried that
					// will have to do it in the svg instead and reload the art
					// sounds like a pain, probably won't bother
					
					// debug message
					if (debugging) {
						console.log("Toggled wall view mode.");
					}
				}
			}
			// end Toni's code
		})
		//ADDED BY MARK, this code will be triggered once player is in world
	    .bind('SceneLoaded',function(eventData){
			//function to handle the initial admission to the player pool
			if (!(eventData === null)){
				if (verboseDebugging)
				{
					console.log("in scene loaded event. Event data:");
					console.log(eventData);
					console.log("Socket info");
					console.log(argsocket);
				}
				argsocket.emit('init position',{x : eventData.x , y : eventData.y, avatar: eventData.avatar});
			}
	    })
	    .bind('NewPlayer',function(eventData){
	      	if (!(eventData.id === socketId)){
	      		//this function will either create a different colored rectangle or, in the future,
	      		//load the player's avatar into memory and start rendering it over their hitbox
	      		var otherPlayer = Crafty.e('2D, DOM, Color, Twoway, Gravity')
	      			// Initial position and size
	      			.attr({x: eventData.x, y: eventData.y, w: 10, h: 50})
	      			// Color of sprite (to be replaced)
	      			.color('#F41')
	      			//.twoway(200)
	      			// Set platforms to stop falling other player
	      			//.gravity('Platform')
	      			//.gravityConst(600);
	      			//AVATAR STUFF

	      		//add a field that ties this player to an id
	      		otherPlayer.friendId = eventData.id;
	      		//set the Crafty id as a field
	      		otherPlayer.craftyId = otherPlayer.getId();
	      		//add this to player position map
	      		playerPositionMap[otherPlayer.friendId] = otherPlayer.craftyId;
	      		if (verboseDebugging)
	      		{
	      			console.log("OTHER PLAYER");
	      			console.log(otherPlayer);
	      			console.log("MAP ON NEW LOGIN.");
	      			console.log(playerPositionMap);
	      		}
	      	}
	      	else {
	      		if (verboseDebugging)
	      		{
	      			console.log("id's equal");
	      		}
	      	}
	    })
		//this removes a recently logged off player from the position map
	    .bind('OtherPlayerLogoff',function(eventData){
	    	delete playerPositionMap[eventData.id];
	      	console.log("Player position map post logoff");
	      	console.log(playerPositionMap);
	    })
	    //update the position map with new data. Event data is complete wherabouts of active players keyed by id
	    .bind('UpdateMap',function(eventData){
	      	if (verboseDebugging)
	      	{
	      		console.log("event data");
	      		console.log(eventData);
	      	}
	      	//for each player, update position if entity exists
	      	for (key in eventData){
	      		if (verboseDebugging)
	      		{
	      			console.log("player position map");
	      			console.log(playerPositionMap);
	      			console.log("socket id");
	      			console.log(socketId);
	      		}
	      		//if the ID is not in the current mapping data structure
	      		if (playerPositionMap[key] === undefined && !(key === socketId)){
	      			if (verboseDebugging)
	      			{
	      				console.log("SHOULDNT BE HERE WITHOUT ANOTHER PLAYER");
	      			}
	      			//this function will either create a different colored rectangle or, in the future,
	      			//load the player's avatar into memory and start rendering it over their hitbox
	      			var oldPlayer = Crafty.e('2D, DOM, Color, Twoway, Gravity')
	      				// Initial position and size
	      				.attr({x: eventData[key]['x'], y: eventData[key]['y'], w: 10, h: 50})
	      				// Color of sprite (to be replaced)
	      				.color('#F41')
	      				//.twoway(200) //EXPERIMENTAL EDIT
	      				// Set platforms to stop falling other player
	      				//.gravity('Platform')
	      				//.gravityConst(600);
	      			//add a field that ties this player to an id
	      			oldPlayer.friendId = key;
	      			//set the Crafty id as a field
	      			oldPlayer.craftyId = oldPlayer.getId();
	      			//add this to player position map
	      			playerPositionMap[oldPlayer.friendId] = oldPlayer.craftyId;			
	      		}
	      		//if player is pre-existing player that does not have an avatar, make one
	      		else {
	      			//KEEP BELOW HERE AFTER PASTE
	      			if (verboseDebugging)
	      			{
	      				console.log("SHOULD BE HERE NOW");
	      				console.log(playerPositionMap[key]);
	      			}
	      			//look up crafty entity for this player
	      			var targetPlayer = Crafty(playerPositionMap[key]);
	      			targetPlayer.x = eventData[key]['x'];
	      			targetPlayer.y = eventData[key]['y'];
	      			if (verboseDebugging)
	      			{
	      				console.log(playerPositionMap);	
	      			}
	      		}
	      	}
	    })
	    //update with new coordinates every second (50 fps)
	    .bind("EnterFrame",function(eventData){
	      	if (eventData.frame % netFrameRate === 0){
	      		//DEBUG
	      		//console.clear();
	      		if (verboseDebugging)
	      		{
	      			console.log("x: " + this.x.toString() + " y : " + this.y.toString() + " id: " + socketId);
	      		}
	      		//END DEBUG
	      		argsocket.emit('changeCoords', {x : this.x , y : this.y , id : socketId});
	      		argsocket.emit('position request');
	      	}
	    })
		// Move camera when player leaves current tile
		.bind('Moved', function()
			{
				// Toni added code to update current player position
				currentPlayerX = this.x;
				currentPlayerY = this.y;
				
				// MARK ADDED get current tile coordinates to orient pull
				// Toni switched these to use the global vars from tool.js
				xTile = Math.floor(currentUpperLeftX / tileWidth);
				yTile = Math.floor(currentUpperLeftY / tileHeight);
				var payload = {'x' : xTile, 'y': yTile};
				if (this.x > currentUpperLeftX + tileWidth)
				{
					currentUpperLeftX = currentUpperLeftX + tileWidth;
					Crafty.viewport.pan(tileWidth, 0, panTime);
					
					// Toni added update of tile coords
					xTile = Math.floor(currentUpperLeftX / tileWidth);
					yTile = Math.floor(currentUpperLeftY / tileHeight);

					// Load assets in outer rightmost "ring" segment
					dynamicPostRequest('/pullright',payload,dynamicPostOnLoad,dynamicError);
					// Destroy assets in outer leftmost "ring" segment
				}
				else if (this.x < currentUpperLeftX)
				{
					currentUpperLeftX = currentUpperLeftX - tileWidth;
					Crafty.viewport.pan(tileWidth*-1, 0, panTime);
					
					// Toni added update of tile coords
					xTile = Math.floor(currentUpperLeftX / tileWidth);
					yTile = Math.floor(currentUpperLeftY / tileHeight);

					// Load assets in outer leftmost "ring" segment
					dynamicPostRequest('/pullleft',payload,dynamicPostOnLoad,dynamicError);
					// Destroy assets in outer rightmost "ring" segment
				}

				if (this.y > currentUpperLeftY + tileHeight)
				{
					currentUpperLeftY = currentUpperLeftY + tileHeight;
					Crafty.viewport.pan(0, tileHeight, panTime);
					
					// Toni added update of tile coords
					xTile = Math.floor(currentUpperLeftX / tileWidth);
					yTile = Math.floor(currentUpperLeftY / tileHeight);

					// Load assets in outer bottom-most "ring" segment
					dynamicPostRequest('/pullbottom',payload,dynamicPostOnLoad,dynamicError);
					// Destroy assets in outer top-most "ring" segment
				}
				else if (this.y < currentUpperLeftY)
				{
					currentUpperLeftY = currentUpperLeftY - tileHeight;
					Crafty.viewport.pan(0, tileHeight*-1, panTime);
					
					// Toni added update of tile coords
					xTile = Math.floor(currentUpperLeftX / tileWidth);
					yTile = Math.floor(currentUpperLeftY / tileHeight);

					// Load assets in outer top-most "ring" segment
					dynamicPostRequest('/pulltop',payload,dynamicPostOnLoad,dynamicError);
					// Destroy assets in outer bottom-most "ring" segment
				}
			});
		
	// start Toni's code
	// generate a URL based on currently selected avatar
	myString = svgPrefix + carouselData[carouselIndex] + svgPostfix; // just in case the server ones need it
	var blobSvg = new Blob([myString],{type:"image/svg+xml;charset=utf-8"});
	var domURL = self.URL || self.webkitURL || self;
	var url = domURL.createObjectURL(blobSvg);

	// put this into the player as its sprite
	// reference my displayAvatarInCarousel function above
	var mySprite = Crafty.sprite(url, {playerSprite: [210, 0, 390, canvasHeight]});
	player.addComponent('playerSprite');
	player.w = 390/avatarMultiplier;
	player.h = canvasHeight/avatarMultiplier;

	if (verboseDebugging)
	{
		console.log("check out the sprite");
		console.log("mySprite");
		console.log(mySprite);
		console.log("myString");
		console.log(myString);
	}
	
	//player should be in front of other graphical assets
	player.z = 2;
	
	//ADDED BY MARK 6-6 bind to global variable
	playerGlob = player;
	//here is where the avatar is packaged and submitted to the server

	if (verboseDebugging){
		console.log("sprite structure");
		console.log(playerGlob)
	}
	//END CODE ADDED BY MARK

	// debug message
	if (debugging) {
		console.log("Loaded player.");
	}

	//trigger the player creation event
	player.trigger('SceneLoaded',{x:player.x,y:player.y,id:socketId,socket:argsocket,avatar:myString});
}

/*start Mark's code, helper functions to fetch rows of 5 assets:
	"top pull" : {{-2,-3},{-1,-3},{0,-3},{1,-3},{2,-3}}, URL: /pulltop
	"bottom pull" : {{-2,3},{-1,3},{0,3},{1,3},{2,3}},   URL: /pullbottom
	"left pull" : {{-3,-2},{-3,-1},{-3,0},{-3,1},{-3,2}},URL: /pullleft
	"right pull" : {{3,-2},{3,-1},{3,0},{3,1},{3,2}}     URL: /pullright
	onload will render the environment into the correct coordinates. Must pass
	the data structure key as an arg to the callback ("top pull", etc.)
*/
function dynamicPostRequest(url,payload,onload,error,args){
	if (verboseDebugging) {
		console.log("Dynamic post payload:");
		console.log(payload);
	}
	var request = new XMLHttpRequest();
	request.open("POST",url,true);
	request.setRequestHeader('Content-Type','application/json; charset=UTF-8');
	//request.responseType = "json";
	request.onload = function(){
		if (request.readyState === 4){
			if (request.status === 200 || request.status === 242) {
				if (args){
					onload(request,args);
				}
				else {
					onload(request);
				}
			} else {
				console.error(request.statusText);
				error(request);
			}
		}
	};
	request.onerror = function(){
		error(request);
	};
	request.send(JSON.stringify(payload));
}

//this will render assets formatted as a returned query from the server
function assetRender(assets,argsocket){
	for (asset in assets){
		//SVG tags added so that it can be a standalone, valid XML file for URL
		var myGroupString = svgPrefix + assets[asset]['svg'] + svgPostfix;
		if (verboseDebugging) {
			console.log("svg");
			console.log(assets[asset]['svg']);
			console.log("svg string in text");
			console.log(myGroupString);
		}
		//generate a URL for this svg grouping
		var blobSvg = new Blob([myGroupString],{type:"image/svg+xml;charset=utf-8"}),
		domURL = self.URL || self.webkitURL || self,
		url = domURL.createObjectURL(blobSvg),	// ### Mark - this and the 2 lines above have commas?
		img = new Image;
		//img.onload = function(){
			if (verboseDebugging) {
				console.log("asset url");
				console.log(url);
			}
			//adjust coordinates
			var tempX = assets[asset]['xcoord'] * tileWidth + canvasEdge;
			var tempY = assets[asset]['ycoord'] * tileHeight + canvasEdge;
			// Toni switched bground from DOM to Canvas b/c it kept rendering on top otherwise
			var bground = Crafty.e('Background, 2D, Canvas, Image')
			.attr({x: tempX, y : tempY, w: tileWidth, h: tileHeight, xTile: asset['xcoord'],
				   yTile : asset['ycoord']}) // was tileX and tileY
			.image(url);
			bground.z = 0;
		//};
		if (verboseDebugging) {
			console.log("blob svg");
			console.log(blobSvg);
		}
		img.src = url;
	}
	// start Toni's code
	// add the calls to update platforms and player here!
	loadPlatforms();
	// use a delay to make *sure* the background is loaded first
	if (firstWorldEntry) {
	Crafty.e('Delay').delay(function(){
			if (debugging) {
				console.log("Waited.");
			}
			loadPlayer(argsocket);
		}, playerSpawnDelay, 0);
	}
	// end Toni's code
}

//request responsetext will be in the format of assets
function dynamicPostOnLoad(request){
	var body = JSON.parse(request.responseText);
	if (verboseDebugging) {
		console.log("response:");
		console.log(body);
	}
	//render new assets in respective tiles
	assetRender(body);
}

function dynamicError(request){
	console.log("ERROR");
	console.log("REQUEST");
	console.log(request);
	console.log("REQUEST STATUS");
	console.log(request.status);
	console.log(request.getAllResponseHeaders());
	console.error(request.statusText);
}

function initAssetRequest(playerX,playerY,argsocket){
	//update player tile (if teleport, this should be called post teleport coords)
	var playerTileX = Math.floor(playerX/tileWidth);
	var playerTileY= Math.floor(playerY/tileHeight);
	var body = {};
	body.x = playerTileX;
	body.y = playerTileY;
	if (verboseDebugging) {
		console.log("Init request center tile:");
		console.log(body);
	}
	dynamicPostRequest('/initpull',body,initAssetRender,dynamicError,argsocket);
}

function initAssetRender(request,argsocket){
	//parse the response body and render it
	var body = JSON.parse(request.responseText);
	if (verboseDebugging) {
		console.log("response:");
		console.log(body);
	}
	//render new assets in respective tiles
	assetRender(body,argsocket);
}
// end Mark's code

// start Toni's code
// avatar carousel scene helper functions
function doLeftButtonClick() {
	
	// decrement index, wrap if necessary
	carouselIndex -= 1;
	if (carouselIndex < 0) {
		carouselIndex += carouselData.length;
	}
	
	// display at that index if the data exists
	displayAvatarInCarousel(carouselData[carouselIndex]);
	
	// toggle buttons
	toggleButtonsOnNew();
	
	// debug message
	if (debugging) {
		console.log("Moved left one spot in the avatar carousel.");
	}
}
function doRightButtonClick() {
	
	// increment index, wrap if necessary
	carouselIndex += 1;
	if (carouselIndex >= carouselData.length) {
		carouselIndex -= carouselData.length;
	}
	
	// display at that index
	displayAvatarInCarousel(carouselData[carouselIndex]);
	
	// toggle buttons
	toggleButtonsOnNew();
	
	// debug message
	if (debugging) {
		console.log("Moved right one spot in the avatar carousel.");
	}
}
function myAvatarButtonClick() {
	// swap view buttons
	Crafty('myLibraryButton').color(bgroundColor);
	Crafty('myLibraryButton').text('View Avatar Library');
	Crafty('myAvatarButton').color(selectedButtonColor);
	Crafty('myAvatarButton').text('Viewing My Avatars');

	// correspondingly toggle delete and submit buttons
	turnOnDeleteSubmitButtons();

	// load data to carousel
	loadMyAvatarsToCarousel(0);
}
function myLibraryButtonClick() {
	// swap view buttons
	Crafty('myAvatarButton').color(bgroundColor);
	Crafty('myAvatarButton').text('View My Avatars');
	Crafty('myLibraryButton').color(selectedButtonColor);
	Crafty('myLibraryButton').text('Viewing Avatar Library');

	// correspondingly toggle delete and submit buttons
	turnOffDeleteSubmitButtons();

	// load data to carousel
	loadLibraryAvatarsToCarousel(0);
}
function toggleButtonsOnNew() {
	// toggle buttons that should be off when on "New" avatar
	if (carouselContents == myAvatars) {
		if (carouselIndex == 0) {
			// turn off buttons
			turnOffDeleteSubmitButtons();
			turnOffEnterButton();
		} else {
			// turn on buttons
			turnOnDeleteSubmitButtons();
			turnOnEnterButton();
		}
	}
}
function turnOffEnterButton() {
	// turn off the "Enter the Blank" button
	Crafty('myEnterButton').unbind('Click');
	Crafty('myEnterButton').text('');
	Crafty('myEnterButton').removeComponent('myButton');
}
function turnOnEnterButton() {
	// turn on the "Enter the Blank" button
	Crafty('myEnterButton').bind('Click', doEnterButton);
	Crafty('myEnterButton').text('Enter the Blank');
	Crafty('myEnterButton').addComponent('myButton');
}
function turnOffDeleteSubmitButtons() {
	// turn off delete and submit avatar buttons
	Crafty('myDeleteButton').unbind('Click');
	Crafty('myDeleteButton').text('');
	Crafty('myDeleteButton').removeComponent('myButton');
	Crafty('mySubmitButton').unbind('Click');
	Crafty('mySubmitButton').text('');
	Crafty('mySubmitButton').removeComponent('myButton');
}
function turnOnDeleteSubmitButtons() {
	// turn on delete and submit avatar buttons
	Crafty('myDeleteButton').bind('Click', deleteLocalAvatar);
	Crafty('myDeleteButton').text('Delete Avatar');
	Crafty('myDeleteButton').addComponent('myButton');
	Crafty('mySubmitButton').bind('Click', submitAvatarToLibrary);
	Crafty('mySubmitButton').text('Submit Avatar to Public Library');
	Crafty('mySubmitButton').addComponent('myButton');
}
function turnOffViewButtons() {
	// turn button functionality off
	Crafty('myAvatarButton').unbind('Click');
	Crafty('myAvatarButton').removeComponent('myButton');
	Crafty('myLibraryButton').unbind('Click');
	Crafty('myLibraryButton').removeComponent('myButton');	
}
function turnOnViewButtons() {
	// turn button functionality back on
	Crafty('myAvatarButton').bind('Click', myAvatarButtonClick);
	Crafty('myAvatarButton').addComponent('myButton');
	Crafty('myLibraryButton').bind('Click', myLibraryButtonClick);
	Crafty('myLibraryButton').addComponent('myButton');

	// also make sure message box is hidden
	messageDiv.style.display = "none";
}
function displayAvatarInCarousel(myString) {
	// references Mark's assetRender function
	// displays the given svg data string in the selected position of the carousel

	// clear out anything currently in the scene
	carouselStage.removeComponent('myImage');
	
	// generate a URL	
	myString = svgPrefix + myString + svgPostfix; // just in case the server ones need it
	var blobSvg = new Blob([myString],{type:"image/svg+xml;charset=utf-8"});
	var domURL = self.URL || self.webkitURL || self;
	var url = domURL.createObjectURL(blobSvg);

	// put it in the scene
	// reference: http://craftyjs.com/api/Crafty-sprite.html
	// reference: https://github.com/craftyjs/Crafty/issues/1077
	var mySprite = Crafty.sprite(url, {myImage: [210, 0, 390, canvasHeight]});
	carouselStage.addComponent('myImage');
	carouselStage.w = 390/1.6;
	carouselStage.h = canvasHeight/1.6;
}
function loadMyAvatarsToCarousel(myIndex) {
	// load avatar cookie data and display avatar at myIndex in the carousel

	// clear out current carouselData and carouselStage
	carouselData.length = [];
	carouselStage.removeComponent('myImage');

	// for debugging, try a solid black oval
	//carouselData[0] = ovalAvatarImg;
	
	// set the blank/new element as first 
	carouselData[0] = newAvatarImg;
	
	// turn off the buttons that don't work on "new avatar" selection
	turnOffDeleteSubmitButtons();
	turnOffEnterButton();

	// fill the rest of the carouselData array with results from local data
	// get current info out of localStorage
	var tempObject = JSON.parse(localStorage.myAvatars);
	var numAvatars = Number(localStorage.myAvatarCount);
	
	// put this info into carouselData
	for (var j = 1; j <= numAvatars; j += 1) {
		carouselData[j] = tempObject[j];
	}

	// check that myIndex is valid into this array, else use 0
	if (myIndex >= 0 && myIndex <= numAvatars) {
		carouselIndex = myIndex;
	} else {
		carouselIndex = 0;
	}

	// load carouselData[carouselIndex] into the carousel's selected position
	displayAvatarInCarousel(carouselData[carouselIndex]);

	// debug message
	if (debugging) {
		console.log("Loaded My Avatars to avatar carousel.");
	}
}
function loadLibraryAvatarsToCarousel(myIndex) {
	// load avatar server data and display avatar at myIndex in the carousel

	// clear out current carouselData and carouselStage
	carouselData = [];
	carouselStage.removeComponent('myImage');

	// ### Mark - your code probably goes here.
	// need to fill carouselData array with results from server
	// our default avatars should be the early indexed items, e.g. carouselData[0] is Mr Stick
	// just load everything, or dynamically load in chunks sorta like the tile data?
	

	// load carouselData[0] into the carousel's selected position
	// ### check that myIndex is valid into this array, else use 0
	carouselIndex = myIndex;
	displayAvatarInCarousel(carouselData[carouselIndex]);

	// debug message
	if (debugging) {
		console.log("Loaded Public Avatar Library to avatar carousel.");
	}
}
function deleteLocalAvatar() {
	// are you sure? message
	turnOffViewButtons();
	displayMessage("Are you sure you want to permanently delete this avatar from your computer?",
				   doDeleteAvatar, turnOnViewButtons, false, false);
}
function doDeleteAvatar() {

	// hide message box div
	messageDiv.style.display = "none";

	// turn view buttons back on
	turnOnViewButtons();

	// delete from local data
	// get current info out of localStorage
	var tempObject = JSON.parse(localStorage.myAvatars);
	numAvatars = Number(localStorage.myAvatarCount);
	
	// remove currently selected avatar
	if (carouselIndex > 0 && carouselIndex <= numAvatars) {
		delete tempObject[carouselIndex];
		// shift any avatars after that up one index
		for (var i = carouselIndex; i < numAvatars; i += 1) {
			tempObject[i] = tempObject[i+1];
		}
		// decrement count of avatars
		numAvatars -= 1;
	} // else do nothing b/c something is messed up somehow
	
	// send result back to localStorage
	localStorage.myAvatars = JSON.stringify(tempObject);
	localStorage.myAvatarCount = numAvatars;

	// debug message
	if (debugging) {
		console.log("Deleted avatar.");
	}

	// cause carousel to reload
	// this also serves as confirmation
	loadMyAvatarsToCarousel(0);
}
function submitAvatarToLibrary() {
	// are you sure? message
	turnOffViewButtons();
	displayMessage("Are you sure you want to submit this avatar to the public library?",
				   doSubmitAvatar, turnOnViewButtons, false, false);
}
function doSubmitAvatar() {
	// actually send data of currently selected avatar to the server
	// get data from carouselData[carouselIndex], will be a valid SVG string

	// hide message box div
	messageDiv.style.display = "none";

	// turn view buttons back on
	turnOnViewButtons();

	// ### Mark - your code probably goes here.
	

	// confirmation message
	turnOffViewButtons();
	displayMessage("Your avatar has been submitted to the public library.", turnOnViewButtons,
				   turnOnViewButtons, false, true);

	// debug message
	if (debugging) {
		console.log("Submited avatar to library.");
	}
}
function myEditAvatarClick() {
	// if in local / My Avatars mode, don't send info for "New" avatar
	if (carouselContents == myAvatars) {
		if (carouselIndex != 0) {
			doAvatarEdit(carouselData[carouselIndex]);
		} else {
			doAvatarEdit("");
		}
	} else {
		doAvatarEdit(carouselData[carouselIndex]);
	}
}
function doEnterButton() {
	// enter the world
	Crafty.enterScene('World');
}
// end Toni's code