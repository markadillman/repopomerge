/*

Antonina (Toni) York
OSU CS 467 Spring 2017
Capstone Team Aries
Tile Drawing Tool
tool.js

This file includes the onload initialization function for the main body of the
game's html page: initHTML()

The SVG code in this file draws heavily from examples found at:
https://github.com/oreillymedia/svg-essentials-examples

Also includes several chunks of code by fellow Team Aries member Mark Dillman.
These chunks are tagged with the phrase "Mark's code" in comments.

*/

/* CODE FROM HTML PORTION */

var debugging = true;	// toggle debug messages
var verboseDebugging = true; // toggle verbose debugging messages
var useFakeSurroundings = false; // surroundings are colored boxes (for debugging)
var playing = false;	// flag set to true when player is in Crafty World scene
var artMode = "art";	// mode strings
var gameMode = "game";
var helpMode = "help";
var mapMode = "map";
var mode = gameMode;	// track what mode is active
var previousMode = mode; // track what the previous mode was
var avatarEditing = true;	// track if avatar editing or just tile editing
var masking = false;	// toggle the platform masking tools
var musicDiv;		// variables for game music
var musicAudio;
var musicAudioSource;
var musicPlaylist = ["aud/Thetasong.mp3", "aud/Othersdance.mp3", "aud/Heartsbeat.mp3"];
var musicCurrent = 0;
var musicPaused = false;
var defaultVolume = 0.5;
var bgroundColor = "#e0fbfd"; // default background color for game stuff
var hiddenCanvas;		// hidden canvas for getting color info
var hiddenContext;		// the context of the hidden canvas
var canvasWidth = 600;	// drawing area size
var canvasHeight = 350;
var canvasEdge = 50;	// size of the area showing surrounding tiles
var canvasBorder = 1;	// stroke width of the borders for the tiles
var zoomFactor = 1;		// current actual zoom factor
var zoomStep = 1.25;	// the zoom multiplier
var minWidth = 5;		// floor of minimum values for zooming in (keeps ratios)
var minHeight = 3;
var defaultViewBox = "0 0 " + canvasWidth.toString() + " " + canvasHeight.toString();
var panStep = 10;		// the number of pixels to pan by
var drawControls;		// the drawing-specific tools
var platformControls;	// the platform-specific tools
var gameDiv;			// the game div
var mapDiv;			// the map screen div
var helpDiv;			// the help screen div
var messageDiv;			// the message box div
var messageText;		// the message box text field
var msgBtnOK;			// the message OK button
var msgBtnCancel;		// the message Cancel button
var pageHeader;			// the h1 tag for the drawing tool
var drawingHeader = "CREATE THE BLANK --- Add your art to the world! Don't forget to create platforms before you submit your tile.";
var avatarHeader = "CREATE YOUR AVATAR --- Edit an existing avatar or draw a new one. For best results, draw to the oval's edges.";
var avatarEllipse;		// the ellipse border for the avatar drawing area
var toolDiv;			// the div for the entire drawing tool
var displayDiv;			// the display divs
var borderArtDiv;		// the sub-div with just the border art divs in it
var cornerArtDiv;		// the sub-sub div with just the corner border art
var edgeArtDiv;			// the sub-sub div with just the edge art
var edgeArtDivList = []; // list of divs for edge art
var edgeArtClipList = []; // list of current clipX and clipY values for edge art
for (var i = 0; i < 4; i += 1) {
	edgeArtClipList[i] = [];
}
var displayDivList = [];
var displayDivCanvasList = [];
var displayDivContextList = [];
var displayDivDict = {0: "aboveLeftDiv",
					  1: "aboveDiv",
					  2: "aboveRightDiv",
					  3: "leftDiv",
					  4: "centerDiv",
					  5: "rightDiv",
					  6: "belowLeftDiv",
					  7: "belowDiv",
					  8: "belowRightDiv"};
var originalEdgesDict = {};	// save original edge art for use in zoom/pan
//MARK'S CODE: coordinates match above display dict for concise looping JSON payload formation
var coordinatePairs = {"ul": {"x":-1,"y":-1,"canvasId":"aboveLeftDivCanvas"},//------upper left ("ul")
					   "uc": {"x":0,"y":-1,"canvasId":"aboveDivCanvas"}, //------upper middle ("uc")
					   "ur": {"x":1,"y":-1,"canvasId":"aboveRightDivCanvas"}, //------upper right ("ur")
					   "cl": {"x":-1,"y":0,"canvasId":"leftDivCanvas"}, //------center left ("cl")
					   "cm": {"x":0,"y":0,"canvasId":"svgCanvas"},  //------center middle ("cm") <-dummy for index loops
					   "cr": {"x":1,"y":0,"canvasId":"rightDivCanvas"},  //------center right ("cr")
					   "bl": {"x":-1,"y":1,"canvasId":"belowLeftDivCanvas"}, //------bottom left ("bl")
					   "bm": {"x":0,"y":1,"canvasId":"belowDivCanvas"},  //------bottom middle ("bm")
					   "br": {"x":1,"y":1,"canvasId":"belowRightDivCanvas"}    //------bottom right ("br")
					};
//end MARK'S CODE
var myFileInput;		// HTML input element for handling files
// start Mark's code, slightly modified by Toni to add the white rectangle
// modified again by Toni to add the avatar clip path definition
var svgPrepend = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"600\" height=\"350\" viewBox=\"0 0 600 350\">  <clipPath id=\"avatarClipPath\"><ellipse cx=\"300\" cy=\"175\" rx=\"87\" ry=\"174\"></ellipse></clipPath> <rect width=\"600\" height=\"350\" fill=\"white\"></rect>";
var svgMinPrepend = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"> <clipPath id=\"avatarClipPath\"><ellipse cx=\"300\" cy=\"175\" rx=\"87\" ry=\"174\"></ellipse></clipPath>";
var svgAppend = "</svg>";
//this variable tracks whether password reprompt at edit submit is necessary
var passwordReprompt = false;
const passwordReenterPrompt = "Please re-enter your tile's password to submit your edits.";
//this will contain references to all specific button event listeners
var eventListenerMsgBtnOK;
var eventListenerMsgBtnCancel;
var eventListenerPwdBtnOk;
var eventListenerPwdBtnSkip;
var eventListenerPwdBtnCancel;
var eventListenerPwdBtnPublic;
//this will allow removal of unknown, dynamic event listeners, 
//adapted from code at http://stackoverflow.com/questions/8841138/remove-event-listener-in-java
//credit to SO user TERMtm
HTMLElement.prototype.eventListener = function(type, func, capture){
	//a single object argument possessing the event listener will now remove that event listener
	if(typeof arguments[0]== "object" && (!arguments[0].nodeType)){
		return this.removeEventListener.apply(this,arguments[0]);
	}
	//regular add function
	this.addEventListener(type,func,capture);
	return arguments;
}
// end Mark's code

// stop event propagation so forms don't actually submit
function onFormSubmit(form_element) {
	return false;
}

// keyboard event handler
// references: http://stackoverflow.com/a/2353562
function parseKeyHTML(evt) {
	var keyID = evt.keyCode;
	//console.log(keyID);

	// handle toggling help screen no matter what mode
	if (keyID == 72) { // h key
		if (debugging) {
			console.log("HTML document caught an h keypress.");
		}
		// toggle help screen mode
		if (mode != helpMode) {
			displayHelpScreen();
		} else {
			doHelpScreenDone();
		}
	}

	// handle music player controls no matter what mode
	if (keyID == 79 && !musicPaused) { // o key
		// skip over current track if not paused
		playNextTrack();
	}
	if (keyID == 80) { // p key
		// toggle music being paused
		toggleMusicPause();
	}

	// only do anything else if not in game mode
	if (mode != gameMode) {
		switch (keyID) {
			case 8: // backspace key
				// stop the backwards navigation
				evt.preventDefault();
				// only do something if in platform mode
				if (masking == true) {
					if (debugging) {
						console.log("HTML document caught a backspace keypress.");
					}
					svgRemoveSelectedPlatform(false);
				} // else do nothing
				break;
			case 37: // left arrow key
				if (debugging) {
					console.log("HTML document caught a left arrow keypress.");
				}
				panLeftButton();
				break;
			case 38: // up arrow key
				if (debugging) {
					console.log("HTML document caught an up arrow keypress.");
				}
				panUpButton();
				break;
			case 39: // right arrow key
				if (debugging) {
					console.log("HTML document caught a right arrow keypress.");
				}
				panRightButton();
				break;
			case 40: // down arrow key
				if (debugging) {
					console.log("HTML document caught a down arrow keypress.");
				}
				panDownButton();
				break;
			case 46: // delete key
				// only do something if in platform mode
				if (masking == true) {
					if (debugging) {
						console.log("HTML document caught a delete keypress.");
					}
					svgRemoveSelectedPlatform(false);
				}
				break;
			case 89: // y key
				if (evt.ctrlKey) { // only catch ctrl+y
					if (debugging) {
						console.log("HTML document caught a ctrl+y keypress.");
					}
					svgRedoAction();
				} // else do nothing
				break;
			case 90: // z key
				if (evt.ctrlKey) { // only catch ctrl+z
					if (debugging) {
						console.log("HTML document caught a ctrl+z keypress.");
					}
					svgUndoAction();
				} // else do nothing
				break;
			default: // do nothing for other keys
				break;
		}
	}
}

// div hide/show helper functions
// useful when switching screens
function hideAllDivs() {
	gameDiv.style.display = "none";
	toolDiv.style.display = "none";
	mapDiv.style.display = "none";
	helpDiv.style.display = "none";

	// and just in case, even though it's not a mode div
	messageDiv.style.display = "none";

}
function showDiv(mode) {
	// hide all the divs
	hideAllDivs();

	// then display just the correct div for the given mode
	switch(mode) {
		case gameMode: // show game mode div
			gameDiv.style.display = "block";
			break;
		case artMode: // show art tool div
			toolDiv.style.display = "block";
			break;
		case mapMode: // show map mode div
			mapDiv.style.display = "block";
			break;
		case helpMode: // show help screen div
			helpDiv.style.display = "block";
			break;
		default: // should never get here!
			console.log("Something went very awry with showing div based on mode.");
			break;
	}
}

// helper function to get individual display divs
// assumes init() has already populated displayDivList
// uses helper function from http://stackoverflow.com/a/28191966
function getKeyByVal(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}
function getDiv(divName) {
	return displayDivList[getKeyByVal(displayDivDict, divName)];
}

// helper function to toggle pause of current music track
function toggleMusicPause() {
	if (musicPaused) {
		// toggle the flag
		musicPaused = false;
		// play the music
		musicAudio.play();
		// debug message
		if (debugging) {
			console.log("Playing music.");
		}
	} else { // toggle the flag
		musicPaused = true;
		// pause the music
		musicAudio.pause();
		// debug message
		if (debugging) {
			console.log("Paused music.");
		}
	}
}

// helper function to move to next game music track in playlist
// reference: http://devblog.lastrose.com/html5-audio-video-playlist/
function playNextTrack() {

	// move to next track
	musicCurrent += 1;
	if (musicCurrent == musicPlaylist.length) {
		// wrap around to beginning of playlist
		musicCurrent = 0;
	}

	// set the url for the new track
	musicAudioSource.src = musicPlaylist[musicCurrent];

	// load and play
	musicAudio.load();
	musicAudio.play();

	// debug message
	if (debugging) {
		console.log("Moved to next music track.");
	}
}

// initialize the game music
// reference: http://devblog.lastrose.com/html5-audio-video-playlist/
function initMusic() {

	// init variables
	musicDiv = document.getElementById("musicDiv");
	musicAudio = document.createElement("audio");
	musicAudio.id = "musicAudio";
	musicAudio.volume = defaultVolume;
	musicAudioSource = document.createElement("source");
	musicAudioSource.id = "musicAudioSource";
	musicAudioSource.src = "";
	musicAudio.appendChild(musicAudioSource);
	musicDiv.appendChild(musicAudio);
	musicCurrent = -1;
	musicPaused = false;

	// set up playlist looping
	musicAudio.addEventListener("ended", function() {
		playNextTrack();
	});
	
	// debug message
	if (debugging) {
		console.log("Loaded music player and playlist.");
	}

	// start the first track playing
	playNextTrack();
}

// initalize the rest of the page
function initHTML() {
	
	// set the page header (defaults to avatar mode since that's used first)
	pageHeader = document.getElementById("drawingToolHeader");
	pageHeader.innerHTML = avatarHeader;
	
	// check to make sure local storage is working and set it up if necessary
	if (typeof(localStorage) != "undefined") {
		if (localStorage.hello != "world") {
			// local storage has not yet been set up for this browser, so do set up
			localStorage.hello = "world";
			localStorage.myAvatarCount = 0;
			localStorage.myAvatars = JSON.stringify({});
			localStorage.myTeleporterCount = 0;
			localStorage.myTeleporters = JSON.stringify({});
			// debug message
			if (debugging) {
				console.log("Set up localStorage for the first time in this browser.");
			}
		} else  { // else it already exists so don't mess with it	
			// debug message
			if (debugging) {
				console.log("Confirmed localStorage ready for use in this browser.");
			}
		}
	} else { // whoops, this browser can't support localStorage
		console.log("This browser does not support HTML5 Local Storage.");
		// ### flag this and check that flag every time accessing local storage?
	}
	
	// add the keybard event listener
	document.addEventListener("keydown", parseKeyHTML);

	// initialize the game music
	initMusic();

	// set the background color for the whole page
	document.body.style.backgroundColor = bgroundColor;

	// grab the game div
	gameDiv = document.getElementById("gameDiv");

	// grab and hide the map screen div
	mapDiv = document.getElementById("mapDiv");
	mapDiv.style.display = "none";
	
	// create the hidden file input element
	myFileInput = document.createElement("input");
	myFileInput.style.display = "none";
	myFileInput.type = "file";
	myFileInput.accept = ".svg";
	myFileInput.multiple = false;
	
	// create the hidden canvas for getting color info
	hiddenCanvas = document.createElement("canvas");
	hiddenCanvas.id = "hiddenCanvas";
	hiddenCanvas.width = canvasWidth;
	hiddenCanvas.height = canvasHeight;
	
	// create the avatar ellipse, but don't append it anywhere yet
	avatarEllipse = document.createElementNS(svgns, "ellipse");
	avatarEllipse.setAttribute("id", "avatarEllipse");
	avatarEllipse.setAttribute("cx", canvasWidth/2);
	avatarEllipse.setAttribute("cy", canvasHeight/2);
	avatarEllipse.setAttribute("rx", spriteWidth * avatarMultiplier);
	avatarEllipse.setAttribute("ry", spriteHeight * avatarMultiplier);
	avatarEllipse.setAttribute("style", "fill: none; stroke: black");
	
	// grab the context of the hidden canvas
	hiddenContext = hiddenCanvas.getContext("2d");
	
	// grab the overall tool div
	toolDiv = document.getElementById("toolDiv");
	
	// grab the different groups of tools
	maskingToggleDiv = document.getElementById("maskingToggleDiv");
	drawControls = document.getElementById("drawControls");
	platformControls = document.getElementById("platformControls");
	
	// set the default visibility of the tool groups
	drawControls.style.display = "block";
	platformControls.style.display = "none";
	maskingToggleDiv.style.display = "none"; // because avatars happen first
	
	// grab the help screen div and button
	helpDiv = document.getElementById("helpDiv");
	helpBtnDone = document.getElementById("helpBtnDone");
	
	// set the background color for the help screen div
	document.getElementById("helpFormatDiv").style.backgroundColor = bgroundColor;

	// set the default visibility of the help screen div
	helpDiv.style.display = "none";

	// grab the message box div and elements
	messageDiv = document.getElementById("messageDiv");
	messageText = document.getElementById("messageText");
	msgBtnOK = document.getElementById("msgBtnOK");
	msgBtnCancel = document.getElementById("msgBtnCancel");
	msgTextInput = document.getElementById("msgTextInput");
	
	// hide the text input element from the message box
	msgTextInput.style.display = "none";

	// set the background color for the message div
	document.getElementById("messageFormatDiv").style.backgroundColor = bgroundColor;
	//MARK ADDED THIS to get the background color of the set password div to display
	document.getElementById("passwordFormatDiv").style.backgroundColor = bgroundColor;
	
	// set the default visibility of the message box div
	messageDiv.style.display = "none";

	// grab the display divs
	borderArtDiv = document.getElementById("borderArtDiv");
	cornerArtDiv = document.getElementById("cornerArtDiv");
	edgeArtDiv = document.getElementById("edgeArtDiv");
	edgeArtDivList[0] = document.getElementById("aboveDiv");
	edgeArtDivList[1] = document.getElementById("leftDiv");
	edgeArtDivList[2] = document.getElementById("rightDiv");
	edgeArtDivList[3] = document.getElementById("belowDiv");
	displayDiv = document.getElementById("displayDiv");
	for (var i in displayDivDict) {
		displayDivList[i] = document.getElementById(displayDivDict[i]);
	}
	
	// create the canvas objects for the non-center display divs
	var currentCanvas;
	var currentId;
	var currentWidth;
	var currentHeight;
	var currentContext;
	for (var i = 0; i < displayDivList.length; i += 1) {
		// don't try to do anything in the center div
		if (displayDivDict[i] != "centerDiv") {
			// create a canvas and set its id, width, and height
			currentId = displayDivDict[i] + "Canvas";
			currentCanvas = document.createElement("canvas");
			currentCanvas.id = currentId;
			currentWidth = canvasEdge;
			currentHeight = canvasEdge;
			if (i == 1 || i == 7 ) { // ??? maybe use the dict here?
				currentWidth = canvasWidth;
			}
			if (i == 3 || i == 5) {
				currentHeight = canvasHeight;
			}
			currentCanvas.width = currentWidth;
			currentCanvas.height = currentHeight;
			// set the click action for this canvas
			currentCanvas.addEventListener("click", surroundingEyeDropper, false);
			// add this canvas to the document so it will render
			displayDivList[i].appendChild(currentCanvas);
			// add this canvas to the canvas list
			displayDivCanvasList[i] = document.getElementById(currentId);
			// add its context to the context list
			currentContext = currentCanvas.getContext("2d");
			displayDivContextList[i] = currentContext;
		}
	}
	
	// position all the other display divs inside the overall div
	var topVal, leftVal;
	for (var i = 0; i < displayDivList.length; i += 1) {
		displayDivList[i].style.position = "absolute";
		displayDivList[i].style.border = canvasBorder + "px solid grey";
		switch (i) { // ??? is there a more mathy way to do this?
			// ??? maybe use the dict here?
			case 0: // above left
				topVal = 0;
				leftVal = 0;
				break;
			case 1: // above
				topVal = 0;
				leftVal = canvasEdge + canvasBorder;
				break;
			case 2: // above right
				topVal = 0;
				leftVal = canvasEdge + canvasWidth + 2*canvasBorder;
				break;
			case 3: // left
				topVal = canvasEdge + canvasBorder;
				leftVal = 0;
				break;
			case 4: // center
				topVal = canvasEdge + canvasBorder;
				leftVal = canvasEdge + canvasBorder;
				break;
			case 5: // right
				topVal = canvasEdge + canvasBorder;
				leftVal = canvasEdge + canvasWidth + 2*canvasBorder;
				break;
			case 6: // below left
				topVal = canvasEdge + canvasHeight + 2*canvasBorder;
				leftVal = 0;
				break;
			case 7: // below
				topVal = canvasEdge + canvasHeight + 2*canvasBorder;
				leftVal = canvasEdge + canvasBorder;
				break;
			case 8: // below right
				topVal = canvasEdge + canvasHeight + 2*canvasBorder;
				leftVal = canvasEdge + canvasWidth + 2*canvasBorder;
				break;
			default: // should never get here
				console.log("Something went horribly awry with positioning the display divs.");
		}					
		displayDivList[i].style.top = topVal.toString() + "px";
		displayDivList[i].style.left = leftVal.toString() + "px";
		// set div sizes
		currentWidth = canvasEdge;
		currentHeight = canvasEdge;
		if (i == 1 || i == 7 ) { // ??? maybe use the dict here?
			currentWidth = canvasWidth;
		}
		if (i == 3 || i == 5) {
			currentHeight = canvasHeight;
		}
		if (i == 4) {
			currentWidth = canvasWidth;
			currentHeight = canvasHeight;
		}
		displayDivList[i].style.width = currentWidth + "px";
		displayDivList[i].style.height = currentHeight + "px";
	}
	
	// make the overall display div visible
	displayDiv.style.display = "block";

	// debug message
	if (debugging) {
		console.log("Loaded HTML with debug messages turned on.");
	}
}

