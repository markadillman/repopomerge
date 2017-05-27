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
var spriteWidth = 10;
var spriteHeight = 50;
var defaultTextColor = '#373854';
var panTime = 500; // ms


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

				.textColor(defaultTextColor)

				.textAlign('center');

			/*// Instructions
			Crafty.e('2D, DOM, Text')

				.attr({x: 0, y: (screenHeight / 3) * 2,
					   w: screenWidth, h: screenHeight})

				.text('Press Enter to begin')

				.textFont({family: 'Trebuchet MS',
						   size: '30px',

						   weight: 'bold'})
				.textColor(defaultTextColor)
				.textAlign('center');
			// Enter key loads avatar selection screen
			Crafty.e('Start, 2D, Canvas, Color, Solid')

				.attr({x: 200, y: 200, w: 100, h: 40})
				.bind('KeyDown', function(e)

				{

					if(e.key == Crafty.keys.ENTER)

					{

						Crafty.enterScene('SetupScreen');

					}
				});*/

			// ### Lucia - okay to delete the above commented out chunk of code?

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
				.attr({x: 0, y: canvasEdge,

					   w: screenWidth, h: screenHeight})

				.text(creditsText)
				.textFont({family: 'Trebuchet MS',

						   size: '18px'})

				.textColor(defaultTextColor)

				.textAlign('center');
			// button to return to home screen
			Crafty.e('myButton, 2D, DOM, Color, Mouse, Text, Button')
				.attr({x: (screenWidth / 2) - 50,
					y: screenHeight - canvasEdge,
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

				.textFont({family: 'Trebuchet MS',

						   size: '20px'})

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

			// Player sprite

			var player = Crafty.e('2D, DOM, Color, Twoway, Gravity')

				// Initial position and size

				.attr({x: 0, y: 0, w: 10, h: 50})

				// Color of sprite (to be replaced)
				.color('#F00')
				// Enable 2D movement

				// ### Lucia - all movement controls should only work

				// if mode == gameMode (global variable set in tool.js

				.twoway(200)
				// Set platforms to stop falling player
				.gravity('Platform')
				.gravityConst(600)
				// Bind spacebar to jump action
				.jumper(300, [Crafty.keys.SPACE])

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

							//console.log("Go go gadget edit mode!");
							doTileEdit(); // function in tool.js
						}
						if (e.key == Crafty.keys.M) {

							// ### switch to map mode
							// rememnber to have map mode have a way to switch back

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
	      				if (this.x > currentUpperLeftX + tileWidth)
	      				{
	      					currentUpperLeftX = currentUpperLeftX + tileWidth;
	      					Crafty.viewport.pan(tileWidth, 0, panTime);
	      				}
	      				else if (this.x < currentUpperLeftX)
	      				{
	      					currentUpperLeftX = currentUpperLeftX - tileWidth;
      						Crafty.viewport.pan(tileWidth * -1, 0, panTime);
	      				}

	      				if (this.y > currentUpperLeftY + tileHeight)
	      				{
	      					currentUpperLeftY = currentUpperLeftY + tileHeight;
	      					Crafty.viewport.pan(0, tileHeight, panTime);
	      				}
	      				else if (this.y < currentUpperLeftY)
	      				{
	      					currentUpperLeftY = currentUpperLeftY - tileHeight;
	      					Crafty.viewport.pan(0, tileHeight * -1, panTime);
	      				}
	      			});


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

			// Floor

			Crafty.e('Platform, 2D, Canvas, Color')
				.attr({x: -4000, y: 590, w: 8000, h: 10})
				.color('green');

			// Have camera follow player sprite

			Crafty.viewport.follow(player, 0, 50);
		}, function() {
			// start Toni's code
			// adding an uninit function
			// in order to set flag from tool.js
			playing = false;
			// end Toni's code
		});

		// Start game on home screen
		Crafty.enterScene('HomeScreen');
	}
}