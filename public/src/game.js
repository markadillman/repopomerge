/*

Lucia - maybe add some document info here? Like what I have in tool.js

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
var playerSpawnX = canvasEdge + 374.5;
var playerSpawnY = canvasEdge + 108;
var titleTextColor = '#373854';
var panTime = 500; // ms
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

Game =
{
	start: function()
	{
		Crafty.init(screenWidth, screenHeight, document.getElementById('gameDiv'));
		Crafty.background(bgroundColor)

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
				});
		});
		// end Toni's code

		// Player setup screen scene
		Crafty.defineScene('SetupScreen', function()
		{
			// Select avatar

			// Left arrow
			Crafty.e('2D, DOM, Color, Mouse')
				.attr({x: screenWidth / 6, y: screenHeight / 3, w: 40, h: 40})
				.color('red');

			// Right arrow
			Crafty.e('2D, DOM, Color, Mouse')
				.attr({x: (screenWidth / 6) * 5 - 40, y: screenHeight / 3,
					   w: 40, h: 40})
				.color('red');

			// Selected avatar

			// Ready/enter world button
			Crafty.e('2D, DOM, Color, Mouse, Text')
				.attr({x: (screenWidth / 2) - 100,
					   y: screenHeight - (canvasEdge * 2),
					   w: 200, h: 40})
				.color('#FFFFFF')
				.text('Start!')
				.textAlign('center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', function(MouseEvent)
				{
					Crafty.enterScene('World');
				});

			// start Toni's code
			// add help and quit clickable buttons to this scene
			// because honestly the hotkeys were a nightmare in the world / gameplay scene
			// button to return to home screen
			Crafty.e('myButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: (screenWidth / 2) - 50,
					y: screenHeight - canvasEdge,
					w: 100, h: 25})
				.color(bgroundColor)
				.text('Help')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', function(MouseEvent) {
					displayHelpScreen();
				});
			// button to return to home screen
			Crafty.e('myButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: (screenWidth / 2) - 50,
					y: screenHeight - canvasEdge/2,
					w: 100, h: 25})
				.color(bgroundColor)
				.text('Quit')
				.textAlign('Center')
				.textFont({family: 'Trebuchet MS', size: '20px'})
				.bind('Click', function(MouseEvent) {
					Crafty.enterScene('HomeScreen');
				});
			// end Toni's code
		});

		
		
		// Main game world scene
		Crafty.defineScene('World', function()
		{
			// start Toni's code
			// set playing flag from tool.js
			playing = true;
			// end Toni's code
			
			// try doing background art loading first
			initAssetRequest(0, 0);
			
			// Toni moved these up so they load earlier
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
				.attr({x: playerSpawnX - 50, y: playerSpawnY + 90, w: 100, h: 10})
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
				
			// Player sprite
			var player = Crafty.e('2D, DOM, Color, Twoway, Gravity')

				// Initial position and size
				// inside the hole in the tree
				.attr({x: playerSpawnX, y: playerSpawnY, w: spriteWidth, h: spriteHeight})

				// Color of sprite (to be replaced)
				.color('#F00')
				
				// Enable 2D movement
				// ### Lucia - all movement controls should only work
				// if mode == gameMode and playing == true
				// (these are global variables also used in tool.js)
				// also, d appears to make the avatar move to the right?
				.twoway(200)
				// Set platforms to stop falling player
				.gravity('Platform')
				.gravityConst(600)
				// Bind spacebar to jump action
				.jumper(400, [Crafty.keys.SPACE])

				// Allow player to drop through platforms
				.bind('KeyDown', function(e)
				{
					if(e.key == Crafty.keys.DOWN_ARROW)
					{
						this.antigravity();
						this.gravity('Platform');
					}
				})
				.bind('KeyUp', function(e)
				{
					if(e.key == Crafty.keys.DOWN_ARROW)
					{
						this.gravity('Platform');
					}

					// start Toni's code
					// bind the gameplay mode hotkeys
					if (mode == gameMode) { // only read these if in gameplay mode
						if (e.key == Crafty.keys.E) {
							if (verboseDebugging) {
								//console.log("Go go gadget edit mode!");
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
							// remember to have map mode have a way to switch back
						}

						if (e.key == Crafty.keys.Q) {
							// quit to home screen
							// ### server cleanup stuff here?
							doQuitToHomeScreen(); // tool.js cleanup
							Crafty.enterScene('HomeScreen');
						}

						if (e.key == Crafty.keys.W) {
							// ### toggle platform viewing mode
						}
					}
					// end Toni's code
				})
				
				// Move camera when player leaves current tile
				.bind('Moved', function()
					{
						// MARK ADDED get current tile coordinates to orient pull
						var tileX = Math.floor(currentUpperLeftX / tileWidth);
						var tileY = Math.floor(currentUpperLeftY / tileHeight);
						// start Toni's code
						// make the global versions of these from tool.js match
						// ### but consider merging them instead at some point
						xTile = tileX;
						yTile = tileY;
						// end Toni's code
						var payload = {'x' : tileX, 'y': tileY};
						if (this.x > currentUpperLeftX + tileWidth)
						{
							currentUpperLeftX = currentUpperLeftX + tileWidth;
							Crafty.viewport.pan(tileWidth, 0, panTime);

							// Load assets in outer rightmost "ring" segment
							dynamicPostRequest('/pullright',payload,dynamicPostOnLoad,dynamicError);
							// Destroy assets in outer leftmost "ring" segment
						}
						else if (this.x < currentUpperLeftX)
						{
							currentUpperLeftX = currentUpperLeftX - tileWidth;
							Crafty.viewport.pan(tileWidth * -1, 0, panTime);

							// Load assets in outer leftmost "ring" segment
							dynamicPostRequest('/pullleft',payload,dynamicPostOnLoad,dynamicError);
							// Destroy assets in outer rightmost "ring" segment
						}

						if (this.y > currentUpperLeftY + tileHeight)
						{
							currentUpperLeftY = currentUpperLeftY + tileHeight;
							Crafty.viewport.pan(0, tileHeight, panTime);

							// Load assets in outer bottom-most "ring" segment
							dynamicPostRequest('/pullbottom',payload,dynamicPostOnLoad,dynamicError);
							// Destroy assets in outer top-most "ring" segment
						}
						else if (this.y < currentUpperLeftY)
						{
							currentUpperLeftY = currentUpperLeftY - tileHeight;
							Crafty.viewport.pan(0, tileHeight * -1, panTime);

							// Load assets in outer top-most "ring" segment
							dynamicPostRequest('/pulltop',payload,dynamicPostOnLoad,dynamicError);
							// Destroy assets in outer bottom-most "ring" segment
						}
					})
				//this event added by Mark to pull initial environment
				.bind('Spawned',function(){
					//initAssetRequest(this.x,this.y);
				});
				
			
			// set platform z between background and avatar
			Crafty("Platform").z = 1;
			
			//player should be in front of other graphical assets
			player.z = 2;

			//MARK ADDED pull initial art assets
			// Toni added a call to initAssetRequest(0, 0) earlier in this function
			//Crafty.trigger('Spawned');
				
		}, function() {
			// start Toni's code
			// adding an uninit function
			// in order to set flag from tool.js
			playing = false;
			// end Toni's code
		});

		/*start Mark's code, helper functions to fetch rows of 5 assets:
			"top pull" : {{-2,-3},{-1,-3},{0,-3},{1,-3},{2,-3}}, URL: /pulltop
			"bottom pull" : {{-2,3},{-1,3},{0,3},{1,3},{2,3}},   URL: /pullbottom
			"left pull" : {{-3,-2},{-3,-1},{-3,0},{-3,1},{-3,2}},URL: /pullleft
			"right pull" : {{3,-2},{3,-1},{3,0},{3,1},{3,2}}     URL: /pullright
			onload will render the environment into the correct coordinates. Must pass
		    the data structure key as an arg to the callback ("top pull", etc.)
		*/
		function dynamicPostRequest(url,payload,onload,error){
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
						onload(request);
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
		function assetRender(assets){
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
				url = domURL.createObjectURL(blobSvg),
				img = new Image;
				//img.onload = function(){
					if (verboseDebugging) {
						console.log("asset url");
						console.log(url);
					}
					//adjust coordinates
					var tempX = assets[asset]['xcoord'] * tileWidth + canvasEdge;
					var tempY = assets[asset]['ycoord'] * tileHeight + canvasEdge;
					var bground = Crafty.e('Background, 2D, DOM, Image')
					.attr({x: tempX, y : tempY, w: tileWidth, h: tileHeight, tileX: asset['xcoord'], tileY : asset['ycoord']})
					.image(url);
					bground.z = 0;
				//};
				if (verboseDebugging) {
					console.log("blob svg");
					console.log(blobSvg);
				}
				img.src = url;
			}
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

		function initAssetRequest(playerX,playerY){
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
			dynamicPostRequest('/initpull',body,initAssetRender,dynamicError);
		}

		function initAssetRender(request){
			//parse the response body and render it
			var body = JSON.parse(request.responseText);
			if (verboseDebugging) {
				console.log("response:");
				console.log(body);
			}
			//render new assets in respective tiles
			assetRender(body);
		}

		// Start game on home screen
		Crafty.enterScene('HomeScreen');
	}
}