// helper function to stuff surroundings from server into boundary canvases
function doLoadSurroundingsFromServer() {
	if (useFakeSurroundings) { // use a bunch of colored blocks
		var colorBlock;
		for (var i = 0; i < displayDivCanvasList.length; i += 1) {
			// don't try to do anything in the center div
			if (i != getKeyByVal(displayDivDict, "centerDiv")) {
				// create the color block in canvas i
				currentCanvas = displayDivCanvasList[i];
				currentContext = displayDivContextList[i];
				colorBlock = currentContext.createImageData(currentCanvas.width, currentCanvas.height);
				for (var j = 0; j < colorBlock.data.length; j += 4) {
					colorBlock.data[j+0] = 0;
					colorBlock.data[j+1] = 0;
					colorBlock.data[j+2] = i*17 + 100;
					colorBlock.data[j+3] = 255;
				}
				currentContext.putImageData(colorBlock, 0, 0);
			}
		}
	} else { // use real image data from the server
		// xTile and yTile are the current tile
		// so need to load: (xTile - 1, yTile - 1)	above left
		//					(xTile, yTile - 1)		above
		//					(xTile + 1, yTile - 1)	above right
		//					(xTile - 1, yTile)		left
		//					(xTile + 1, yTile)		right
		//					(xTile - 1, yTile + 1)	below left
		//					(xTile, yTile + 1)		below
		//					(xTile + 1, yTile + 1)	below right
		// also need to handle cases where one or more of these
		// tiles doesn't exist yet (load nothing, display blank)
		
		// start Mark's code
		//declare JSON object for payload
		var readOnlyPayload = generateSurroundingsPayload();
		//execute request
		var request = postRequest("/readpull",readOnlyPayload,surroundingsOnLoad,postOnError);
		//do more stuff with request response if need be, but probably not necessary
	}
}

// update option selctions from the form
function changeMasking(newState) {
	masking = newState;
	svgSetMasking(newState);
	// change controls to match newState
	if (masking) { // make only platform tools visible
		drawControls.style.display = "none";
		platformControls.style.display = "block";
	} else { // make only drawing tools visible
		drawControls.style.display = "block";
		platformControls.style.display = "none";
	}
}
function changeColor(newColor) {
	svgSetColor(newColor);
}
function changeShapeFill(newState) {
	svgSetShapeFill(newState);
}
function changeStrokeWidth(newWidth) {
	newWidth = parseInt(newWidth);
	if (!isNaN(newWidth)) {
		svgSetStrokeWidth(newWidth);
	}
}
function changeTool(newTool) {
	newTool = parseInt(newTool);
	if (!isNaN(newTool)) {
		svgSetTool(newTool);
	}
}

// help screen functions
function displayHelpScreen() {

	// set the mode
	previousMode = mode;
	mode = helpMode;

	// display correct div
	showDiv(mode);
	
	// debug message
	if (debugging) {
		console.log("Displayed help screen.");
	}
}
function doHelpScreenDone() {

	// set the mode back to previous
	mode = previousMode;
	previousMode = helpMode;

	// display correct div
	showDiv(mode);
	
	// debug message
	if (debugging) {
		console.log("Hid help screen.");
	}
}

// quit to home screen function
function doQuitToHomeScreen() {
	
	// set the mode and flags
	previousMode = mode;
	mode = gameMode;
	playing = false;
	firstWorldEntry = true;

	// display correct div
	showDiv(mode);
	
	// debug message
	if (debugging) {
		console.log("Quit to home screen.");
	}
}

// display the message box with the given message
// links up the ok and cancel functions
// also displays text input element if boolean argument is true
// these functions should include: messageDiv.style.display = "none";
function displayMessage(msg, okFn, cancelFn, useTextInput, hideCancelButton, defaultText, textInputPassword, initCoords) {
	//remove previous event listeners so that they do not aggregate to multiple per push
	removeEventListeners();
	messageText.innerHTML = msg;
	//updated so all anonymous functions should also remove themselves as event listeners
	if (initCoords&&textInputPassword){
		//this works because the truthiness of strings in Javascriprt. Both true and defined.
		eventListenerMsgBtnOK = msgBtnOK.addEventListener('click',function clicked1(){
			this.removeEventListener("click",clicked1, false);
			okFn(initCoords.xcoord,initCoords.ycoord,textInputPassword);
		},false); 
		eventListenerMsgBtnCancel = msgBtnCancel.addEventListener('click',function clicked2(){
			this.removeEventListener("click",clicked2,false);
			cancelFn();
		},false);
	}
	else if (initCoords) {
		eventListenerMsgBtnOK = msgBtnOK.addEventListener('click',function clicked1(){
			this.removeEventListener("click",clicked1, false);
			okFn(initCoords.xcoord,initCoords.ycoord);
		},false);
		eventListenerMsgBtnCancel = msgBtnCancel.addEventListener('click',function clicked2(){
			this.removeEventListener("click",clicked2,false);
			cancelFn();
		},false);
	}
	else
	{
		eventListenerMsgBtnOK = msgBtnOK.addEventListener('click',function clicked1(){
			this.removeEventListener("click",clicked1,false);
			okFn(); 
		},false);
		eventListenerMsgBtnCancel = msgBtnCancel.addEventListener('click',function clicked2(){
			this.removeEventListener("click",clicked2,false);
			cancelFn();
		},false);
	}
	// use or hide text input element
	if (useTextInput) { // show the text input element
		//SET THE DEFAULT VALUE TO defaultText if truthy
		if (useTextInput){
			if (defaultText){
				msgTextInput.value = defaultText;
			}
		}
		if (textInputPassword === true){
			if (verboseDebugging){
				console.log("turning this field dadgum password, tell yu whut.");
			}
			//must be reverted in the ok and cancel functions. Reverts on refresh.
			msgTextInput.type = "password";
			msgTextInput.style.display = "block";
		} else {
			msgTextInput.type = "text";
			msgTextInput.style.display = "block";
		}
	} else { // hide it
		msgTextInput.style.display = "none";
	}
	messageDiv.style.display = "block";	
	// use or hide cancel button
	if (hideCancelButton) { // hide the button
		msgBtnCancel.style.display = "none";
	} else { // show the button
		msgBtnCancel.style.display = "block";
	}
	// debug message
	if (debugging) {
		console.log("Displayed a message.");
	}
}

//MARK ADDED: This is a way to remove all event listeners from all buttons. This should be done
//every time on the first line of displayMessage or displayPassword to avoid eventListeners from
//accumulating. Somewhat redundant with the new self-removing functions above.
function removeEventListeners(){
	var pwdBtnOK = document.getElementById('pwdBtnOK');
	var pwdBtnSkip = document.getElementById('pwdBtnSkip');
	var pwdBtnPublic = document.getElementById('pwdBtnPublic');
	var pwdBtnCancel = document.getElementById('pwdBtnCancel');
	//all nodes are gathered in reference-able variables. Now use the prototype that tracks them
	//to remove all the event listeners regardless of what they are or what args they have.
	msgBtnOK.eventListener(eventListenerMsgBtnOK);
	msgBtnCancel.eventListener(eventListenerMsgBtnCancel);
	pwdBtnOK.eventListener(eventListenerPwdBtnOk);
	pwdBtnSkip.eventListener(eventListenerPwdBtnSkip);
	pwdBtnCancel.eventListener(eventListenerPwdBtnCancel);
	pwdBtnPublic.eventListener(eventListenerPwdBtnPublic);
}

// default handlers for message box buttons
// these should never run!
function doMsgBtnOK() {
	console.log("Something went very awry with the message box Okay button.");
}
function doMsgBtnCancel() {
	console.log("Something went very awry with the message box Cancel button.");
}

// helper handlers for message box functions
function doNothing() {
	// does what it says on the tin
	// except for clearing off the message div
	messageDiv.style.display = "none";
}
function hardReload() {
	// does what it says on the tin
	location.reload(true);
}

// control button handlers
function saveButton() {
	displayMessage("Enter a name for your saved art file.", svgSaveToLocal, doNothing, true, false,"art.svg");
}
function loadButton () {
	displayMessage("Use the dialog to select an art file to load.", svgLoadFromLocal, doNothing, false, false);
}
function submitAvatarButton() {
	// this always submits the avatar svg currently in the drawing area to localStorage
	// even if the user was editing an avatar that came from the library
	// submitting to the library is handled by a helper function in game.js
	
	// get current info out of localStorage
	var tempObject = JSON.parse(localStorage.myAvatars);
	numAvatars = Number(localStorage.myAvatarCount) + 1;
	
	// add new info
	tempObject[numAvatars] = svgMinPrepend + artToString() + platformToString() + svgAppend;
	
	// send result back to localStorage
	localStorage.myAvatars = JSON.stringify(tempObject);
	localStorage.myAvatarCount = numAvatars;
	
	// debug message
	if (debugging) {
		console.log("Stored avatar in browser's localStorage.");
	}

	// use message box to put up confirmation message
	displayMessage("Your avatar has been stored.", doAvatarExit, doAvatarExit, false, true)
}
function submitTileButton () {
	// make sure to toggle off platform editing mode if necessary
	if (masking) {
		changeMasking(false);
	}
	
	// ### Mark - why does this submit hiddenCanvas, especially without updating it first?
	// and yet this seems to work... maybe I'm just tired and not following what's going on
	svgSubmitToServer(document.getElementById('hiddenCanvas'));
}
function undoButton() {
	svgUndoAction();
}
function redoButton () {
	svgRedoAction();
}
function removeSelectedPlatform(force) {
	svgRemoveSelectedPlatform(force);
}
function exitButton() {
	if (avatarEditing) {
		if (verboseDebugging){console.log("This is avatar exiting.");}
		displayMessage("Are you sure you want to exit without submitting your work?", doAvatarExit, doNothing, false, false);
	} else {
		if (verboseDebugging)
		{console.log("This is tile editing.");}
		displayMessage("Are you sure you want to exit without submitting your work?", doTileExit, doNothing, false, false);
	}
}
function zoomOutButton() {
	// set mouse coordinates to center of current viewBox
	xMouse = canvasWidth / 2;
	yMouse = canvasHeight / 2;
	// adjust coords for zoom and pan because doZoom expects that
	adjustMouseCoords();
	// call zoom funciton with false to zoom out
	doZoom(false);
}
function zoomInButton() {
	// set mouse coordinates to center of current viewBox
	xMouse = canvasWidth / 2;
	yMouse = canvasHeight / 2;
	// adjust coords for zoom and pan because doZoom expects that
	adjustMouseCoords();
	// call zoom function with true to zoom in
	doZoom(true);
}
function zoomResetButton() {
	doZoomReset();
}
function panUpButton() {
	doPan(0, -1 * panStep);
}
function panLeftButton() {
	doPan(-1 * panStep, 0);
}
function panRightButton() {
	doPan(panStep, 0);
}
function panDownButton() {
	doPan(0, panStep);
}

// makes sure the drawing tool is set up to enter avatar mode
// takes in the svg string of the avatar being edited
// myAvatarString == "" means blank/new avatar
function doAvatarEdit(myAvatarString) {
	
	// clear out everything from drawing area just in case
	svgClearAll();
	
	// load requested avatar if necessary
	if (myAvatarString != "") {
		svgLoadFromString(myAvatarString);
	}
	
	// set the mode
	previousMode = mode;
	mode = artMode;
	avatarEditing = true;
	
	// display correct divs and header
	canvas.appendChild(avatarEllipse);
	drawingGroup.setAttribute("clip-path", "url(#avatarClipPath)");
	maskingToggleDiv.style.display = "none";
	pageHeader.innerHTML = avatarHeader;
	borderArtDiv.style.display = "none";
	showDiv(mode);

	// set the submit/done button's function
	document.getElementById("artSubmitBtn").onclick = submitAvatarButton;

	// get the offsets here insetad because these scripts ran in the
	var coords = canvas.getBoundingClientRect();
	xOffset = coords.left;
	yOffset = coords.top;
	
	// debug message
	if (debugging) {
		console.log("Loaded editor for avatar creation.");
	}
}

// exits from the currently edited avatar back into game mode
// does not save the current edits!
function doAvatarExit() {
	
	// clear out all the current SVG
	svgClearAll();
	
	// reset drawing tool defaults
	svgResetDefaults();
	
	// set the mode
	previousMode = mode;
	mode = gameMode;
	avatarEditing = false;

	// display correct div
	canvas.removeChild(avatarEllipse);
	drawingGroup.setAttribute("clip-path", "");
	borderArtDiv.style.display = "block";
	showDiv(mode); // handles hiding message box div
	
	// debug message
	if (debugging) {
		console.log("Exited avatar editing screen.");
	}
	
	// make crafty reload the art assets for the carousel
	// and put the carousel into My Avatars mode regardless of previous mode
	Crafty("myAvatarButton").trigger("Click");
	loadMyAvatarsToCarousel(numAvatars);
	toggleButtonsOnNew();
}

//MARK'S PASSWORD AND EDIT CHECK CODE STARTS HERE
//helper functions to the below password check. Mainly involve POSTing
//tile and password data.
//Request functions:
//callback function should return status code indicating if there is a pw
//or not on an editable tile, or if tile is uneditable.
function tileEditRequest(xTile,yTile){
	if (verboseDebugging){
		console.log("x,y");
		console.log(xTile);
		console.log(yTile);
	}
	var payload = {};
	payload.xcoord = xTile;
	payload.ycoord = yTile;
	postRequest('/editcheck',payload,tileEditCallback,postOnError);
}

/*Tile edit callback has four possible request status responses as
  a precondition: 224, for a fresh, unedited tile (not in database)
  233 to initiate password prompt, 242 for edit deny (tile being edited).
  Request body has structure: {xcoord:x,ycoord:y,<message:m>}
*/
function tileEditCallback(request){
	//if the response is green-lighted (224), return it to commence with do edit
	var body = JSON.parse(request.responseText);
	if (verboseDebugging)
	{
		console.log("TILE EDIT CALLBACK STATUS: ");
		console.log(request.status);
		console.log("BODY");
		console.log(body);
	}
	if (request.status === 224){
		if (verboseDebugging){
			console.log("Edit authorization success.");
			passwordApproved(body.xcoord,body.ycoord,'');
		}
		return request.status;
	}
	else if (request.status === 242){
		if (verboseDebugging){
			console.log("Edit authorization failed: Currently being edited.");
		}
		displayMessage(body.message,doTileExitNoFree,doTileExitNoFree,false,false);
		return request.status;
	}
	else if (request.status === 233){
		if (verboseDebugging){
			console.log("Password set. Proceeding to password enter procedure.");
		}
		//build parameter object for submit so that client can tell server what coordinates
		//the password they entered goes to:
		var args = {};
		args.xcoord = body.xcoord;
		args.ycoord = body.ycoord;
		//both of the button functions contain ways of returning text field to normal
		displayMessage(body.message,passwordSubmit,doTileExit,true,false,false,true,args);
	}
}

//this proceeds the function above, gathering the password data and sending it to the server
//the coordinates are optionally passed in case it is called from a non-callback context.
function passwordSubmit(xcoord,ycoord){
	var payload = {};
	//gather password
	var field = document.getElementById('msgTextInput');
	payload.pw = field.value;
	payload.x = xcoord;
	payload.y = ycoord;
	if (verboseDebugging){
		console.log("submittin what'n i think is the passwort");
		console.log(payload);
	}
	postRequest('/pwcheck',payload,passwordResponse,postOnError,payload.pw);
}

//this will either get an OK to edit the tile or a denial, which displays a new password prompt
//then loops back to the function above. Data should include {xcoord:x,ycoord:y}
function passwordResponse(request,pw,initCoords){
	if (verboseDebugging){
		console.log("we're inna passwud respornse");
		console.log("response obj:");
		console.log(request.responseText);
	}
	var body = JSON.parse(request.responseText);
	//if someone is now editing the tile, you must go back to game mode
	if (request.status === 242){
		if (verboseDebugging){
			console.log("Edit authorization failed: Currently being edited.");
		}

		displayMessage(body.message,doTileExitNoFree,doTileExitNoFree,false,true,false);
		return request.status;
	}
	//299 is code for incorrect password
	else if (request.status === 299){
		if (verboseDebugging){
			console.log("Password incorrect.");
		}
		var repromptPassword = "Password incorrect " + body.message;
		var initCoords = {};
		initCoords.xcoord = body.xcoord;
		initCoords.ycoord = body.ycoord;
		//
		displayMessage(repromptPassword,passwordSubmit,doTileExitNoFree,true,false,false,true,initCoords);
	}
	//else password is confirmed.
	else if (request.status === 224){
		if (verboseDebugging){
			console.log("Password correct. Moving to edit.");
		}
		passwordReprompt = true;
		passwordApproved(body.xcoord,body.ycoord,pw);
	}
}

//this last helper function condenses transition between password and setting up art tool
//which allows to be neatly called in password success callbacks at various stages.
function passwordApproved(xTile,yTile,password){
	// clear out everything from drawing area just in case
	messageDiv.style.display = "none";
	svgClearAll();
	if (verboseDebugging){
		console.log("in pw approved");
		console.log("x,y,pw");
		console.log(xTile);
		console.log(yTile);
		console.log(password);
	}

	svgLoadFromServer(xTile, yTile, password);

	doLoadSurroundingsFromServer();
	
	
	// set the mode
	previousMode = mode;
	mode = artMode;
	avatarEditing = false;

	// display correct divs and header
	maskingToggleDiv.style.display = "block";
	pageHeader.innerHTML = drawingHeader;
	showDiv(mode);

	// set the submit/done button's function
	document.getElementById("artSubmitBtn").onclick = submitTileButton;

	// get the offsets again here
	var coords = canvas.getBoundingClientRect();
	xOffset = coords.left;
	yOffset = coords.top;
	
	// debug message
	if (debugging) {
		console.log("Loaded editor for tile (" + xTile.toString() + ", " + yTile.toString() + ").");
	}
}

