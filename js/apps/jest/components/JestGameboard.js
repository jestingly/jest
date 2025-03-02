console.log( 'jestAlert: js/apps/jest/components/JestGameboard.js loaded' );

//-------------------------
// JestGameboard Class
//-------------------------
class JestGameboard extends JestSavable {
	// Object properties
	canvas			= null;				// [object] ElementCanvas
	// World [objects]
	sounds			= {};				// [object] of JestSound [objects] used to play specific sound effects.
	tilesets		= {};				// [object] of JestTileset [objects]
	overworlds		= {};				// [object] of JestOverworld [objects] used to connect levels.
	levels			= {};				// [object] of JestLevel [objects] that contain maps of tiles.
	// Interactive [objects]
	players			= {};				// [object] of JestPlayer [objects] that contains all active player(s).

	//-------------------------
	// Constructor
	//-------------------------
	// Creates the object.
	// * client		- [object] Application client creating the object.
	constructor( client ) {
		// Call the parent object constructor
		super( client );				// construct the parent
		this.client		= client;		// store the client [object] reference
		// --------------------------------
		// Setup object
		// --------------------------------
		this.setup();					// setup the object
		this.build();					// render the object
	}

	//-------------------------
	// Initialization Methods
	//-------------------------
	// Setup the object [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async setup() {
		// --------------------------------
		// Build Level
		// --------------------------------
		this.build();					// build the object
		// --------------------------------
		// Load File(s) Data
		// --------------------------------
		await this.load();				// load the data
		return true;		// success
	}

	// Build the object.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	build() {
		// --------------------------------
		// Create Drawing [objects]
		// --------------------------------
		// Create the level rendering [canvas]
		const canvas	= new ElementCanvas();
		this.canvas		= canvas;
		// Add resize event handler for canvas updating
		this.anchor.register( 'resize', 'canvas', (w,h)=>this.resize(w,h) );
		// --------------------------------
		// Setup Tileset
		// --------------------------------
		// Simulated game loop for updates and drawing.
		//const canvas	= new ElementCanvas();
		//this.canvas		= canvas;
		return true; // success
	}

	//-------------------------
	// Data Handling
	//-------------------------
	// Load the data.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async load() {
		super.load();		// call parent load start method
		// Load varying images
		await this.client.gallery.loadImages([
			{ category: 'SPRITES', filename: 'sprites1', filetype: 'PNG' }
			]);
		this.complete();	// call complete method
		return true;		// success
	}

	// Complete data load.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	complete() {
		super.complete();	// call parent complete method
		this.client.gameboard.levels[this.name] = this; // store reference in stack [object]
		return true;		// success
	}

	//-------------------------
	// Canvas Methods
	//-------------------------
	// Resize the canvas element.
	// NOTE: This is a callback function.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * width		- [int] Value of custom width span of canvas.
	// * height		- [int] Value of custom height span of canvas.
	resize( width, height ) {
		// Update canvas dimensions
		if ( this.canvas )
			this.canvas.resize( width, height );
		return true;	// success
	}

	//-------------------------
	// Tileset Handling
	//-------------------------
	// Create tileset.
	// RETURNS: [object] JestTileset on success else throw error on fail.
	// * name		- [string] value of tileset name (e.g. 'pics1').
	async addTileset( name ) {
		// Create new tileset [object]
		const tileset	= new JestTileset( this.client, name );
		// Setup tileset definition(s)
		let response;
		try {
			// Setup the tileset data
			await tileset.setup();
			// Add tileset to tilesets list
			this.tilesets[tileset.name]	= tileset;
			return tileset;
		}
		catch ( err ) { throw new Error(`Failed to add tileset: ${err}`); }
	}

	//-------------------------
	// Rendering Methods
	//-------------------------
	// Update the gameboard periodically.
	// * elapsedTime	- how much time has passed since the ticker started.
	// * tickDelay		- how much time between each tick (ie. 60ms)
	// * tickCount		- how many ticks have occurred
	// RETURNS: [void].
	update( { elapsedTime, tickDelay, tickCount } ) {
		this.draw(); // Call central draw method
	}

	// Draw the central gameboard.
	// RETURNS: [void].
	draw() {
		// Determine if canvas is set
		if ( !this.canvas || !this.canvas.el ) {
			console.warn( 'Canvas is not set or invalid' );
			return;
		}
		// Update camera view
		this.client.camera.update();
		// Clear the canvas with a black screen
		const ctx		= this.canvas.el.getContext( '2d' );
		ctx.clearRect( 0, 0, this.canvas.el.width, this.canvas.el.height );
		// Draw level onto canvas
		const overworld	= this.overworlds.map1;
		const snapshot	= overworld.getSnapshot();
		overworld.renderVisibleLevels( ctx, snapshot );
	}
}