// switches from game mode into tile edit mode
// if the player has access to the current tile
// Mark had to add args
function doTileEdit(currentX, currentY) {
	// make sure xTile and yTile are set correctly
	if (currentX && currentY) {
		xTile = currentX;
		yTile = currentY;
	}
	
	// ### Mark - do tile lockout and password check stuff here
		/*  The logic flows from general to specific according to info required from the client.
		First case, the tile has never been edited (not in database) or the tile is being
		edited (which can only be done by one client at a time, regardless of ownership).
		If the tile is not owned or owned but no password is set, continue to the editor.
		Else, prompt to enter the password. If the server returns that the password does not
		match, say so, repeat, or cancel and make message div invisible and return to gameplay.
	*/
	tileEditRequest(xTile,yTile);
	
	// clear out everything from drawing area just in case
	/*svgClearAll();
	
	// load the tile and its surroundings from the server
	svgLoadFromServer(xTile, yTile, password);
	doLoadSurroundingsFromServer();
	
	// set the mode
	previousMode = mode;
	mode = artMode;
	avatarEditing = false;

	// display correct divs and header
	maskingToggleDiv.style.display = "block";
	pageHeader.innerHTML = drawingHeader;
	showDiv(mode);

	// set the submit button's function
	document.getElementById("artSubmitBtn").onclick = submitTileButton;

	// get the offsets again here
	var coords = canvas.getBoundingClientRect();
	xOffset = coords.left;
	yOffset = coords.top;
	
	// debug message
	if (debugging) {
		console.log("Loaded editor for tile (" + xTile.toString() + ", " + yTile.toString() + ").");
	}*/
}

// exits from the currently edited tile back into game mode
// does not save the current edits!
function doTileExit() {
	if (verboseDebugging){
		console.log("in doTileExit debugging");
		console.log("this is good");
	}
	messageDiv.style.display = "none";
	passwordDiv.style.display = "none";

	//make sure to return repromptPassword flag to default if changes
	repromptPassword = false;

	//send a request to free up the tile for editing again
	var payload = {};
	payload.xcoord = xTile;
	payload.ycoord = yTile;
	if (verboseDebugging){
		console.log("Payload to freetile");
		console.log(payload);
	}
	postRequest('/freetile',payload,exitCallback,postOnError);
}

// exits from the currently edited tile back into game mode
// does not save the current edits! Save as above but no free
// because edit wasnt set. Mainly used for cancels so that people
// cannot use a cancel to steal a tile before they gain edit access
// if someone else is editing.
function doTileExitNoFree() {
	if (verboseDebugging){
		console.log("in doTileExit debugging");
		console.log("this is good");
	}
	messageDiv.style.display = "none";
	passwordDiv.style.display = "none";

	//make sure to return repromptPassword flag to default if changes
	repromptPassword = false;

	//send a request to free up the tile for editing again
	var payload = {};
	payload.xcoord = xTile;
	payload.ycoord = yTile;
	if (verboseDebugging){
		console.log("Payload to freetile");
		console.log(payload);
	}
}

function exitCallback(request){
	// clear out all the current SVG
	svgClearAll();
	
	// reset drawing tool defaults
	svgResetDefaults();
	
	// set the mode
	previousMode = mode;
	mode = gameMode;

	// display correct div
	showDiv(mode); // handles hiding message box div
	
	// debug message
	if (debugging) {
		console.log("Exited tile editing screen.");
	}
	
	// make crafty reload the art assets for this tile
	initAssetRequest(xTile, yTile);
}

// update color selections from the SVG
function setColorChoiceInHTML(color) {
	var colorPicker = document.getElementById("color");
	colorPicker.value = color;
	svgSetColor(color); // send back to SVG just in case
}

// start Mark's code
// helper functions
function artToString(){
	//using jQuery nodes, art group is index 3, platform 4
	//find id
	var groups = canvas.childNodes;
	if (verboseDebugging) {
		console.log(groups);
	}
	var groupArray = Array.prototype.slice.call(groups);
	if (verboseDebugging) {
		console.log(groupArray);
	}
	var targetNum;
	for (var i = 0 ; i < groupArray.length ; i += 1){
		if (verboseDebugging) {
			console.log(groupArray[i].nodeName);
		}
		if (groupArray[i].nodeName === "g"){
			if (groupArray[i].getAttribute("id") === "drawingGroup"){
				if (verboseDebugging) {
					console.log()
					console.log(groupArray[i].getAttribute("id"));
				}
				targetNum = i;
			}
		}
	}
	if (targetNum === null){
		if (debugging){
			console.log("NO ART GROUP FOUND");
		}
	}
	else {
		return groupToString(targetNum);
	}
}

function platformToString(){
	//using jQuery nodes, art group is index 3, platform 4
	//find id
	var groups = canvas.childNodes;
	var groupArray = Array.prototype.slice.call(groups);
	var targetNum;
	for (var i = 0 ; i < groupArray.length ; i += 1){
		if (groupArray[i].nodeName === "g"){
			if (groupArray[i].getAttribute("id") === "platformsGroup"){
				targetNum = i;
			}
		}
	}
	if (targetNum === null){
		if (debugging){
			console.log("NO PLATFORMS GROUP FOUND");
		}
	}
	else {
		return groupToString(targetNum);
	}
}

function groupToString(groupnum){
	//using nodes, art group is index 3, platform 4
	// slight modification by Toni to use extant canvas variable
	var tarGroup = canvas.childNodes[groupnum];
	//use xml serializer to convert inaccessible InnerHTML to String
	var serializer = new XMLSerializer();
	var groupstring = serializer.serializeToString(tarGroup);
	//return the string
	if (verboseDebugging){
		console.log("This is the string being exported:");
		console.log(groupstring);
	}
	return groupstring;
}
// end Mark's code

// Toni's generic version of the SVG-to-Canvas function
// adapted from Mark's version
// puts myGroupStr's data into myContext's canvas
// using given clipping values
function putGroupInCanvas(myGroupStr, myContext, clipX, clipY, clipW, clipH, canvX, canvY, canvW, canvH) {
	// prepend and append svg open and close tag constants
	myGroupStr = svgPrepend + myGroupStr + svgAppend;
	// debug message
	if (verboseDebugging) {
		console.log(myGroupStr);
	}
	// use a blob to put the SVG into the context
	// adapted from http://stackoverflow.com/questions/27230293/
	var blobSvg = new Blob([myGroupStr],{type:"image/svg+xml;charset=utf-8"}),
		domURL = self.URL || self.webkitURL || self,
		url = domURL.createObjectURL(blobSvg),
		img = new Image;
		img.onload = function(){
			// clear the given canvas
			// ??? still hard-coded to hiddenCanvas.width and height... oops
			// but seems to work b/c those are maximum for all the canvases
			myContext.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
			// draw the new image
			myContext.drawImage(img, clipX, clipY, clipW, clipH, canvX, canvY, canvW, canvH);
		}
		img.src = url;
}

// load the current SVG into the canvas, overwriting the old data
// version written by Toni to use the generic putGroupinCanvas function 
function updateCanvas() {
	putGroupInCanvas(artToString(), hiddenContext, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
}

// helper functions to convert rgb integers into a hex color string
function intToHexString(int) {
	var hexString = int.toString(16);
	if (hexString.length < 2) {
		hexString = "0" + hexString;
	}
	return hexString;
}
function rgbToHexString(red, green, blue) {
	var redString = intToHexString(red);
	var greenString = intToHexString(green);
	var blueString = intToHexString(blue);
	var hexString = "#" + redString + greenString + blueString;
	return hexString;
}

// get the color of a pixel at the given coordinate in the given context
function getColorAt(myContext, xCoord, yCoord) {
	var pixelData = myContext.getImageData(xCoord, yCoord, 1, 1);
	var red = pixelData.data[0];
	var green = pixelData.data[1];
	var blue = pixelData.data[2];
	var color = rgbToHexString(red, green, blue);
	if (debugging) {
		console.log("Eye dropper at (" + xCoord.toString() + ", " +
				yCoord.toString() + ") found color: " + color);
	}
	return color;
}

// get the color of a pixel at the given coordinate in the drawing
// this is the function the SVG calls
function getColorInDrawingAt(xCoord, yCoord) {
	return getColorAt(hiddenContext, xCoord, yCoord);
}

// perform the eye dropper for the surrounding art
function surroundingEyeDropper(evt) {
	// only do this if the eye dropper is the selected tool
	if (document.getElementById("eyeDropper").checked) {
		// figure out which canvas you're in and get its context
		var myCanvas = evt.target;
		var myContext = myCanvas.getContext("2d");
		// get click coordinates in this canvas
		var dropperCoords = myCanvas.getBoundingClientRect();
		var mouseX = evt.clientX - dropperCoords.left;
		var mouseY = evt.clientY - dropperCoords.top;
		// do not need to adjust for zoom/pan, because the function that reads
		// the color data uses the current context, not the pre-zoom/pan context
		// get the color at that pixel in that region
		var color = getColorAt(myContext, mouseX, mouseY);
		// set this as the color choice
		setColorChoiceInHTML(color);
	} // else do nothing
}


/* CODE FROM SVG PORTION */

var xTile = 0;					// x-coord of tile
var yTile = 0;					// y-coord of tile
//var password = "12345";			// user-entered password string for tile //MARK commented this out
var svgFileHeader = "<!--FROM THE BLANK--\>";	// for generated files
var loadingPage = true;			// flag to mark initial page loading
var masking = false;			// toggle the platform masking tools
var canvas;						// the SVG drawing region
var drawingGroup;				// the group of SVG art objects
var platformsGroup;				// the group of SVG platform objects
var deadPlatformsGroup;			// the group of deleted platform objects
var deadPlatformsList = [];		// a LIFO list of deleted platform objects
var undoneDrawingGroup;			// the group of undone art objects
var undoneDrawingList = [];		// a LIFO list of undone art objects
var undonePlatformsGroup;		// the group of undone platform objects
var undonePlatformsList = [];	// a LIFO list of undone platform objects
var platformActionsList = [];	// a LIFO list of done platform actions
var svgns;						// the namespace for SVG
var xOffset = 0;				// offsets of the canvas in the page
var yOffset = 0;
var xStart = 0;					// start coords of current shape
var yStart = 0;
var xMouse = 0;					// mouse coords of current event
var yMouse = 0;
var colorChoice = "#000000";	// currently selected color
var eraserColor = "#ffffff";	// the color the eraser uses
var wallColor = "black";		// colors for platforms
var ladderColor = "red";
var toolList = ["Rectangle", "Ellipse", "Polygon", "Brush", "Eraser",
				"Eye Dropper", "Paint Can", "Wall", "Ladder", "Select"];
var toolChoice = 0;				// currently selected tool
var previousDrawTool = 0;		// saved tool choice for mode switching
var previousPlatformTool = 7;	// saved tool choice for mode switching
var strokeWidthChoice = 5;		// currently selected stroke width
var shapeFillChoice = false;	// currently selected fill option
var shapeFillNone = "none";
var shapeFillChoiceString = shapeFillNone;
var objectStr = "o";			// to distinguish drawn object IDs
var platformStr = "p";			// to distinguish platform IDs
var currentObject = 1;			// ID# of current drawn object
var currentPlatform = 1;		// ID# of current platform
var selectedPlatform = -1;		// ID# of currently-selected platform
// ex: a drawn object's ID would be "o0", "o1", etc.
var selectedPlatformOldColor;	// original color of the currently-selected platform
var selectedPlatformColor = "#ffff00"; // selected platform is turned yellow
var inProgress = false;			// shape currently in progress?
var polygonCloseGap = 3;		// how close is final click of polygon?
var polygonStartMarker = "polygonPointMarker";	// id string for polygon start marker
var polygonPointMarker = "polygonStartMarker";	// id string for polygon point marker
var polygonMarkerRadius = 3;	// size of the polygon point markers

// reset all SVG globals to default values
function svgResetDefaults() {
	// reset the zoom and pan
	doZoomReset();
	
	// turn off masking/platform editing if it was on
	masking = false;
	svgSetMasking(masking);
	
	// set other global variables
	xStart = 0;
	yStart = 0;
	xMouse = 0;
	yMouse = 0;
	colorChoice = "#000000";
	toolChoice = 0;
	previousDrawTool = 0;
	previousPlatformTool = 7;
	strokeWidthChoice = 5;
	shapeFillChoice = false;
	shapeFillChoiceString = shapeFillNone;
	inProgress = false;
	
	// make the HTML form match the defaults as well
	document.getElementById("maskingToggle").checked = masking;
	document.getElementById("strokeWidthInput").value = strokeWidthChoice;
	document.getElementById("color").value = colorChoice;
	document.getElementById("shapeFillInput").checked = shapeFillChoice;
	document.getElementById("tool0").checked = true;
	document.getElementById("tool7").checked = true;
}

// initial setup of SVG
function initSVG(evt) {
	
	// select the empty svg object, get its namespace
	canvas = document.getElementById("svgCanvas");
	svgns = canvas.namespaceURI;
	
	// create the drawn objects group
	drawingGroup = document.createElementNS(svgns, "g");
	drawingGroup.setAttribute("id", "drawingGroup");
	drawingGroup.setAttribute("style", "opacity: 1");
	canvas.appendChild(drawingGroup);
	
	// create the platforms group
	platformsGroup = document.createElementNS(svgns, "g");
	platformsGroup.setAttribute("id", "platformsGroup");
	platformsGroup.setAttribute("style", "visibility: hidden");
	platformsGroup.addEventListener("click", platformClick);
	canvas.appendChild(platformsGroup);
	
	// create the dead/deleted platforms group
	deadPlatformsGroup = document.createElementNS(svgns, "g");
	deadPlatformsGroup.setAttribute("id", "deadPlatformsGroup");
	deadPlatformsGroup.setAttribute("style", "visibility: hidden");
	canvas.appendChild(deadPlatformsGroup);

	// create the undone objects groups
	undoneDrawingGroup = document.createElementNS(svgns, "g");
	undoneDrawingGroup.setAttribute("id", "undoneDrawingGroup");
	undoneDrawingGroup.setAttribute("style", "visibility: hidden");
	canvas.appendChild(undoneDrawingGroup);
	undonePlatformsGroup = document.createElementNS(svgns, "g");
	undonePlatformsGroup.setAttribute("id", "undonePlatformsGroup");
	undonePlatformsGroup.setAttribute("style", "visibility: hidden");
	canvas.appendChild(undonePlatformsGroup);

	// set up event listeners for the canvas
	// mousemove and mouseup have to be added to the entire document
	// (not just the canvas) after refactoring the SVG to be inline
	canvas.addEventListener("mousedown", mouseDown);
	document.addEventListener("mousemove", mouseMove);
	document.addEventListener("mouseup", mouseUp);
	canvas.addEventListener("click", mouseClick);
	canvas.addEventListener("wheel", scrollWheel);

	// load data from the server
	//svgLoadFromServer(xTile, yTile, password);
	
	// debug message
	if (debugging) {
		console.log("Loaded SVG with debug messages turned on.");
	}

	// set flag
	pageLoading = false;
}

// start Mark's code
//KEEP: HELPER FUNCTION TO GENERATE FORMATTED SURROUNDING PAYLOAD GIVEN CURRENT TILE
function generateSurroundingsPayload(){
	if (verboseDebugging){
		console.log("generating surroundings: xTile is now:");
		console.log(xTile);
		console.log("yTile is now:");
		console.log(yTile);
	}
	//initialize payload JS object
	var payload = new Object();
	//cycle through every key in the dict
	for (var key in coordinatePairs){
		//if key is not the middle, add adjusted coord to payload
		if (!(key === "cm")){
			var x = xTile + coordinatePairs[key]["x"];
			var y = yTile + coordinatePairs[key]["y"];
			payload[key] = {x,y};
		}
	}
	//return array of SVG XML as JSON object
	if (verboseDebugging){
		console.log("Payload for surroundings POST:");
		console.log(payload);
		console.log("String:");
		console.log(JSON.stringify(payload));
	}
	return payload;
}

//KEEP: HELPER FUNCTION : args url to post, payload as Object, onload function, error function
function postRequest(url,payload,onload,error,passwordSubmit){
	var reqStatus;
	var request = new XMLHttpRequest();
	request.open("POST",url,true);
	request.setRequestHeader('Content-Type','application/json; charset=UTF-8');
	//request.responseType = "json";
	request.onload = function(){
		if (request.readyState === 4){
			    //200: General OK ;       224: Tile not previously edited
			if (request.status === 200 || request.status === 224 ||
				//233: Tile has password; 242: Tile being edited currently
			    request.status === 233 || request.status === 242 ||
			    //299: Password is incorrect:
			    request.status === 299) {
				if (passwordSubmit){
					onload(request,passwordSubmit);
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
//KEEP: HELPER FUNCTION: request error helper
function postOnError(request){
	
	// start Toni's code
	// when error connecting to the server and if not using fake surroundings
	// then fill all the boundary regions with white pixels manually
	// so blank tiles will read white to the eye dropper tool
	if (!useFakeSurroundings) {
		var colorBlock;
		for (var i = 0; i < displayDivCanvasList.length; i += 1) {
			// don't try to do anything in the center div
			if (i != getKeyByVal(displayDivDict, "centerDiv")) {
				// create the color block in canvas i
				currentCanvas = displayDivCanvasList[i];
				currentContext = displayDivContextList[i];
				colorBlock = currentContext.createImageData(currentCanvas.width, currentCanvas.height);
				for (var j = 0; j < colorBlock.data.length; j += 4) {
					colorBlock.data[j+0] = 255;
					colorBlock.data[j+1] = 255;
					colorBlock.data[j+2] = 255;
					colorBlock.data[j+3] = 255;
				}
				currentContext.putImageData(colorBlock, 0, 0);
			}
		}
	}
	// end Toni's code
	
	if (verboseDebugging) {
		console.log("ERROR");
		console.log("REQUEST");
		console.log(request);
		console.log("REQUEST STATUS");
		console.log(request.status);
		console.log(request.getAllResponseHeaders());
		console.error(request.statusText);
	}
}
//KEEP: HELPER FUNCTION: ASYNCH LOAD INTO SURROUNDING TILES
function surroundingsOnLoad(request){
	if (request.readyState === 4){
		if (request.status === 200 || request.status === 0) {
			body = JSON.parse(request.responseText);
			if (verboseDebugging){
				console.log("Response Body:");
				console.log(body);
			}
			var alreadyDrawn = {};
			
			// start Toni's code
			// clear out any existing originalEdgesDict info
			// reference: https://stackoverflow.com/questions/684575/how-to-quickly-clear-a-javascript-object
			// using the linear-time solution b/c never more than 4 entries to delete
			for (var prop in originalEdgesDict) {
				if (originalEdgesDict.hasOwnProperty(prop)) {
					delete originalEdgesDict[prop];
				}
			}
			// end Toni's code			

			//this will color all tiles with legit art assets
			for (key in body){
				//get canvas that matches up with key
				var targetCanvas = document.getElementById(coordinatePairs[key]["canvasId"]);
				//get that canvas context
				var targetContext = targetCanvas.getContext("2d");
				// start Toni's code
				// based on which surrounding edge this is, modify its top left corner coordinates
				var clipX = 0;
				var clipY = 0;
				var clipW = canvasWidth;
				var clipH = canvasHeight;
				if (key == "ul" || key == "cl" || key == "bl") {
					// tiles 0, 3, and 6 show only leftmost edges
					// and are only canvasEdge wide
					clipX = canvasWidth - canvasEdge;
					clipW = canvasEdge;
				}
				if (key == "ur" || key == "cr" || key == "br") {
					// tiles 2, 5, and 8 are only canvasEdge wide
					clipW = canvasEdge;
				}
				if (key == "ul" || key == "uc" || key == "ur") {
					// tiles 0, 1, and 2 only show bottommost edges
					// and are only canvasEdge tall
					clipY = canvasHeight - canvasEdge;
					clipH = canvasEdge;
				}
				if (key == "bl" || key == "bm" || key == "br") {
					// tiles 6, 7, and 8 are only canvasEdge tall
					clipH = canvasEdge;
				}
				var canvW = clipW;
				var canvH = clipH;
				// if tile 1, 3, 5, or 7, save original version for zoom/pan
				if (key == "uc" || key == "cl" || key == "cr" || key == "bm") {
					if (!originalEdgesDict.hasOwnProperty(key)) {
						originalEdgesDict[key] = body[key]['svg'];
					}
				}
				// end Toni's code
				putGroupInCanvas(body[key]['svg'],targetContext, clipX, clipY, clipW, clipH, 0, 0, canvW, canvH);
				alreadyDrawn[key] = key;
			}
			for (tile in coordinatePairs){
				//color in all tiles not yet colored in and not center tile with a blank white rectangle
				if (!(alreadyDrawn[tile] === tile)){
					//if not the middle tile which is SVG, not Canvas
					if (!(coordinatePairs[tile]["canvasId"] === "svgCanvas")){
						var blankCanvas = document.getElementById(coordinatePairs[tile]["canvasId"]);
						var blankContext = blankCanvas.getContext("2d");
						putGroupInCanvas("<rect width=\"600\" height=\"350\" fill=\"white\"></rect>",blankContext, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
					}
				}
			}
		} else {
			console.error(request.statusText);
		}
	}
	
	// debug message
	if (debugging) {
		console.log("Loaded surroundings for current tile.");
	}
}
// end Mark's code

// get an element's ID number from its ID string, given its type
// typestring should be either objectStr or platformStr
function getIDNumFromIDString(typestring, idstring) {
	return parseInt(idstring.substring(typestring.length, idstring.length));
}

// helper function to save the given svg data to the given file
// modified from: http://stackoverflow.com/a/33542499
function saveToFile(filename, textdata) {
	var blob = new Blob([textdata], {type: 'text/plain'});
	if (window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveBlob(blob, filename);
	} else {
		var elem = window.document.createElement('a');
		elem.href = window.URL.createObjectURL(blob);
		elem.download = filename;        
		document.body.appendChild(elem);
		elem.addEventListener("click", function(evt) {
			//evt.preventDefault(); // stops page reload, but also stops save operation!
			document.body.removeChild(elem);
			window.URL.revokeObjectURL(blob);
		});
		elem.click();
	}
}

// save current drawing data to local storage
// borrows a bit from Mark's code for loading/saving SVG on the server
// references: https://www.html5rocks.com/en/tutorials/file/dndfiles/
function svgSaveToLocal() {
	handleShapeInProgress();
	
	// generate the file string
	var myFileString = svgFileHeader +
						svgMinPrepend +
						artToString() +
						platformToString() +
						svgAppend;
			
	// get filename to save to
	myFileName = "art.svg";
	if (msgTextInput.value != "") {
		myFileName = msgTextInput.value;
	}
	if (myFileName.substr(myFileName.length - 4) != ".svg") {
		myFileName += ".svg";
	}

	// call helper function
	saveToFile(myFileName, myFileString);
	
	// debug message
	if (debugging) {
		console.log("Saved SVG data to file: " + myFileName);
	}

	// hide message box
	messageDiv.style.display = "none";
}

// helper function that empties out all the SVG data currently stored in the page
function svgClearAll() {
	
	// clear out undo and redo information
	clearUndoRedoLists();
	
	// clear out drawn objects
	var myObject;
	for (var i = 1; i < currentObject; i += 1) {
		myObject = document.getElementById(objectStr + i.toString());
		if (myObject != null) {
			drawingGroup.removeChild(myObject);
		}
	}
	currentObject = 1;

	// clear out platform objects
	var myParent;
	for (var j = 1; j < currentPlatform; j += 1) {
		myObject = document.getElementById(platformStr + j.toString());
		if (myObject != null) {
			myParent = myObject.parentNode;
			myParent.removeChild(myObject);
		}
	}
	currentPlatform = 1;
	
	// clear out platform actions list
	for (var i = platformActionsList.length - 1; i >= 0; i -= 1) {
		myID = platformActionsList.pop();
	}
}

// helper function loads a given SVG string into the drawing canvas
// references: https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
function svgLoadFromString(myString) {
	//clear current canvas. MARK moved this to top of function to re-establish DOM earlier.
	svgClearAll();
	
	// parse the given string into a document and get its parts
	var parser = new DOMParser();
	var doc = parser.parseFromString(myString, "image/svg+xml");
	var strDrawingGroup = doc.documentElement.getElementById("drawingGroup");
	var strPlatformsGroup = doc.documentElement.getElementById("platformsGroup");
	
	// set up to copy data
	// have to slice to real arrays so looping will work correctly
	var myObject;
	var drawingArray = Array.prototype.slice.call(strDrawingGroup.children);
	var platformsArray = Array.prototype.slice.call(strPlatformsGroup.children);

	// copy drawing data and update currentObject counter
	for (var i = 0; i < drawingArray.length; i += 1) {
		myObject = drawingArray[i];
		drawingGroup.appendChild(myObject);
		currentObject += 1;
		if (verboseDebugging) {
			console.log("Loaded object with ID#: " + i.toString() + " / " + myObject.id);
		}
	}

	// copy platform data and update currentPlatform counter
	for (var j = 0; j < platformsArray.length; j += 1) {
		myObject = platformsArray[j];
		platformsGroup.appendChild(myObject);
		platformActionsList.push(getIDNumFromIDString(platformStr, myObject.id));
		if (verboseDebugging) {
			console.log("Loaded platform with ID#: " + j.toString() + " / " + myObject.id);
		}
	}
	if (platformsArray.length != 0) {
		currentPlatform = getIDNumFromIDString(platformStr, platformsArray[platformsArray.length - 1].id) + 1;
	}
}

// helper function that is called when user chooses a file to load
// borrows a bit from Mark's code for loading/saving SVG on the server
// references: https://www.html5rocks.com/en/tutorials/file/dndfiles/
function doLoadFromLocal() {
	// only continue with action if user actually selected a file
	if (myFileInput.files.length != 0) {
		// open file and grab contents
		var myReader = new FileReader();
		myReader.onloadend = function(evt) {
			var myFileString = evt.target.result;
			
			// extract the header and svg data from this string
			var myFileHeader = myFileString.slice(0, svgFileHeader.length);
			var myFileSVG = myFileString.slice(svgFileHeader.length, myFileString.length);
			
			// debug printouts
			if (verboseDebugging) {
				console.log("Found file header: " + myFileHeader);
				console.log("Found file contents:");
				console.log(myFileSVG);
			}
			
			// validate that this is a file generated by this app
			if (myFileHeader == svgFileHeader) {
				// load this into the svg drawing canvas
				svgLoadFromString(myFileSVG);
				
				// debug message
				if (debugging) {
					console.log("Loaded drawing and platform data from a valid file.");
				}
				
				// hide message box
				messageDiv.style.display = "none";
			} else { // error message
				// use custom message box
				displayMessage("Sorry, that is not a valid file.", doNothing, doNothing, false, true)
			
				// debug message
				if (debugging) {
					console.log("Tried to load drawing and platform data from an invalid file.");
				}
			}
		};
		myReader.readAsText(myFileInput.files[0]);
	} else { // do nothing with the request
		// hide message box
		messageDiv.style.display = "none";
	}
}

// load drawing data from local storage
function svgLoadFromLocal() {
	handleShapeInProgress();
	doZoomReset();

	// choose file to load from
	myFileInput.value = "";
	myFileInput.addEventListener("change", doLoadFromLocal);
	myFileInput.click();
}

// START MARK'S EDIT SUBMIT CODE
//HELPER CALLBACK FUNCTION TO SERVER SUBMIT
function editSubmitCallback(request,pw){
	if (verboseDebugging)
	{
		console.log("we in edit submit callback nao");
		console.log("pw is:");
		console.log(pw);
	}
	var body = JSON.parse(request.responseText);
	tempXcoord = body.xcoord;
	tempYcoord = body.ycoord;
	if (request.readyState === 4){
		if (request.status === 200) {
			if (verboseDebugging) {
				console.log(request.responseText);					
				// debug message
				if (debugging) {
					console.log("Submitted drawing and platform data to the server.");
				}
				//here is where the user is prompted for a new password
				newPasswordPrompt(tempXcoord,tempYcoord,pw);
			}
		} else {
			if (verboseDebugging) {
				editError();
				console.error(request.statusText);
			}
		}
	}
}

//helper function that reprompts for password on submit. initCoords in
//format: {xcoord:x,ycoord:y}
function promptPWOnEdit(message,initCoords){
	//prompt the user to reenter password
	if (verboseDebugging){
		console.log("password prompt message:");

	}
	displayMessage(message,editPWSubmit,removePrompt,true,false,false,true,initCoords);
}

function editPWSubmit(xcoord,ycoord){
	var payload = {};
	payload.pw = document.getElementById("msgTextInput").value;
	payload.x = xcoord;
	payload.y = ycoord;
	if (verboseDebugging){
		console.log("password check payload log");
		console.log(payload);
	}
	postRequest('/finalpwcheck',payload,editPWResponse,postOnError,payload.pw);
}

//editPWResponse parses the possible outcomes of the password check and routes
//appropriately
function editPWResponse(request,pw){
	var body = JSON.parse(request.responseText);
	//299 is code for incorrect password
	if (request.status === 299){
		if (verboseDebugging){
			console.log("Password incorrect.");
		}
		var repromptPassword = "Password incorrect " + body.message;
		var initCoords = {};
		initCoords.xcoord = body.xcoord;
		initCoords.ycoord = body.ycoord;
		initCoords.pw = pw;
		//
		displayMessage(repromptPassword,editPWSubmit,removePrompt,true,false,false,pw,initCoords);
	}
	//else password is confirmed. Note that 242 is success because tile is being edited.
	else if (request.status === 224){
		if (verboseDebugging){
			console.log("Password correct. Moving to edit.");
		}
		passwordReprompt = false;
		editPasswordApproved(body.xcoord,body.ycoord,pw);
	}
}

//helper function for password submit cancel
function removePrompt(){
	messageDiv.style.display = "none";
	passwordDiv.style.display = "none";
}

//newPasswordPrompt displays a messsage and handles a new password field
function newPasswordPrompt(xcoord,ycoord,pw){
	if (verboseDebugging){
		console.log("we in new pw prompt nao");
		console.log("pw is: ");
		console.log(pw);
	}
	messageDiv.style.display = "none";
	//Gather prompt arguments and pass them along to handler.
	var initCoords = {};
	initCoords.xcoord = xcoord;
	initCoords.ycoord = ycoord;

	//set up new prompt in HTML DOM. Make sure that defaults are reset.
	displayPassword("If you wish to set a new password, enter it and confirm.\nIf you wish to keep the previous password, press Don't Change\nIf you wish to keep the tile public, press Make Public",
					checkPasswordMatch,pw,initCoords);

}

//this is called first if new password is set
function checkPasswordMatch(xcoord,ycoord,pw){
	messageDiv.style.display = "none";
	var firstPass = document.getElementById('firstPassword').value;
	var secondPass = document.getElementById('secondPassword').value;
	if (verboseDebugging){
		console.log("first pass value:");
		console.log(firstPass);
		console.log("second pass value:");
		console.log(secondPass);
		console.log("pw arg:");
		console.log(pw);
	}
	if (firstPass === secondPass){
		submitNewPassword(xcoord,ycoord,pw,firstPass);
	}
	else {
		var initCoords = {};
		initCoords.xcoord = xcoord;
		initCoords.ycoord = ycoord;
		displayPassword("The passwords you entered did not match.\nIf you wish to set a new password, enter it and confirm.\nIf you wish to keep the previous password, press Don't Change\nIf you wish to keep the tile public, press Make Public"
		   , checkPasswordMatch, pw ,initCoords);
	}
}

//follows checkPasswordMatch if user chooses to set a new password, otherwise it is first
function submitNewPassword(xcoord,ycoord,pw,newpw){
	//construct the password payload
	var payload = {};
	payload.xcoord = xcoord;
	payload.ycoord = ycoord;
	if (!(pw===null) && !(pw===undefined)){
			payload.pw = pw;
	}
	else {
		payload.pw = '';
	}
	if (!(newpw===null) && !(newpw===undefined)){
		payload.newpw = '';
	}
	payload.newpw = newpw;
	postRequest('/pwset',payload,submitNewPwPost,postOnError);
}

function submitNewPwPost(request){
	if (request.status < 400 || request.status > 599){
		completeEdit();
	}
	else {
		if (verboseDebugging){
			console.error(request.status);
			console.error(request.responseText);
			pwUpdateError();
		}
	}
}

function completeEdit(){
// use message box to put up confirmation message
	passwordDiv.style.display = "none";
	displayMessage("Your art has been added to the world.", doTileExit, doTileExit, false);
}

//companinon to complete edit, but informs of an error in edit submission.
function editError(){
	displayMessage("There has been an error submitting your art.\nSave your work locally and try again later.",
		            removePrompt(),removePrompt(),false,false);
}

//this will inform that, due to a server error, no new password has been set. Edits still took.
function pwUpdateError(){
	displayMessage("There was an error updating the password. The previous\npassword will still be used to access the tile edit feature\nand any edits you have made have been saved. Try to reset\nthe password for this tile again later", removePrompt(),
					removePrompt(),false,false);
}

// MARK ADDED:  borrowed from Tony's displayMessage but conformed for passwords and more buttons
// textInputPassword is an optional field that can contain a boolean or a submitted password to
// pass along to a response button function.
// initCoords similarly are present only to pass along to event-driven subfunctions.
// these functions should include: passwordDiv.style.display = "none";
function displayPassword(msg, okFn, textInputPassword, initCoords) {
	removeEventListeners();
	messageDiv.style.display = "none";
	var pwdBtnOK = document.getElementById('pwdBtnOK');
	var pwdBtnCancel = document.getElementById('pwdBtnCancel');
	var pwdBtnSkip = document.getElementById('pwdBtnSkip');
	var pwdBtnPublic = document.getElementById('pwdBtnPublic');
	var passwordSetText = document.getElementById('passwordSetText');
	if (verboseDebugging){
		console.log("this should be the old password");
		console.log(textInputPassword);
	}
	passwordSetText.innerHTML = msg;
	if (initCoords){
		if (textInputPassword) {
			//this works because the truthiness of strings in Javascriprt. Both true and defined.
			pwdBtnOK.addEventListener('click',function clicked3(){
				this.removeEventListener('click',clicked3,false);
				okFn(initCoords.xcoord,initCoords.ycoord,textInputPassword);
				},false); 
		}
		else 
		{
			pwdBtnOK.addEventListener('click',function clicked3(){
				this.removeEventListener('click',clicked3,false);
				okFn(initCoords.xcoord,initCoords.ycoord);
			},false);
		}
		//if you cancel, you will go back to the editing screen
		pwdBtnCancel.addEventListener('click',function clicked4(){
			this.removeEventListener('click',clicked4,false);
			removePrompt();
			},false);
		//if you want to keep the same password, you are done editing. back to gameplay.
		pwdBtnSkip.addEventListener('click',function clicked5(){
			this.removeEventListener('click',clicked5,false);
			completeEdit();
			},false); 
		//if you want to keep public, explicitly set password to ""
		pwdBtnPublic.addEventListener('click',function clicked6(){
			if (verboseDebugging){
				console.log("pwdBtnPublic pressed");
			}
			this.removeEventListener('click',clicked6,false);
			passwordDiv.style.display = "none";
			//no pw argument will auto 
			submitNewPassword(initCoords.xcoord,initCoords.ycoord,textInputPassword,null);
			},false);
	} else {
		//should never get here but must be present to remove a borked event listener
		msgBtnOK.addEventListener('click',function clicked3(){
			this.removeEventListener('click',clicked3,false);
			},false);
		msgBtnCancel.addEventListener('click',function clicked4(){
			this.removeEventListener('click',clicked4,false);
			removePrompt();
			},false);
		pwdBtnSkip.addEventListener('click',function clicked5(){
			this.removeEventListener('click',clicked5,false);
			completeEdit();
			},false);
		pwdBtnPublic.addEventListener('click',function clicked6(){
			passwordDiv.style.display = "none";
			this.removeEventListener('click',clicked5,false);
			},false);
	}
	passwordDiv.style.display = "block";
}

//helper funciton that asks the user if they wish to change the password
function editPasswordApproved(xcoord,ycoord,pw){
	if (verboseDebugging){
		console.log("we edit pw approved nao");
		console.log("pw is:");
		console.log(pw);
	}
	var payload = {};
	if (xcoord && ycoord)
	{
		payload["xcoord"] = xcoord;
		payload["ycoord"] = ycoord;
	}
	else {
		payload["xcoord"] = xTile;
		payload["ycoord"] = yTile;
	}
	//release the edit block on this tile via the query
	payload["isBeingEdited"] = false;
	//password is used as query field. No-leak pw check. Cannot bypass PW with POSTman to /edit
	if (pw) {
		if (verboseDebugging){
			console.log("had a password.");
		}
		payload.pw = pw;
	}
	else {
		payload["pw"] = '';
	}
	//add svg to payload
	payload["svg"] = svgMinPrepend + artToString() + platformToString() + svgAppend;
	if (verboseDebugging){
		console.log("Paylaod to server");
		console.log(payload);
	}
	if (verboseDebugging){
		console.log("pw in the payload is:");
		console.log(payload.pw);
	}
	//send various payloads. In further functions, the second request call will be
	//adjusted to check for the default (public) password.
	if (pw){
		postRequest("/edit",payload,editSubmitCallback,postOnError,pw);
	}
	else {
		postRequest("/edit",payload,editSubmitCallback,postOnError);
	}
}
// end Mark's code


// submit drawing and platform data to server
function svgSubmitToServer(imgCanvas) {
	handleShapeInProgress();
	
	// BELOW CODE MOVED TO HELPER FUNCTION ABOVE start Mark's code
	//form payload request
	//var payload = {};
	//fill out coordinate fields
	//payload["xcoord"] = xTile;
	//payload["ycoord"] = yTile;
	// ### TO CHANGE: EVERYTHING CURRENTLY HAS NO PASSWORD
	//if reprompt password flag is set, ask user to re-enter password
	console.log("reprompt at submission:");
	console.log(passwordReprompt);
	if (passwordReprompt){
		//takes care of refreshing the prompt, etc. If fail once, add to message.
		var initCoords = {};
		initCoords.xcoord  = xTile;
		initCoords.ycoord = yTile;
		promptPWOnEdit(passwordReenterPrompt,initCoords);
	}
	else {
		editPasswordApproved(xTile,yTile);
	}
	//below commented code is moved to helper function directly above
	/*payload["pw"] = '';
	//add svg to payload
	payload["svg"] = svgMinPrepend + artToString() + platformToString() + svgAppend;
	if (verboseDebugging){
		console.log("Paylaod to server");
		console.log(payload);
	}
	postRequest("/edit",payload,editSubmitCallback,postOnError);
	// end Mark's code
	
	// debug message
	if (debugging) {
		console.log("Submitted drawing and platform data to the server.");
	}
	
	// use message box to put up confirmation message
	displayMessage("Your art has been added to the world.", doTileExit, doTileExit, false, true)*/
}

// start Mark's code
//HELPER FUNCTION TO HANDLE CALLBACK FROM SERVER LOAD
function svgPullCallback(request){
	//TONI'S BLOCK: MOVED DUE TO ASYNCH CALLBACK
	
	// debug message
	if (debugging) {
		console.log("Loaded drawing and platform data for tile (" + xTile + ", " + yTile + ") from the server.");
	}
	
	// hide message box if not in the process of loading the page the first time
	if (!loadingPage) {
		messageDiv.style.display = "none";
	}
	//if response is received and in good order
	if (request.readyState === 4){
		if (request.status === 200){
			//trim the array brackets off of the response body here:
			//trim open square bracket
			var properParseText = request.responseText.substring(1);
			//trim close square bracket
			properParseText = properParseText.substring(0,properParseText.length-1);
			console.log("this being parsed:");
			console.log(properParseText);
			body = JSON.parse(properParseText);
			if (verboseDebugging){
				console.log("raw request in pull callback:");
				console.log(request);
				console.log("Edit tile response body.");
				console.log(body);
			}
			//load SVG into editable SVG region
			//must do away with any drawingGroup and platformsGroup higher in DOM
			/*var groups = canvas.childNodes;
			console.log(groups);
			var groupArray = Array.prototype.slice.call(groups);
			console.log(groupArray);
			for (var i = 0 ; i < groupArray.length ; i += 1){
			console.log(groupArray[i].nodeName);
				if (groupArray[i].nodeName === "g"){
					//find drawingGroup and platformGroup and remove them
					if (groupArray[i].getAttribute("id") === "drawingGroup" ||
						groupArray[i].getAttribute("id") === "platformsGroup" ){
						console.log()
						console.log(groupArray[i].getAttribute("id"));
						groupArray[i].remove();
					}
				}
			}*/
			//use svg.js load to load into main svg
			//var draw = SVG('svgCanvas');
			//load the svg xml as stirng
			//draw.svg(body.svg);
			if (verboseDebugging) {
				console.log("Working String:");
				console.log(body.svg);
			}

			if (body.svg){
				var parseString = svgMinPrepend + body.svg + svgAppend;
				/*var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(parseString,"text/xml");
				var dg = xmlDoc.getElementById("drawingGroup");
				var pg = xmlDoc.getElementById("platformsGroup");
				console.log(dg);
				console.log(pg);*/
				svgLoadFromString(parseString);
			}
		} else if (request.status === 242){
			if (verboseDebugging) {
				console.log("fresh tile.");
			}
		} else {
			if (verboseDebugging) {
				console.error(request.statusText);
			}
		}
	}
}
// end Mark's code

// load drawing and platform data from the server
// call this from the svg init function
// and from doTileEdit
function svgLoadFromServer(xTile, yTile, password, callback) {
	if (verboseDebugging)
	{
		console.log("password pre retrieve");
		console.log(password);
	}
	handleShapeInProgress();
	svgClearAll();

	// start Mark's code
	var payload = {};
	//fill out coordinate fields
	payload["xcoord"] = xTile;
	payload["ycoord"] = yTile;
	// ### TO CHANGE: EVERYTHING CURRENTLY HAS NO PASSWORD
	if (password){
		payload["pw"] = password;
	}
	else {
		payload["pw"] = '';
	}
	if (verboseDebugging){
		console.log("payload for retrieve:");
		console.log(payload);
	}
	if (callback)
	{
		postRequest("/retrieve",payload,callback,postOnError);

	} else {

		postRequest("/retrieve",payload,svgPullCallback,postOnError);

	}
}

// close out an in-progress shape first if an option selection changes
// ??? much of this is copy-pasted and really should be refactored
function handleShapeInProgress() {
	// only need to do something if there is a shape in progress
	if (inProgress) {
		var shapeInProgress;
		// determine what tool is active / what type of shape
		switch (toolChoice) {
			case 0: // rectangle
				// clean up an in-progress rectangle by finishing it at the current coordinates
				
				// get the new rectangle and its info
				shapeInProgress = document.getElementById(objectStr + currentObject.toString());
				
				// check for width or height equal to 0
				if (shapeInProgress.getAttribute("width") == 0) {
					shapeInProgress.setAttribute("width", "1");
				}
				if (shapeInProgress.getAttribute("height") == 0) {
					shapeInProgress.setAttribute("height", "1");
				}
				
				// debug output for completed rectangle
				if (debugging) {
					console.log(objectStr + currentObject.toString() + ": Made a rectangle at (" +
							shapeInProgress.getAttribute("x") +	", " +
							shapeInProgress.getAttribute("y") + ") with width: " +
							shapeInProgress.getAttribute("width") + " and height: " +
							shapeInProgress.getAttribute("height") + ".");
				}

				// increment counter and set flag to false
				currentObject += 1;
				inProgress = false;
				break;

			case 1: // ellipse

				// get the new ellipse and its info
				shapeInProgress = document.getElementById(objectStr + currentObject.toString());
				
				// check for either radius equal to 0
				if (shapeInProgress.getAttribute("rx") == 0) {
					shapeInProgress.setAttribute("rx", "1");
				}
				if (shapeInProgress.getAttribute("ry") == 0) {
					shapeInProgress.setAttribute("ry", "1");
				} 
			
				// debug output for completed ellipse
				if (debugging) {
					console.log(objectStr + currentObject.toString() + ": Made an ellipse at (" +
							shapeInProgress.getAttribute("cx") +	", " +
							shapeInProgress.getAttribute("cy") + ") with x-radius: " +
							shapeInProgress.getAttribute("rx") + " and y-radius: " +
							shapeInProgress.getAttribute("ry") + ".");
				}
				
				// increment shape counter and turn off inProgress flag
				currentObject += 1;
				inProgress = false;
				break;

			case 2: // polygon
				// clean up a partly-completed polygon by leaving it a polyline

				// get the current shape and its info, including the markers
				var newPolyline = document.getElementById(objectStr + currentObject.toString());
				var pointString = newPolyline.getAttribute("points");
				var numPoints = pointString.split(" ").length-1;
				var startMarker = document.getElementById(polygonStartMarker);
				var pointMarker = document.getElementById(polygonPointMarker);
		
				// remove the polygon point markers from the DOM
				drawingGroup.removeChild(startMarker);
				drawingGroup.removeChild(pointMarker);
		
				// handle the case where there is only one point
				if (numPoints == 1) {
					// delete the polyline
					drawingGroup.removeChild(newPolyline);
			
					// create a dot/ellipse and set its attributes
					// use the original xStart and yStart for this click
					var newDot;
					newDot = document.createElementNS(svgns, "ellipse");
					newDot.setAttribute("id", objectStr + currentObject.toString());
					newDot.setAttribute("cx", xStart.toString());
					newDot.setAttribute("cy", yStart.toString());
					newDot.setAttribute("rx", strokeWidthChoice.toString()/2);
					newDot.setAttribute("ry", strokeWidthChoice.toString()/2);
					newDot.setAttribute("style", "fill: " +
						colorChoice + "; stroke: " + colorChoice);
			
					// append dot to canvas
					drawingGroup.appendChild(newDot);
			
					// debug message for the dot
					if (debugging) {
						console.log(objectStr + currentObject.toString() +
						": Made a polyline at point: " + pointString + ".");
					}
				} else {
					// debug message for the polyline
					if (debugging) {
						console.log(objectStr + currentObject.toString() +
						": Made a polyline at points: " + pointString + ".");
					}
				}
		
				// increment counter and set flag to false
				currentObject += 1;
				inProgress = false;
				break;

			case 3: // brush

				// get the current brush stroke and its info
				var brushObj = document.getElementById(objectStr + currentObject.toString());
				var pointString = brushObj.getAttribute("points");
				var numPoints = pointString.split(" ").length-1;
				
				// if there's only one point, handle as a single click
				if (numPoints == 1) {
					// delete the polyline
					drawingGroup.removeChild(brushObj);
					
					// create a dot/ellipse and set its attributes
					// use the original xStart and yStart for this click
					var newDot;
					newDot = document.createElementNS(svgns, "ellipse");
					newDot.setAttribute("id", objectStr + currentObject.toString());
					newDot.setAttribute("cx", xStart.toString());
					newDot.setAttribute("cy", yStart.toString());
					newDot.setAttribute("rx", strokeWidthChoice.toString()/2);
					newDot.setAttribute("ry", strokeWidthChoice.toString()/2);
					newDot.setAttribute("style", "fill: " +
						colorChoice + "; stroke: " + colorChoice);
					
					// append dot to canvas
					drawingGroup.appendChild(newDot);
				} else { // if fill is on, add the fill
					if (shapeFillChoice) {
						brushObj.style.fill = colorChoice;
					}
				}
			
				// debug output for completed brush stroke
				if (debugging) {
					console.log(objectStr + currentObject.toString() + ": Made a brush stroke.");
				}
				
				// increment shape counter and turn off inProgress flag
				currentObject += 1;
				inProgress = false;
				break;

			case 4: // eraser

				/*// get the current eraser stroke and its info
				var eraserObj = document.getElementById(objectStr + currentObject.toString());
				var pointString = eraserObj.getAttribute("points");
				var numPoints = pointString.split(" ").length-1;
				
				// if there's only one point, handle as a single click
				if (numPoints == 1) {
					// delete the polyline
					drawingGroup.removeChild(eraserObj);
					
					// create a dot/ellipse and set its attributes
					// use the original xStart and yStart for this click
					var newDot;
					newDot = document.createElementNS(svgns, "ellipse");
					newDot.setAttribute("id", objectStr + currentObject.toString());
					newDot.setAttribute("cx", xStart.toString());
					newDot.setAttribute("cy", yStart.toString());
					newDot.setAttribute("rx", strokeWidthChoice.toString()/2);
					newDot.setAttribute("ry", strokeWidthChoice.toString()/2);
					newDot.setAttribute("style", "fill: " +
						eraserColor + "; stroke: " + eraserColor);
					
					// append dot to canvas
					drawingGroup.appendChild(newDot);
				} else { // if fill is on, add the fill
					if (shapeFillChoice) {
						eraserObj.style.fill = eraserColor;
					}
				}
				
				// debug output for completed eraser stroke
				if (debugging) {
					console.log(objectStr + currentObject.toString() + ": Made an eraser stroke.");
				}
				
				// increment shape counter and turn off inProgress flag
				currentObject += 1;
				inProgress = false;*/
				break;

			case 5: // eye dropper
				break;

			case 6: // paint can
				break;

			case 7: // wall

				/*// get the current wall stroke and its info
				var wallObj = document.getElementById(platformStr + currentPlatform.toString());
				var pointString = wallObj.getAttribute("points");
				var numPoints = pointString.split(" ").length-1;
				
				// if there's only one point, handle as a single click
				if (numPoints == 1) {
					// delete the polyline
					platformsGroup.removeChild(wallObj);
					
					// create a dot/ellipse and set its attributes
					// use the original xStart and yStart for this click
					var newDot;
					newDot = document.createElementNS(svgns, "ellipse");
					newDot.setAttribute("id", platformStr + currentPlatform.toString());
					newDot.setAttribute("cx", xStart.toString());
					newDot.setAttribute("cy", yStart.toString());
					newDot.setAttribute("rx", strokeWidthChoice.toString()/2);
					newDot.setAttribute("ry", strokeWidthChoice.toString()/2);
					newDot.setAttribute("style", "fill: " +
						wallColor + "; stroke: " + wallColor);
					newDot.setAttribute("class", "platformDot");
					
					// append dot to canvas
					platformsGroup.appendChild(newDot);
				}
			
				// debug output for completed wall
				if (debugging) {
					console.log(platformStr + currentPlatform.toString() + ": Made a wall.");
				}

				// add the index of the new wall to the platform actions list
				platformActionsList.push(currentPlatform);
				
				// increment shape counter and turn off inProgress flag
				currentPlatform += 1;
				inProgress = false;
				break;*/ // previous code commented out from when wall was a brush tool

				// wall is now a polygon tool, so...
				// clean up a partly-completed wall polygon by closing it, or deleting it if invalid

				// get the current shape and its info, including the markers
				var newPolyline = document.getElementById(platformStr + currentPlatform.toString());
				var pointString = newPolyline.getAttribute("points");
				var numPoints = pointString.split(" ").length / 2;
				var startMarker = document.getElementById(polygonStartMarker);
				var pointMarker = document.getElementById(polygonPointMarker);
		
				// remove the polygon point markers from the DOM
				platformsGroup.removeChild(startMarker);
				platformsGroup.removeChild(pointMarker);

				// delete the polyline
				platformsGroup.removeChild(newPolyline);
		
				// handle the case where there are less than three points
				if (numPoints < 3) {
					// do nothing to replace the polyline because this was not a valid shape
			
					// debug message
					if (debugging) {
						console.log("Deleted incomplete wall polygon.");
					}
					
					// set flag to false, but do not increment counter
					inProgress = false;
				} else { // replace the polyline with a closed polygon
					
					// create a closed polygon to replace the polyline
					var newPolygon = document.createElementNS(svgns, "polygon");
					newPolygon.setAttribute("id", platformStr + currentPlatform.toString());
					newPolygon.setAttribute("points", pointString);
					newPolygon.setAttribute("style", "fill: " + wallColor + 
						"; fill-rule: evenodd; stroke: " + wallColor + 
						"; stroke-width: 1");
					platformsGroup.appendChild(newPolygon);

					// debug message
					if (debugging) {
						console.log(platformStr + currentPlatform.toString() +
						": Made a wall at points: " + pointString + ".");
					}
					
					// add the index of the new wall to the platform actions list
					platformActionsList.push(currentPlatform);

					// increment counter and set flag to false
					currentPlatform += 1;
					inProgress = false;
				}
				break;

			case 8: // ladder

				/*// get the current ladder stroke and its info
				var ladderObj = document.getElementById(platformStr + currentPlatform.toString());
				var pointString = ladderObj.getAttribute("points");
				var numPoints = pointString.split(" ").length-1;
				
				// if there's only one point, handle as a single click
				if (numPoints == 1) {
					// delete the polyline
					platformsGroup.removeChild(ladderObj);
					
					// create a dot/ellipse and set its attributes
					// use the original xStart and yStart for this click
					var newDot;
					newDot = document.createElementNS(svgns, "ellipse");
					newDot.setAttribute("id", platformStr + currentPlatform.toString());
					newDot.setAttribute("cx", xStart.toString());
					newDot.setAttribute("cy", yStart.toString());
					newDot.setAttribute("rx", strokeWidthChoice.toString()/2);
					newDot.setAttribute("ry", strokeWidthChoice.toString()/2);
					newDot.setAttribute("style", "fill: " +
						ladderColor + "; stroke: " + ladderColor);
					newDot.setAttribute("class", "platformDot");
					
					// append dot to canvas
					platformsGroup.appendChild(newDot);
				}
			
				// debug output for completed ladder
				if (debugging) {
					console.log(platformStr + currentPlatform.toString() + ": Made a ladder.");
				}

				// add the index of the new ladder to the platform actions list
				platformActionsList.push(currentPlatform);
				
				// increment shape counter and turn off inProgress flag
				currentPlatform += 1;
				inProgress = false;
				break;*/ // previous code commented out from when wall was a brush tool

				// ladder is now a polygon tool, so...
				// clean up a partly-completed ladder polygon by closing it, or deleting it if invalid

				// get the current shape and its info, including the markers
				var newPolyline = document.getElementById(platformStr + currentPlatform.toString());
				var pointString = newPolyline.getAttribute("points");
				var numPoints = pointString.split(" ").length / 2;
				var startMarker = document.getElementById(polygonStartMarker);
				var pointMarker = document.getElementById(polygonPointMarker);
		
				// remove the polygon point markers from the DOM
				platformsGroup.removeChild(startMarker);
				platformsGroup.removeChild(pointMarker);

				// delete the polyline
				platformsGroup.removeChild(newPolyline);
		
				// handle the case where there are less than three points
				if (numPoints < 3) {
					// do nothing to replace the polyline because this was not a valid shape
			
					// debug message
					if (debugging) {
						console.log("Deleted incomplete ladder polygon.");
					}
					
					// set flag to false, but do not increment counter
					inProgress = false;
				} else { // replace the polyline with a closed polygon
					
					// create a closed polygon to replace the polyline
					var newPolygon = document.createElementNS(svgns, "polygon");
					newPolygon.setAttribute("id", platformStr + currentPlatform.toString());
					newPolygon.setAttribute("points", pointString);
					newPolygon.setAttribute("style", "fill: " + ladderColor + 
						"; fill-rule: evenodd; stroke: " + ladderColor + 
						"; stroke-width: 1");
					platformsGroup.appendChild(newPolygon);

					// debug message
					if (debugging) {
						console.log(platformStr + currentPlatform.toString() +
						": Made a ladder at points: " + pointString + ".");
					}

					// add the index of the new ladder to the platform actions list
					platformActionsList.push(currentPlatform);

					// increment counter and set flag to false
					currentPlatform += 1;
					inProgress = false;
				}
				break;

			case 9: // platform select
				break;
				
			default: // should never get here
				console.log("Something went horribly awry with handling a shape in progress.");

		}
	}
}

// get updated option selections from the HTML form
function svgSetMasking(newState) {
	handleShapeInProgress();
	masking = newState;
	if (masking) { // turn on platforms
		// debug message
		if (debugging) {
			console.log("Switched to platform tools.");
		}
		// turn the art opacity down
		drawingGroup.setAttribute("style", "opacity: 0.33");
		// make the platforms visible
		platformsGroup.setAttribute("style", "visibility: visible");
		// save current tool choice and set platform tool
		previousDrawTool = toolChoice;
		svgSetTool(previousPlatformTool);
	} else { // turn off platforms
		// debug message
		if (debugging) {
			console.log("Switched to drawing tools.");
		}
		// turn the art opacity up
		 drawingGroup.setAttribute("style", "opacity: 1");
		// make the platforms invisible
		platformsGroup.setAttribute("style", "visibility: hidden");
		// save current tool choice and set draw tool
		previousPlatformTool = toolChoice;
		svgSetTool(previousDrawTool);
	}
}
function svgSetColor(newColor) {
	handleShapeInProgress();
	colorChoice = newColor;
	if (debugging) {
		console.log("Changed color to " + colorChoice + ".");
	}
}
function svgSetShapeFill(newState) {
	handleShapeInProgress();
	shapeFillChoice = newState;
	if (debugging) {
		console.log("Set shape fill to " + shapeFillChoice + ".");
	}
}
function svgSetStrokeWidth(newWidth) {
	handleShapeInProgress();
	if (newWidth < 1) {
		newWidth = 1;
	}
	else if (newWidth > 50) {
		newWidth = 50;
	}
	strokeWidthChoice = newWidth;
	if (debugging) {
		console.log("Set stroke width to " + strokeWidthChoice.toString() + ".");
	}
}
function svgSetTool(newTool) {
	handleShapeInProgress();
	toolChoice = newTool;
	togglePlatformSelection(selectedPlatform);
	// update the canvas so that the next click will work
	// start Mark's code
	if (newTool == 5 || newTool==6){
		updateCanvas();
	}
	// end Mark's code
	if (debugging) {
		console.log("Changed tool to " + toolList[toolChoice] + ".");
	}
}

// helper function to toggle selection state of a platform
function togglePlatformSelection(idnum) {
	// only do something if id is not -1 / no platform
	if (idnum != -1) {
		var myPlatform = document.getElementById(platformStr + idnum);
		if (selectedPlatform == idnum) { // unselect it
			// unmark platform idnum
			myPlatform.style.setProperty("stroke", selectedPlatformOldColor);
			if (myPlatform.getAttribute("class") == "platformDot") {
				myPlatform.style.setProperty("fill", selectedPlatformOldColor);
			}
			// set that no platform is selected
			selectedPlatform = -1;
			// debug printout
			if (debugging) {
				console.log("Deselected platform with ID#: " + idnum.toString());
			}
		} else { // select it
			// mark platform idnum as selected
			selectedPlatformOldColor = myPlatform.style.getPropertyValue("stroke");
			myPlatform.style.setProperty("stroke", selectedPlatformColor);
			if (myPlatform.getAttribute("class") == "platformDot") {
				myPlatform.style.setProperty("fill", selectedPlatformColor);
			}
			// set that platform idnum is selected
			selectedPlatform = idnum;
			// debug printout
			if (debugging) {
				console.log("Selected platform with ID#: " + idnum.toString());
			}
		}
	} // else do nothing
}

// remove the currently selected platform
function svgRemoveSelectedPlatform(force) {
	// only do something if the force flag is set to true
	// OR if both platform selection tool is active and a platform is currently selected
	if (force || (toolChoice == 9 && selectedPlatform != -1)) {
		// get selected platform object
		var myPlatform = document.getElementById(platformStr + selectedPlatform.toString());
		var myIDNum = selectedPlatform;
		// unselect it
		togglePlatformSelection(myIDNum);
		// remove it from the regular group
		platformsGroup.removeChild(myPlatform);
		// add it to the deleted group
		deadPlatformsGroup.appendChild(myPlatform);
		// add the idnum of this platform to the list of dead platforms
		deadPlatformsList.push(myIDNum);
		// push a negative flag to the platform actions list
		platformActionsList.push(-1 * myIDNum);
		// debug message
		if (debugging && !force) {
			console.log("Removed platform with ID#: " + myIDNum.toString());
		}
	} // else do nothing
}

// undo the previously done action in the current mode, if any
function svgUndoAction() {
	handleShapeInProgress();
	// how this operates depends on if you are in draw or platform mode
	if (toolChoice <= 6) { // draw mode
		// only do anything if any objects currently exist to be undone
		if (currentObject > 1) {
			// get the most recently drawn object and its id#
			var myIDNum = currentObject - 1;
			var myObject = document.getElementById(objectStr + myIDNum.toString());
			// remove it from the regular group
			drawingGroup.removeChild(myObject);
			// add it to the undone draw objects group
			undoneDrawingGroup.appendChild(myObject);
			// add its index to the undone draw objects list
			undoneDrawingList.push(myIDNum);
			// debug message
			if (debugging) {
				console.log("Undid draw action with ID#: " + myIDNum.toString() + ".");
			}
			// decrement currentObject counter
			currentObject -= 1;
		}
	} else { // platform mode
		// only do anything if any actions currently exist to be undone
		if (platformActionsList.length > 0) {
			// get the most recently done action
			var myObject;
			var myIDNum = platformActionsList.pop();
			// decide what to do based on that result
			if (myIDNum > 0) { // then a platform object was drawn
				// get the most recently drawn object
				myObject = document.getElementById(platformStr + myIDNum.toString());
				// remove it from the regular group
				platformsGroup.removeChild(myObject);
				// add it to the undone platforms group
				undonePlatformsGroup.appendChild(myObject);
				// add its index to the undone platforms list
				undonePlatformsList.push(myIDNum);
				// debug message
				if (debugging) {
					console.log("Undid drawing of platform with ID#: " + myIDNum.toString() + ".");
				}
				// decrement currentPlatform counter
				currentPlatform -= 1;
			} else { // negative id# indicates a deletion event
				// get the most recently deleted object and its id#
				myIDNum = deadPlatformsList.pop(); // should be equivalent to myIDNum *= -1
				myObject = document.getElementById(platformStr + myIDNum.toString());
				// remove it from the dead platforms group
				deadPlatformsGroup.removeChild(myObject);
				// add it back to the regular group
				platformsGroup.appendChild(myObject);
				// push a negative flag to the undone platforms list
				undonePlatformsList.push(-1 * myIDNum);
				// debug message
				if (debugging) {
					console.log("Undid deletion of platform with ID#: " + myIDNum.toString() + ".");
				}
			}
		}
	}
}

// redo the previously undone action in the current mode, if any
function svgRedoAction() {
	// how this operates depends on if you are in draw or platform mode
	if (toolChoice <= 6) { // draw mode
		// only do anything if any objects currently exist to be redone
		if (undoneDrawingList.length > 0) {
			// remove the index of the most recently undone draw object
			// from the undone draw objects list (this should be currentObject!)
			var myIDNum = undoneDrawingList.pop();
			// get most recently undone draw object
			var myObject = document.getElementById(objectStr + myIDNum.toString());
			// remove it from the undone draw objects group
			undoneDrawingGroup.removeChild(myObject);							
			// add it to the regular group
			drawingGroup.appendChild(myObject)
			// debug message
			if (debugging) {
				console.log("Redid draw action with ID#: " + myIDNum.toString() + ".");
			}
			// increment currentObject counter
			currentObject += 1;
		}
	} else { // platform mode
		// only do anything if any actions currently exist to be redone
		if (undonePlatformsList.length > 0) {
			// get the most recently undone action
			var myObject;
			var myIDNum = undonePlatformsList.pop();
			// decide what to do based on that result
			if (myIDNum > 0) { // then a platform object was undone
				// get most recently undone platform object
				myObject = document.getElementById(platformStr + myIDNum.toString());
				// remove it from the undone platform objects group
				undonePlatformsGroup.removeChild(myObject);
				// add it to the regular group
				platformsGroup.appendChild(myObject);
				// add its index to the platform actions list
				platformActionsList.push(myIDNum);
				// debug message
				if (debugging) {
					console.log("Redid drawing of platform with ID#: " + myIDNum.toString() + ".");
				}
				// increment currentPlatform counter
				currentPlatform += 1;
			} else { // negative id# indicates a deletion was undone
				// get the most recently undone deletion and its id#
				myIDNum *= -1;
				myObject = document.getElementById(platformStr + myIDNum.toString());
				// do a deletion on this object
				// start by making it the selected platform
				togglePlatformSelection(selectedPlatform);
				selectedPlatform = myIDNum;
				svgRemoveSelectedPlatform(true); // use force flag b/c not done via user tools
				// calling the remove function handles updating the actions list
				// debug message
				if (debugging) {
					console.log("Redid deletion of platform with ID#: " + myIDNum.toString() + ".");
				}
			}
		}
	}
}

// clear out undo/redo lists when user does a draw/platform action
// (no undo/redo branching allowed)
function clearUndoRedoLists() {
	var myElement;
	var myID;
	// clear undone draw objects info
	for (var i = undoneDrawingList.length - 1; i >= 0; i -= 1) {
		// get the next element to clear out
		myElement = document.getElementById(objectStr + undoneDrawingList[i].toString());
		// remove it from the undone draw objects group
		undoneDrawingGroup.removeChild(myElement);
		// remove its index from the undone draw objects array
		myID = undoneDrawingList.pop();
	}
	// clear undone platforms info
	for (var i = undonePlatformsList.length - 1; i >= 0; i -= 1) {
		// only look for the element if the entry found is positive
		if (undonePlatformsList[i] > 0) {
			// get the next element to clear out
			myElement = document.getElementById(platformStr + undonePlatformsList[i].toString());
			// remove it from the undone platforms group
			undonePlatformsGroup.removeChild(myElement);
		} // but even if it's negative, pop the entry out of the array
		// remove its index from the undone platforms array
		myID = undonePlatformsList.pop();
	}
}

// adjust xMouse and yMouse for the current zoom and pan
function adjustMouseCoords() {
	// adjust for zoom
	xMouse /= zoomFactor;
	yMouse /= zoomFactor;
	// adjust for pan
	// first get viewBox info
	var vBox = canvas.getAttribute("viewBox").split(" ");
	var vBoxX = parseFloat(vBox[0]);
	var vBoxY = parseFloat(vBox[1]);
	var vBoxW = parseFloat(vBox[2]);
	var vBoxH = parseFloat(vBox[3]);
	// then add the resulting offset
	xMouse += vBoxX;
	yMouse += vBoxY;
}

// update xMouse and yMouse with the current click info
// turns a drawing area coords into canvas coords regardless of zoom/pan
function updateMouseCoords(evt) {
	// adjust for screen offset
	xMouse = evt.clientX - xOffset;
	yMouse = evt.clientY - yOffset;
	// adjust for zoom and pan
	adjustMouseCoords();
	// debug message
	if (verboseDebugging) {
		console.log("Mouse coordinates: (" + xMouse.toString() + ", " +
											yMouse.toString() + ")");
	}
}

// ??? refactor the following event handlers to reduce copy-pasta code?

// mouse down event handler
function mouseDown(evt) {
	// only do anything if in art or avatar mode
	if (mode == artMode) {
		// prevent default behavior to stop weird selecting and dragging
		// this was only necessary after refactoring the SVG to be inline
		evt.preventDefault();
		// only do anything if the left mouse button was the click
		if (evt.which == 1) {
			// make the new shape based on tool choice
			var newShape;
			switch(toolChoice) {
				case 0: // rectangle
				
					// clear out current undo/redo lists to avoid branching
					clearUndoRedoLists();

					// get the mouse coordinates in the canvas
					updateMouseCoords(evt);

					// get the start coordinates for the new shape
					xStart = xMouse;
					yStart = yMouse;
					
					// create the new rectangle shape and set its attributes
					newShape = document.createElementNS(svgns, "rect");
					newShape.setAttribute("id", objectStr + currentObject.toString());
					newShape.setAttribute("x", xStart.toString());
					newShape.setAttribute("y", yStart.toString());
					newShape.setAttribute("width", "0");
					newShape.setAttribute("height", "0");
					if (shapeFillChoice) {
						shapeFillChoiceString = colorChoice;
					} else {
						shapeFillChoiceString = shapeFillNone;
					}
					newShape.setAttribute("style", "fill: " +
						shapeFillChoiceString + "; stroke: " + 
						colorChoice + "; stroke-width: " +
						strokeWidthChoice.toString());
					
					// append rectangle to canvas and turn on inProgress flag
					drawingGroup.appendChild(newShape);
					inProgress = true;
					break;
					
				case 1: // ellipse
				
					// clear out current undo/redo lists to avoid branching
					clearUndoRedoLists();
				
					// get the mouse coordinates in the canvas
					updateMouseCoords(evt);

					// get the start coordinates for the new shape
					xStart = xMouse;
					yStart = yMouse;
				
					// create the new ellipse shape and set its attributes
					newShape = document.createElementNS(svgns, "ellipse");
					newShape.setAttribute("id", objectStr + currentObject.toString());
					newShape.setAttribute("cx", xStart.toString());
					newShape.setAttribute("cy", yStart.toString());
					newShape.setAttribute("rx", "0");
					newShape.setAttribute("ry", "0");
					if (shapeFillChoice) {
						shapeFillChoiceString = colorChoice;
					} else {
						shapeFillChoiceString = shapeFillNone;
					}
					newShape.setAttribute("style", "fill: " +
						shapeFillChoiceString + "; stroke: " + 
						colorChoice + "; stroke-width: " +
						strokeWidthChoice.toString());
					
					// append ellipse to canvas and turn on inProgress flag
					drawingGroup.appendChild(newShape);
					inProgress = true;
					break;

				case 2: // polygon
					break;

				case 3: // brush
			
					// clear out current undo/redo lists to avoid branching
					clearUndoRedoLists();
					
					// get mouse coordinates in the canvas
					updateMouseCoords(evt);

					// get the start coordinates for the new shape
					xStart = xMouse;
					yStart = yMouse;

					// create the new polyline shape and set its attributes
					newShape = document.createElementNS(svgns, "polyline");
					newShape.setAttribute("id", objectStr + currentObject.toString());
					newShape.setAttribute("points", xStart.toString() + " " +
								yStart.toString());
					newShape.setAttribute("style", "fill: " +
						shapeFillNone + "; stroke: " + 
						colorChoice + "; stroke-width: " +
						strokeWidthChoice.toString() + 
						"; stroke-linecap: round; stroke-linejoin: round");
						
					// append polyline to canvas and turn on inProgress flag
					drawingGroup.appendChild(newShape);
					inProgress = true;
					break;

				case 4: // eraser
				
					/*// clear out current undo/redo lists to avoid branching
					clearUndoRedoLists();
				
					// get mouse coordinates in the canvas
					updateMouseCoords(evt);

					// get the start coordinates for the new shape
					xStart = xMouse;
					yStart = yMouse;

					// create the new polyline shape and set its attributes
					newShape = document.createElementNS(svgns, "polyline");
					newShape.setAttribute("id", objectStr + currentObject.toString());
					newShape.setAttribute("points", xStart.toString() + " " +
								yStart.toString());
					newShape.setAttribute("style", "fill: " +
						shapeFillNone + "; stroke: " +
						eraserColor + "; stroke-width: " +
						strokeWidthChoice.toString() +
						"; stroke-linecap: round; stroke-linejoin: round");
						
					// append polyline to canvas and turn on inProgress flag
					drawingGroup.appendChild(newShape);
					inProgress = true;*/
					break;

				case 5: // eye dropper
					break;

				case 6: // paint can
					break;

				case 7: // wall
				
					/*// clear out current undo/redo lists to avoid branching
					clearUndoRedoLists();
					
					// get mouse coordinates in the canvas
					updateMouseCoords(evt);

					// get the start coordinates for the new shape
					xStart = xMouse;
					yStart = yMouse;

					// create the new polyline shape and set its attributes
					newShape = document.createElementNS(svgns, "polyline");
					newShape.setAttribute("id", platformStr + currentPlatform.toString());
					newShape.setAttribute("points", xStart.toString() + " " +
								yStart.toString());
					newShape.setAttribute("style", "fill: " +
						shapeFillNone + "; stroke: " + 
						wallColor + "; stroke-width: " +
						strokeWidthChoice.toString() + 
						"; stroke-linecap: round; stroke-linejoin: round");
					
					// append polyline to platforms and turn on inProgress flag
					platformsGroup.appendChild(newShape);
					inProgress = true;*/

					// do nothing, switched this tool to be a polygon tool instead of a brush
					break;
				
				case 8: // ladder
				
					/*// clear out current undo/redo lists to avoid branching
					clearUndoRedoLists();
					
					// get mouse coordinates in the canvas
					updateMouseCoords(evt);

					// get the start coordinates for the new shape
					xStart = xMouse;
					yStart = yMouse;

					// create the new polyline shape and set its attributes
					newShape = document.createElementNS(svgns, "polyline");
					newShape.setAttribute("id", platformStr + currentPlatform.toString());
					newShape.setAttribute("points", xStart.toString() + " " +
								yStart.toString());
					newShape.setAttribute("style", "fill: " +
						shapeFillNone + "; stroke: " + 
						ladderColor + "; stroke-width: " +
						strokeWidthChoice.toString() + 
						"; stroke-linecap: round; stroke-linejoin: round");
					
					// append polyline to platforms and turn on inProgress flag
					platformsGroup.appendChild(newShape);
					inProgress = true;*/

					// do nothing, switched this tool to be a polygon tool instead of a brush
					break;
					
				case 9: // platform select
					break;
					
				default: // should never get here
					console.log("Something went horribly awry with the tool picker.");
			} // else do nothing
		}
	} // else do nothing
}

// mouse move event handler
function mouseMove(evt) {
	// only do anything if in art or avatar mode
	if (mode == artMode) {
		var shapeInProgress;
		switch(toolChoice) {
			case 0: // rectangle
				
				// only do this if a shape is currently in progress
				if(inProgress) {
					// get the mouse coordinates in the canvas
					updateMouseCoords(evt);
					
					// get the current rectangle
					shapeInProgress = document.getElementById(objectStr + currentObject.toString());
					
					// calculate new rectangle info
					var xNew = Math.min(xMouse, xStart);
					var yNew = Math.min(yMouse, yStart);
					var wNew =  Math.max(1, Math.abs(xMouse - xStart));
					var hNew =  Math.max(1, Math.abs(yMouse - yStart));
					
					// set new rectangle info
					shapeInProgress.setAttribute("x", xNew.toString());
					shapeInProgress.setAttribute("y", yNew.toString());
					shapeInProgress.setAttribute("width", wNew.toString());
					shapeInProgress.setAttribute("height", hNew.toString());
				}
				break;
				
			case 1: // ellipse
				
				// only do this if a shape is currently in progress
				if(inProgress) {
					// get the mouse coordinates in the canvas
					updateMouseCoords(evt);
					
					// get the current ellipse
					shapeInProgress = document.getElementById(objectStr + currentObject.toString());
					
					// calculate new rectangle info
					var xNew = Math.min(xMouse, xStart);
					var yNew = Math.min(yMouse, yStart);
					var wNew =  Math.max(1, Math.abs(xMouse - xStart));
					var hNew =  Math.max(1, Math.abs(yMouse - yStart));
					
					// calculate new ellipse info
					var rxNew = wNew/2;
					var ryNew = hNew/2;
					var cxNew = xNew + rxNew;
					var cyNew = yNew + ryNew;
					
					// set new ellipse info
					shapeInProgress.setAttribute("cx", cxNew.toString());
					shapeInProgress.setAttribute("cy", cyNew.toString());
					shapeInProgress.setAttribute("rx", rxNew.toString());
					shapeInProgress.setAttribute("ry", ryNew.toString());
				}
				break;

			case 2: // polygon
				break;

			case 3: // brush
			
				// only do this if a shape is currently in progress
				if(inProgress) {
					// get the mouse coordinates in the canvas
					updateMouseCoords(evt);
					
					// get the current polyline and its info
					shapeInProgress = document.getElementById(objectStr + currentObject.toString());
					var pointString = shapeInProgress.getAttribute("points");
					
					// add current point to the polyline
					pointString += " " + xMouse.toString() + " " + yMouse.toString();
					shapeInProgress.setAttribute("points", pointString);
				}
				break;

			case 4: // eraser
				
				/*// only do this if a shape is currently in progress
				if(inProgress) {
					// get the mouse coordinates in the canvas
					updateMouseCoords(evt);
					
					// get the current polyline and its info
					shapeInProgress = document.getElementById(objectStr + currentObject.toString());
					var pointString = shapeInProgress.getAttribute("points");
					
					// add current point to the polyline
					pointString += " " + xMouse.toString() + " " + yMouse.toString();
					shapeInProgress.setAttribute("points", pointString);
				}*/
				break;

			case 5: // eye dropper
				break;

			case 6: // paint can
				break;

			case 7: // wall
			
				/*// only do this if a shape is currently in progress
				if(inProgress) {
					// get the mouse coordinates in the canvas
					updateMouseCoords(evt);
					
					// get the current polyline and its info
					shapeInProgress = document.getElementById(platformStr + currentPlatform.toString());
					var pointString = shapeInProgress.getAttribute("points");
					
					// add current point to the polyline
					pointString += " " + xMouse.toString() + " " + yMouse.toString();
					shapeInProgress.setAttribute("points", pointString);
				}*/

				// do nothing, switched this tool to be a polygon tool instead of a brush
				break;
				
			case 8: // ladder
			
				/*// only do this if a shape is currently in progress
				if(inProgress) {
					// get the mouse coordinates in the canvas
					updateMouseCoords(evt);
					
					// get the current polyline and its info
					shapeInProgress = document.getElementById(platformStr + currentPlatform.toString());
					var pointString = shapeInProgress.getAttribute("points");
					
					// add current point to the polyline
					pointString += " " + xMouse.toString() + " " + yMouse.toString();
					shapeInProgress.setAttribute("points", pointString);
				}*/

				// do nothing, switched this tool to be a polygon tool instead of a brush
				break;
				
			case 9: // platform select
				break;
				
			default: // should never get here
				console.log("Something went horribly awry with the tool picker.");
		}
	} // else do nothing
}

// mouse up event handler
function mouseUp(evt) {
	// only do anything if in art or avatar mode
	if (mode == artMode) {
		// only do something if a shape is in progress
		if (inProgress) {
			// close out the shape that was in progress
			var shapeInProgress;
			switch(toolChoice) {
				case 0: // rectangle
				
					// get the new rectangle and its info
					shapeInProgress = document.getElementById(objectStr + currentObject.toString());
					
					// check for width or height equal to 0
					if (shapeInProgress.getAttribute("width") == 0) {
						shapeInProgress.setAttribute("width", "1");
					}
					if (shapeInProgress.getAttribute("height") == 0) {
						shapeInProgress.setAttribute("height", "1");
					}
					
					// debug output for completed rectangle
					if (debugging) {
						console.log(objectStr + currentObject.toString() + ": Made a rectangle at (" +
								shapeInProgress.getAttribute("x") +	", " +
								shapeInProgress.getAttribute("y") + ") with width: " +
								shapeInProgress.getAttribute("width") + " and height: " +
								shapeInProgress.getAttribute("height") + ".");
					}
					
					// increment shape counter and turn off inProgress flag
					currentObject += 1;
					inProgress = false;
					break;
				
				case 1: // ellipse
				
					// get the new ellipse and its info
					shapeInProgress = document.getElementById(objectStr + currentObject.toString());
					
					// check for either radius equal to 0
					if (shapeInProgress.getAttribute("rx") == 0) {
						shapeInProgress.setAttribute("rx", "1");
					}
					if (shapeInProgress.getAttribute("ry") == 0) {
						shapeInProgress.setAttribute("ry", "1");
					}
				
					// debug output for completed ellipse
					if (debugging) {
						console.log(objectStr + currentObject.toString() + ": Made an ellipse at (" +
								shapeInProgress.getAttribute("cx") +	", " +
								shapeInProgress.getAttribute("cy") + ") with x-radius: " +
								shapeInProgress.getAttribute("rx") + " and y-radius: " +
								shapeInProgress.getAttribute("ry") + ".");
					}
					
					// increment shape counter and turn off inProgress flag
					currentObject += 1;
					inProgress = false;
					break;

				case 2: // polygon
					break;

				case 3: // brush
				
					// get the current brush stroke and its info
					var brushObj = document.getElementById(objectStr + currentObject.toString());
					var pointString = brushObj.getAttribute("points");
					var numPoints = pointString.split(" ").length-1;
					
					// if there's only one point, handle as a single click
					if (numPoints == 1) {
						// delete the polyline
						drawingGroup.removeChild(brushObj);
						
						// create a dot/ellipse and set its attributes
						// use the original xStart and yStart for this click
						var newDot;
						newDot = document.createElementNS(svgns, "ellipse");
						newDot.setAttribute("id", objectStr + currentObject.toString());
						newDot.setAttribute("cx", xStart.toString());
						newDot.setAttribute("cy", yStart.toString());
						newDot.setAttribute("rx", strokeWidthChoice.toString()/2);
						newDot.setAttribute("ry", strokeWidthChoice.toString()/2);
						newDot.setAttribute("style", "fill: " +
							colorChoice + "; stroke: " + colorChoice);
						
						// append dot to canvas
						drawingGroup.appendChild(newDot);
					} else { // if fill is on, add the fill
						if (shapeFillChoice) {
							brushObj.style.fill = colorChoice;
						}
					}
				
					// debug output for completed brush stroke
					if (debugging) {
						console.log(objectStr + currentObject.toString() + ": Made a brush stroke.");
					}
					
					// increment shape counter and turn off inProgress flag
					currentObject += 1;
					inProgress = false;
					break;

				case 4: // eraser
				
					/*// get the current eraser stroke and its info
					var eraserObj = document.getElementById(objectStr + currentObject.toString());
					var pointString = eraserObj.getAttribute("points");
					var numPoints = pointString.split(" ").length-1;
					
					// if there's only one point, handle as a single click
					if (numPoints == 1) {
						// delete the polyline
						drawingGroup.removeChild(eraserObj);
						
						// create a dot/ellipse and set its attributes
						// use the original xStart and yStart for this click
						var newDot;
						newDot = document.createElementNS(svgns, "ellipse");
						newDot.setAttribute("id", objectStr + currentObject.toString());
						newDot.setAttribute("cx", xStart.toString());
						newDot.setAttribute("cy", yStart.toString());
						newDot.setAttribute("rx", strokeWidthChoice.toString()/2);
						newDot.setAttribute("ry", strokeWidthChoice.toString()/2);
						newDot.setAttribute("style", "fill: " +
							eraserColor + "; stroke: " + eraserColor);
						
						// append dot to canvas
						drawingGroup.appendChild(newDot);
					} else { // if fill is on, add the fill
						if (shapeFillChoice) {
							eraserObj.style.fill = eraserColor;
						}
					}
					
					// debug output for completed eraser stroke
					if (debugging) {
						console.log(objectStr + currentObject.toString() + ": Made an eraser stroke.");
					}
					
					// increment shape counter and turn off inProgress flag
					currentObject += 1;
					inProgress = false;*/
					break;

				case 5: // eye dropper
					break;

				case 6: // paint can
					break;

				case 7: // wall
				
					/*// get the current wall stroke and its info
					var wallObj = document.getElementById(platformStr + currentPlatform.toString());
					var pointString = wallObj.getAttribute("points");
					var numPoints = pointString.split(" ").length-1;
					
					// if there's only one point, handle as a single click
					if (numPoints == 1) {
						// delete the polyline
						platformsGroup.removeChild(wallObj);
						
						// create a dot/ellipse and set its attributes
						// use the original xStart and yStart for this click
						var newDot;
						newDot = document.createElementNS(svgns, "ellipse");
						newDot.setAttribute("id", platformStr + currentPlatform.toString());
						newDot.setAttribute("cx", xStart.toString());
						newDot.setAttribute("cy", yStart.toString());
						newDot.setAttribute("rx", strokeWidthChoice.toString()/2);
						newDot.setAttribute("ry", strokeWidthChoice.toString()/2);
						newDot.setAttribute("style", "fill: " +
							wallColor + "; stroke: " + wallColor);
						newDot.setAttribute("class", "platformDot");
						
						// append dot to canvas
						platformsGroup.appendChild(newDot);
					}
				
					// debug output for completed wall
					if (debugging) {
						console.log(platformStr + currentPlatform.toString() + ": Made a wall.");
					}

					// add the index of the new wall to the platform actions list
					platformActionsList.push(currentPlatform);
					
					// increment shape counter and turn off inProgress flag
					currentPlatform += 1;
					inProgress = false;*/

					// do nothing, switched this tool to be a polygon tool instead of a brush
					break;
					
				case 8: // ladder
				
					/*// get the current ladder stroke and its info
					var ladderObj = document.getElementById(platformStr + currentPlatform.toString());
					var pointString = ladderObj.getAttribute("points");
					var numPoints = pointString.split(" ").length-1;
					
					// if there's only one point, handle as a single click
					if (numPoints == 1) {
						// delete the polyline
						platformsGroup.removeChild(ladderObj);
						
						// create a dot/ellipse and set its attributes
						// use the original xStart and yStart for this click
						var newDot;
						newDot = document.createElementNS(svgns, "ellipse");
						newDot.setAttribute("id", platformStr + currentPlatform.toString());
						newDot.setAttribute("cx", xStart.toString());
						newDot.setAttribute("cy", yStart.toString());
						newDot.setAttribute("rx", strokeWidthChoice.toString()/2);
						newDot.setAttribute("ry", strokeWidthChoice.toString()/2);
						newDot.setAttribute("style", "fill: " +
							ladderColor + "; stroke: " + ladderColor);
						newDot.setAttribute("class", "platformDot");
						
						// append dot to canvas
						platformsGroup.appendChild(newDot);
					}
				
					// debug output for completed ladder
					if (debugging) {
						console.log(platformStr + currentPlatform.toString() + ": Made a ladder.");
					}

					// add the index of the new ladder to the platform actions list
					platformActionsList.push(currentPlatform);
					
					// increment shape counter and turn off inProgress flag
					currentPlatform += 1;
					inProgress = false;*/

					// do nothing, switched this tool to be a polygon tool instead of a brush
					break;
					
				case 9: // platform select
					break;
					
				default: // should never get here
					console.log("Something went horribly awry with the tool picker.");
			}
		}
	}
}

// mouse click event handler
function mouseClick(evt) {
	// only do anything if in art or avatar mode
	if (mode == artMode) {
		// only do anything if the click was the left mouse button
		if (evt.which == 1) {
			switch(toolChoice) {
				case 0: // rectangle
					break;
			
				case 1: // ellipse
					break;

				case 2: // polygon
			
					// clear out current undo/redo lists to avoid branching
					// but only do this at first click of polygon to avoid redundancy
					if (!inProgress) {
						clearUndoRedoLists();
					}
			
					// get mouse coordinates in the canvas
					updateMouseCoords(evt);

					if (!inProgress) { // start a new polyline
						// create a polyline starting at the current mouse point
						xStart = xMouse;
						yStart = yMouse;
						var newPolyline = document.createElementNS(svgns, "polyline");
						newPolyline.setAttribute("id", objectStr + currentObject.toString());
						newPolyline.setAttribute("points", xStart.toString() + " " +
									yStart.toString());
						shapeFillChoiceString = shapeFillNone; // no fill until done
						newPolyline.setAttribute("style", "fill: " +
							shapeFillChoiceString + "; stroke: " + 
							colorChoice + "; stroke-width: " +
							strokeWidthChoice.toString());
						drawingGroup.appendChild(newPolyline);
					
						// create the polygon start point marker
						var startMarker = document.createElementNS(svgns, "ellipse");
						startMarker.setAttribute("id", polygonStartMarker);
						startMarker.setAttribute("cx", xStart);
						startMarker.setAttribute("cy", yStart);
						startMarker.setAttribute("rx", polygonMarkerRadius);
						startMarker.setAttribute("ry", polygonMarkerRadius);
						startMarker.setAttribute("style", "font-family: sans-serif; " +
							"font-size: 14pt; stroke: " + colorChoice + "; fill: " +
							colorChoice);
						drawingGroup.appendChild(startMarker);

						// create the polygon current point marker
						var pointMarker = document.createElementNS(svgns, "ellipse");
						pointMarker.setAttribute("id", polygonPointMarker);
						pointMarker.setAttribute("cx", xStart);
						pointMarker.setAttribute("cy", yStart);
						pointMarker.setAttribute("rx", polygonMarkerRadius);
						pointMarker.setAttribute("ry", polygonMarkerRadius);
						pointMarker.setAttribute("style", "font-family: sans-serif; " +
							"font-size: 14pt; stroke: " + colorChoice + "; fill: " +
							colorChoice);
						drawingGroup.appendChild(pointMarker);

						// mark that a shape is in progress
						inProgress = true;

					} else { // continue the polyline in progress
						// get the current shape and its info, including the marker
						var newPolyline = document.getElementById(objectStr + currentObject.toString());
						var pointString = newPolyline.getAttribute("points");
						var startMarker = document.getElementById(polygonStartMarker);
						var pointMarker = document.getElementById(polygonPointMarker);
					
						// check for the polygon being done/closed
						if ((Math.abs(xStart - xMouse) <= polygonCloseGap) && (
							Math.abs(yStart - yMouse) <= polygonCloseGap)) {
							// remove the polyline from the DOM
							drawingGroup.removeChild(newPolyline);

							// remove the polygon point markers from the DOM
							drawingGroup.removeChild(startMarker);
							drawingGroup.removeChild(pointMarker);

							// create a closed polygon to replace the polyline
							var newPolygon = document.createElementNS(svgns, "polygon");
							newPolygon.setAttribute("id", objectStr + currentObject.toString());
							newPolygon.setAttribute("points", pointString);
							if (shapeFillChoice) {
								shapeFillChoiceString = colorChoice;
							} else {
								shapeFillChoiceString = shapeFillNone;
							}
							newPolygon.setAttribute("style", "fill: " +
								shapeFillChoiceString +
								"; fill-rule: evenodd; stroke: " + 
								colorChoice + "; stroke-width: " +
								strokeWidthChoice.toString());
							drawingGroup.appendChild(newPolygon);

							// mark that the shape is complete
							if (debugging) {
								console.log(objectStr + currentObject.toString() +
								": Made a polygon at points: "+
								newPolygon.getAttribute("points") + ".");
							}
							currentObject += 1;
							inProgress = false;
						} else { // just add the current mouse point to the current polyline
							pointString += " " + xMouse.toString() +
								" " + yMouse.toString();
							newPolyline.setAttribute("points", pointString);

							// update the polygon current point marker
							pointMarker.setAttribute("cx", xMouse);
							pointMarker.setAttribute("cy", yMouse);
						}
					}
					break;

				case 3: // brush
					break;

				case 4: // eraser
					break;

				case 5: // eye dropper
			
					// get mouse coordinates in the canvas
					updateMouseCoords(evt);

					// get the color at these coordinates
					updateCanvas();
					var currentColor = getColorInDrawingAt(xMouse, yMouse);
				
					// set this color here and in the HTML form's color picker
					colorChoice = currentColor;
					setColorChoiceInHTML(currentColor);
					break;

				case 6: // paint can
					break;

				case 7: // wall

					// clear out current undo/redo lists to avoid branching
					// but only do this at first click of polygon to avoid redundancy
					if (!inProgress) {
						clearUndoRedoLists();
					}
			
					// get mouse coordinates in the canvas
					updateMouseCoords(evt);

					if (!inProgress) { // start a new polyline
						// create a polyline starting at the current mouse point
						xStart = xMouse;
						yStart = yMouse;
						var newPolyline = document.createElementNS(svgns, "polyline");
						newPolyline.setAttribute("id", platformStr + currentPlatform.toString());
						newPolyline.setAttribute("points", xStart.toString() + " " +
									yStart.toString());
						shapeFillChoiceString = shapeFillNone; // no fill until done
						newPolyline.setAttribute("style", "fill: " +
							shapeFillChoiceString + "; stroke: " + 
							wallColor + "; stroke-width: 1");
						platformsGroup.appendChild(newPolyline);
					
						// create the polygon start point marker
						var startMarker = document.createElementNS(svgns, "ellipse");
						startMarker.setAttribute("id", polygonStartMarker);
						startMarker.setAttribute("cx", xStart);
						startMarker.setAttribute("cy", yStart);
						startMarker.setAttribute("rx", polygonMarkerRadius);
						startMarker.setAttribute("ry", polygonMarkerRadius);
						startMarker.setAttribute("style", "font-family: sans-serif; " +
							"font-size: 14pt; stroke: " + wallColor + "; fill: " +
							wallColor);
						platformsGroup.appendChild(startMarker);

						// create the polygon current point marker
						var pointMarker = document.createElementNS(svgns, "ellipse");
						pointMarker.setAttribute("id", polygonPointMarker);
						pointMarker.setAttribute("cx", xStart);
						pointMarker.setAttribute("cy", yStart);
						pointMarker.setAttribute("rx", polygonMarkerRadius);
						pointMarker.setAttribute("ry", polygonMarkerRadius);
						pointMarker.setAttribute("style", "font-family: sans-serif; " +
							"font-size: 14pt; stroke: " + wallColor + "; fill: " +
							wallColor);
						platformsGroup.appendChild(pointMarker);

						// mark that a shape is in progress
						inProgress = true;

					} else { // continue the polyline in progress
						// get the current shape and its info, including the marker
						var newPolyline = document.getElementById(platformStr + currentPlatform.toString());
						var pointString = newPolyline.getAttribute("points");
						var startMarker = document.getElementById(polygonStartMarker);
						var pointMarker = document.getElementById(polygonPointMarker);
					
						// check for the polygon being done/closed
						if ((Math.abs(xStart - xMouse) <= polygonCloseGap) && (
							Math.abs(yStart - yMouse) <= polygonCloseGap)) {
							// remove the polyline from the DOM
							platformsGroup.removeChild(newPolyline);

							// remove the polygon point markers from the DOM
							platformsGroup.removeChild(startMarker);
							platformsGroup.removeChild(pointMarker);

							// create a closed polygon to replace the polyline
							var newPolygon = document.createElementNS(svgns, "polygon");
							newPolygon.setAttribute("id", platformStr + currentPlatform.toString());
							newPolygon.setAttribute("points", pointString);
							newPolygon.setAttribute("style", "fill: " + wallColor + 
								"; fill-rule: evenodd; stroke: " + wallColor + 
								"; stroke-width: 1");
							platformsGroup.appendChild(newPolygon);

							// mark that the shape is complete
							if (debugging) {
								console.log(platformStr + currentPlatform.toString() +
								": Made a wall at points: "+
								newPolygon.getAttribute("points") + ".");
							}
							
							// add the index of the new wall to the platform actions list
							platformActionsList.push(currentPlatform);
							
							// increment counter and set flag
							currentPlatform += 1;
							inProgress = false;
						} else { // try to add new point to polyline
							// first check to make sure this doesn't turn the shape concave
							pointString += " " + xMouse.toString() + " " + yMouse.toString();
							if (isConvex(pointString)) {
								// new point okay, so update the points string
								newPolyline.setAttribute("points", pointString);

								// and update the polygon current point marker
								pointMarker.setAttribute("cx", xMouse);
								pointMarker.setAttribute("cy", yMouse);
							} // else to nothing with this click b/c it is invalid
						}
					}
					break;
				
				case 8: // ladder

					// clear out current undo/redo lists to avoid branching
					// but only do this at first click of polygon to avoid redundancy
					if (!inProgress) {
						clearUndoRedoLists();
					}
			
					// get mouse coordinates in the canvas
					updateMouseCoords(evt);

					if (!inProgress) { // start a new polyline
						// create a polyline starting at the current mouse point
						xStart = xMouse;
						yStart = yMouse;
						var newPolyline = document.createElementNS(svgns, "polyline");
						newPolyline.setAttribute("id", platformStr + currentPlatform.toString());
						newPolyline.setAttribute("points", xStart.toString() + " " +
									yStart.toString());
						shapeFillChoiceString = shapeFillNone; // no fill until done
						newPolyline.setAttribute("style", "fill: " +
							shapeFillChoiceString + "; stroke: " + 
							ladderColor + "; stroke-width: 1");
						platformsGroup.appendChild(newPolyline);
					
						// create the polygon start point marker
						var startMarker = document.createElementNS(svgns, "ellipse");
						startMarker.setAttribute("id", polygonStartMarker);
						startMarker.setAttribute("cx", xStart);
						startMarker.setAttribute("cy", yStart);
						startMarker.setAttribute("rx", polygonMarkerRadius);
						startMarker.setAttribute("ry", polygonMarkerRadius);
						startMarker.setAttribute("style", "font-family: sans-serif; " +
							"font-size: 14pt; stroke: " + ladderColor + "; fill: " +
							ladderColor);
						platformsGroup.appendChild(startMarker);

						// create the polygon current point marker
						var pointMarker = document.createElementNS(svgns, "ellipse");
						pointMarker.setAttribute("id", polygonPointMarker);
						pointMarker.setAttribute("cx", xStart);
						pointMarker.setAttribute("cy", yStart);
						pointMarker.setAttribute("rx", polygonMarkerRadius);
						pointMarker.setAttribute("ry", polygonMarkerRadius);
						pointMarker.setAttribute("style", "font-family: sans-serif; " +
							"font-size: 14pt; stroke: " + ladderColor + "; fill: " +
							ladderColor);
						platformsGroup.appendChild(pointMarker);

						// mark that a shape is in progress
						inProgress = true;

					} else { // continue the polyline in progress
						// get the current shape and its info, including the marker
						var newPolyline = document.getElementById(platformStr + currentPlatform.toString());
						var pointString = newPolyline.getAttribute("points");
						var startMarker = document.getElementById(polygonStartMarker);
						var pointMarker = document.getElementById(polygonPointMarker);
					
						// check for the polygon being done/closed
						if ((Math.abs(xStart - xMouse) <= polygonCloseGap) && (
							Math.abs(yStart - yMouse) <= polygonCloseGap)) {
							// remove the polyline from the DOM
							platformsGroup.removeChild(newPolyline);

							// remove the polygon point markers from the DOM
							platformsGroup.removeChild(startMarker);
							platformsGroup.removeChild(pointMarker);

							// create a closed polygon to replace the polyline
							var newPolygon = document.createElementNS(svgns, "polygon");
							newPolygon.setAttribute("id", platformStr + currentPlatform.toString());
							newPolygon.setAttribute("points", pointString);
							newPolygon.setAttribute("style", "fill: " + ladderColor + 
								"; fill-rule: evenodd; stroke: " + ladderColor + 
								"; stroke-width: 1");
							platformsGroup.appendChild(newPolygon);

							// mark that the shape is complete
							if (debugging) {
								console.log(platformStr + currentPlatform.toString() +
								": Made a ladder at points: "+
								newPolygon.getAttribute("points") + ".");
							}
							
							// add the index of the new ladder to the platform actions list
							platformActionsList.push(currentPlatform);
							
							// increment counter and set flag
							currentPlatform += 1;
							inProgress = false;
						} else { // try to add new point to polyline
							// first check to make sure this doesn't turn the shape concave
							pointString += " " + xMouse.toString() + " " + yMouse.toString();
							if (isConvex(pointString)) {
								// new point okay, so update the points string
								newPolyline.setAttribute("points", pointString);

								// and update the polygon current point marker
								pointMarker.setAttribute("cx", xMouse);
								pointMarker.setAttribute("cy", yMouse);
							} // else to nothing with this click b/c it is invalid
						}
					}
					break;
				
				case 9: // platform select
					break;

				default: // should never get here
					console.log("Something went horribly awry with the tool picker.");
			}
		} // else do nothing
	} // else do nothing
}

// helper function that determines if the given string of points describes a convex polygon or not
// returns true if polygon is convex, else false
// references: http://svgdiscovery.com/C060/svg-convex-polygon-test.htm
// references: https://stackoverflow.com/questions/471962/how-do-determine-if-a-polygon-is-complex-convex-nonconvex
function isConvex(points) {
	// get the string of points into a 2D array structure
	var pointsList = points.split(" ");
	var pointsArray = [];
	for (var j = 0; j < pointsList.length; j += 2) {
		pointsArray.push([Number(pointsList[j]), Number(pointsList[j + 1])]);
	}

	// set up for test
	var sign = false;
	var n = pointsArray.length;
	
	// boundary case of too few points -> assume convex
	if (n < 4) {
		return true;
	}

	// calculate n sets of cross products
	for (var i = 0; i < n; i++) {
		var dx1 = pointsArray[(i + 1) % n][0] - pointsArray[(i) % n][0];
		var dy1 = pointsArray[(i + 1) % n][1] - pointsArray[(i) % n][1];
		var dx2 = pointsArray[(i + 2) % n][0] - pointsArray[(i + 1) % n][0];
		var dy2 = pointsArray[(i + 2) % n][1] - pointsArray[(i + 1) % n][1];
		var zcrossproduct = dx1 * dy2 - dy1 * dx2;
		
		// and keep a running comparison of their signs
		if (i == 0) {
			sign = zcrossproduct > 0;
		} else {
			if (sign != (zcrossproduct > 0)) {
				// sign mismatch -> this shape is not convex
				return false;
			}
		}
	}
	
	// no sign mismatch found -> this shape is convex
	return true;
}

// platform click event handler
function platformClick(evt) {
	// only do something if platform selection tool is active
	// and if the click is the left mouse button
	if (evt.which == 1 && toolChoice == 9) {
		// figure out what piece of platform was clicked
		var idstring = evt.target.getAttribute("id");
		var idnum = getIDNumFromIDString(platformStr, idstring);
		// decide if this is an already selected platform
		var same = false;
		if (idnum == selectedPlatform) {
			same = true;
		}
		// unselect the currently-selected piece of platform, if any
		togglePlatformSelection(selectedPlatform);
		// if click was on a piece not already selected, select it
		if (!same) {
			// mark the clicked piece of platform as selected
			togglePlatformSelection(idnum);
		}
	} // else do nothing
}

// handle border art zooming and panning
function borderArtZoom(doingReset) {
	if (zoomFactor != 1 || doingReset) { // canvas is zoomed, so handle border art

		// get the current view box settings
		var vBox = canvas.getAttribute("viewBox").split(" ");
		var vBoxX = parseFloat(vBox[0]);
		var vBoxY = parseFloat(vBox[1]);
		var vBoxW = parseFloat(vBox[2]);
		var vBoxH = parseFloat(vBox[3]);
		
		// hide all border art
		cornerArtDiv.style.display = "none";
		edgeArtDiv.style.display = "block";
		for (var i = 0; i < edgeArtDivList.length; i += 1) {
			edgeArtDivList[i].style.display = "none";
		}

		// display only regions the view box is still adjacent to,
		// applying the matching zoom and pan to those regions
		// used: https://www.w3schools.com/tags/tryit.asp?filename=tryhtml5_canvas_drawimage3
		// to play with drawImage and get this algorithm worked out
		// try: 0+55, 277-25, 110, 25, 0, 0, 220, 50
		var canvX = 0;
		var canvY = 0;
		var canvW;
		var canvH;
		var clipX;
		var clipY;
		var clipW;
		var clipH;
		if (vBoxY == 0) { // check top edge, region 1
			// apply zoom and pan to region 1/uc
			canvW = canvasWidth;
			canvH = canvasEdge;
			clipW = canvW / zoomFactor;
			clipH = canvH / zoomFactor;
			clipX = vBoxX;
			clipY = (canvH - clipH) + (canvasHeight - canvasEdge);
			
			// make sure these are still valid points
			clipX = Math.max(0, clipX);
			clipX = Math.min(canvasWidth, clipX);
			clipY = Math.max(0, clipY);
			clipY = Math.min(canvasHeight, clipY);
			
			// and then make sure that the width and height don't put you outside the canvas
			if (clipX + clipW > canvasWidth) {
				clipX = Math.abs(canvasWidth - clipW);
			}
			if (clipY + clipH > canvasHeight) {
				clipY = Math.abs(canvasHeight - clipH);
			}
			
			// save the resulting new clipX and clipY
			edgeArtClipList[0][0] = clipX;
			edgeArtClipList[0][1] = clipY;
			
			// re-draw into the appropriate canvas
			putGroupInCanvas(originalEdgesDict["uc"], displayDivContextList[1],
								clipX, clipY, clipW, clipH, 0, 0, canvW, canvH);
			// make region 1 visible
			edgeArtDivList[0].style.display = "block";
		}		
		if (vBoxX == 0) { // check left edge, region 3
			// apply zoom and pan to region 3/cl
			canvW = canvasEdge;
			canvH = canvasHeight;
			clipW = canvW / zoomFactor;
			clipH = canvH / zoomFactor;
			clipX = (canvW - clipW) + (canvasWidth - canvasEdge);
			clipY = vBoxY;
			
			// make sure these are still valid points
			clipX = Math.max(0, clipX);
			clipX = Math.min(canvasWidth, clipX);
			clipY = Math.max(0, clipY);
			clipY = Math.min(canvasHeight, clipY);
			
			// and then make sure that the width and height don't put you outside the canvas
			if (clipX + clipW > canvasWidth) {
				clipX = Math.abs(canvasWidth - clipW);
			}
			if (clipY + clipH > canvasHeight) {
				clipY = Math.abs(canvasHeight - clipH);
			}
			
			// save the resulting new clipX and clipY
			edgeArtClipList[1][0] = clipX;
			edgeArtClipList[1][1] = clipY;
			
			// re-draw into the appropriate canvas
			putGroupInCanvas(originalEdgesDict["cl"], displayDivContextList[3],
								clipX, clipY, clipW, clipH, 0, 0, canvW, canvH);
			// make region 3 visible
			edgeArtDivList[1].style.display = "block";
		}
		if (vBoxX + vBoxW == canvasWidth) { // check right edge, region 5
			// apply zoom and pan to region 5/cr
			canvW = canvasEdge;
			canvH = canvasHeight;
			clipW = canvW / zoomFactor;
			clipH = canvH / zoomFactor;
			clipX = 0;
			clipY = vBoxY;
			
			// make sure these are still valid points
			clipX = Math.max(0, clipX);
			clipX = Math.min(canvasWidth, clipX);
			clipY = Math.max(0, clipY);
			clipY = Math.min(canvasHeight, clipY);
			
			// and then make sure that the width and height don't put you outside the canvas
			if (clipX + clipW > canvasWidth) {
				clipX = Math.abs(canvasWidth - clipW);
			}
			if (clipY + clipH > canvasHeight) {
				clipY = Math.abs(canvasHeight - clipH);
			}
			
			// save the resulting new clipX and clipY
			edgeArtClipList[2][0] = clipX;
			edgeArtClipList[2][1] = clipY;
			
			// re-draw into the appropriate canvas
			putGroupInCanvas(originalEdgesDict["cr"], displayDivContextList[5],
								clipX, clipY, clipW, clipH, 0, 0, canvW, canvH);
			// make region 5 visible
			edgeArtDivList[2].style.display = "block";
		}
		if (vBoxY + vBoxH == canvasHeight) { // check bottom edge, region 7
			// apply zoom and pan to region 7/bm
			canvW = canvasWidth;
			canvH = canvasEdge;
			clipW = canvW / zoomFactor;
			clipH = canvH / zoomFactor;
			clipX = vBoxX;
			clipY = 0;
			
			// make sure these are still valid points
			clipX = Math.max(0, clipX);
			clipX = Math.min(canvasWidth, clipX);
			clipY = Math.max(0, clipY);
			clipY = Math.min(canvasHeight, clipY);
			
			// and then make sure that the width and height don't put you outside the canvas
			if (clipX + clipW > canvasWidth) {
				clipX = Math.abs(canvasWidth - clipW);
			}
			if (clipY + clipH > canvasHeight) {
				clipY = Math.abs(canvasHeight - clipH);
			}
			
			// save the resulting new clipX and clipY
			edgeArtClipList[3][0] = clipX;
			edgeArtClipList[3][1] = clipY;
			
			// re-draw into the appropriate canvas
			putGroupInCanvas(originalEdgesDict["bm"], displayDivContextList[7],
								clipX, clipY, clipW, clipH, 0, 0, canvW, canvH);
			// make region 7 visible
			edgeArtDivList[3].style.display = "block";
		}

	} else { // not zoomed, so display all the border art as normal
		cornerArtDiv.style.display = "block";
		edgeArtDiv.style.display = "block";
		for (var i = 0; i < edgeArtDivList.length; i += 1) {
			edgeArtDivList[i].style.display = "block";
		}
	}
	if (doingReset) { // doing a reset, so display all the border art as normal
		cornerArtDiv.style.display = "block";
		edgeArtDiv.style.display = "block";
		for (var i = 0; i < edgeArtDivList.length; i += 1) {
			edgeArtDivList[i].style.display = "block";
		}
	}
}

// zoom function
// assumes calling function has updated or set mouse coords to use
// direction == true ---> zoom in
// direction == false --> zoom out
function doZoom(direction) {
	
	// get the current view box settings
	var vBox = canvas.getAttribute("viewBox").split(" ");
	var vBoxX = parseFloat(vBox[0]);
	var vBoxY = parseFloat(vBox[1]);
	var vBoxW = parseFloat(vBox[2]);
	var vBoxH = parseFloat(vBox[3]);

	// do simple zoom based on direction
	if (direction) { // zoom in one step
		// disallow zooming in so far these values go too low
		if ((vBoxW / zoomStep >= minWidth) || (vBoxH / zoomStep >= minHeight)) {
			// calculate new box
			vBoxW /= zoomStep;
			vBoxH /= zoomStep;
			// change corner point as necessary
			vBoxX = xMouse - vBoxW / 2;
			vBoxY = yMouse - vBoxH / 2;
			// make sure these points are valid
			vBoxX = Math.max(0, vBoxX);
			vBoxX = Math.min(canvasWidth, vBoxX);
			vBoxY = Math.max(0, vBoxY);
			vBoxY = Math.min(canvasHeight, vBoxY);
			// and then make sure that the width and height don't put you outside the canvas
			if (vBoxX + vBoxW > canvasWidth) {
				vBoxX = Math.abs(canvasWidth - vBoxW);
			}
			if (vBoxY + vBoxH > canvasHeight) {
				vBoxY = Math.abs(canvasHeight - vBoxH);
			}
			// update zoom factor
			zoomFactor *= zoomStep;
		} // else don't zoom
	} else { // zoom out one step
		// disallow zooming out farther than the default zoom
		if ((vBoxW * zoomStep <= canvasWidth) || (vBoxH * zoomStep <= canvasHeight)) {
			// calculate new box
			vBoxW *= zoomStep;
			vBoxH *= zoomStep;
			// change corner point as necessary
			vBoxX = xMouse - vBoxW / 2;
			vBoxY = yMouse - vBoxH / 2;
			// make sure these points are valid
			vBoxX = Math.max(0, vBoxX);
			vBoxX = Math.min(canvasWidth, vBoxX);
			vBoxY = Math.max(0, vBoxY);
			vBoxY = Math.min(canvasHeight, vBoxY);
			// and then make sure that the width and height don't put you outside the canvas
			if (vBoxX + vBoxW > canvasWidth) {
				vBoxX = Math.abs(canvasWidth - vBoxW);
			}
			if (vBoxY + vBoxH > canvasHeight) {
				vBoxY = Math.abs(canvasHeight - vBoxH);
			}
			// update zoom factor
			zoomFactor /= zoomStep;
			// update pan offsets
		} else { // don't zoom
			// instead reset to default to fix any rounding errors
			vBoxX = 0;
			vBoxY = 0;
			vBoxW = canvasWidth;
			VBoxH = canvasHeight;
			// get rid of pesky remaining decimal parts
			vBoxX = Math.floor(vBoxX);
			vBoxY = Math.floor(vBoxY);
			vBoxW = Math.floor(vBoxW);
			vBoxH = Math.floor(vBoxH);
			// reset zoom factor
			zoomFactor = 1;
		}
	}

	// set the new view box settings
	vBox = vBoxX.toString() + " " + vBoxY.toString() + " " + vBoxW.toString() + " " + vBoxH.toString();
	canvas.setAttribute("viewBox", vBox);

	// handle border art zooming
	if (zoomFactor != 1) {
		borderArtZoom(false);
	} else {
		borderArtZoom(true);
	}

	// debug message
	if (debugging) {
		console.log("Changed zoom factor to: " + zoomFactor.toString() + " and view box to: " + vBox);
	}
}

// zoom reset function
// also resets pan
function doZoomReset() {
	// restore default viewBox
	var vBox = defaultViewBox;
	canvas.setAttribute("viewBox", vBox);
	// reset zoom factor
	zoomFactor = 1;
	// debug message
	if (debugging) {
		console.log("Changed zoom factor to: " + zoomFactor.toString() + " and view box to: " + vBox);
	}
	// handle border art zooming
	borderArtZoom(true);
}

// adjust the viewbox by panning
function doPan(xAmount, yAmount) {
	// get the current view box settings
	var vBox = canvas.getAttribute("viewBox").split(" ");
	var vBoxX = parseFloat(vBox[0]);
	var vBoxY = parseFloat(vBox[1]);
	var vBoxW = parseFloat(vBox[2]);
	var vBoxH = parseFloat(vBox[3]);
	var origX = vBoxX;
	var origY = vBoxY;

	// adjust by given pan amounts
	vBoxX += xAmount;
	vBoxY += yAmount;

	// make sure these are still valid points
	vBoxX = Math.max(0, vBoxX);
	vBoxX = Math.min(canvasWidth, vBoxX);
	vBoxY = Math.max(0, vBoxY);
	vBoxY = Math.min(canvasHeight, vBoxY);

	// and then make sure that the width and height don't put you outside the canvas
	if (vBoxX + vBoxW > canvasWidth) {
		vBoxX = canvasWidth - vBoxW;
	}
	if (vBoxY + vBoxH > canvasHeight) {
		vBoxY = canvasHeight - vBoxH;	
	}

	// set the new view box settings
	vBox = vBoxX.toString() + " " + vBoxY.toString() + " " + vBoxW.toString() + " " + vBoxH.toString();
	canvas.setAttribute("viewBox", vBox);
	
	// handle border art
	borderArtZoom(false);

	// debug message
	if (debugging) {
		console.log("Panned and changed view box to: " + vBox);
	}
}

// scroll wheel event handler
function scrollWheel(evt) {
	// only do anything if in art or avatar mode
	if (mode == artMode) {
		// prevent default behavior to stop weird scroll issues
		evt.preventDefault();
		// get mouse coordinates in the canvas
		updateMouseCoords(evt);
		// do zoom based on scroll direction
		if (evt.deltaY < 0) { // zoom in
			doZoom(true);
		} else { // zoom out
			doZoom(false);
		}
	} // else do nothing
}