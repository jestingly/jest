console.log( 'jestAlert: js/apps/jest/components/JestInspector.js loaded' );

//-------------------------
// JestInspector Class
//-------------------------
// Creates an [object] to assist in debugging.
class JestInspector extends JestGamepiece {
	// Rendering [objects]
	// NOTE: The debugging canvas should be an external cross-reference; if null, it defaults to the gameboard canvas:
	_canvas			= null;			// [object] ElementCanvas to visually render onto.
	// Debugging [objects]
	anchors			= null;			// [array] Of [objects] to visually render.

	// --------------------------------
	// Constructor
	// --------------------------------
	// Initializes the game piece [object].
	// * client		- [object] Application client that this piece belongs to.
	constructor( client ) {
		super( client );				// construct the parent
		// Set anchors as a set
		this.anchors	= new Set();	// make anchors a set of [objects]
	}

	// --------------------------------
	// Debug Handling
	// --------------------------------
	// Turn the debugger on.
	// RETURNS: [void].
	// * options [object] of options to turn on
	// 		anchors	- [bool] Whether to view anchors or not.
	on() {
		// Enable debug tracking
		this.client.timeout.register( 'tick', 'debugging', e=>this.update(e) );
	}

	// Turn the debugger off.
	// RETURNS: [void].
	off() {
		// Disable debug tracking
		this.client.timeout.register( 'tick', 'debugging' );
	}

	// --------------------------------
	// Debug Option Toggling
	// --------------------------------
	// Turn the debugger on.
	// RETURNS: [void].
	// * options [object] of options to turn on
	// 		anchors	- [bool] Whether to view anchors or not.
	enable( ...args ) {
		// Iterate argument(s) & enable requested option(s)
		for ( var i=0; i<args.length; i++ ) {
			var arg	= args[i];
			switch ( arg ) {
				// Disable requested debug tracking
				case 'showAnchors':
					this.register( 'debug', 'showAnchors', ()=>this.showAnchors() );
					break;
			}
		}
	}
	// Turn the debugger off.
	// RETURNS: [void].
	// * options [object] of options to turn off.
	// 		anchors	- [bool] Whether to view anchors or not.
	disable( ...args ) {
		// Iterate argument(s) & disable requested option(s)
		for ( var i=0; i<args.length; i++ ) {
			var arg	= args[i];
			switch ( arg ) {
				// Disable requested debug tracking
				case 'showAnchors':
					this.unregister( 'debug', 'showAnchors' );
					break;
			}
		}
	}

	// --------------------------------
	// Rendering Method(s)
	// --------------------------------
	// Set the debugger ElementCanvas [object]
	// * canvas		- [object] ElementCanvas object to draw debugging options onto
	set canvas( canvas ) {
		// Validate argument
		if ( !(canvas instanceof ElementCanvas) ) {
			console.warn( `Argument 'obj' should be of type ElementCanvas.` );
			return;
		}
		this._canvas	= canvas; // set canvas
	}

	// Handle the debugger central loop.
	// RETURNS: [void].
	update( e ) {
		// Emit anchor(s) visualizer event
		this.emit( 'debug', 'anchors' );
	}

	// Display available anchor(s) set to be shown.
	// RETURNS: [void].
	showAnchors() {
		// Require canvas to draw upon
		if ( !(this._canvas instanceof ElementCanvas) ) return;
		// Drawn available anchors
		this.anchors.forEach(
			anchor => {
				// Skip anchor if color not set
				if ( anchor._color===null ) return;
				// Access drawing context
				var ctx			= this._canvas.el.getContext( '2d' );
				ctx.fillStyle	= anchor._color; // anchor drawing color
				// Set canvas drawing opacity to anchor alpha value
				ctx.globalAlpha	= anchor._alpha / 100;
				// Get width/height based upon units
				const width		= anchor.width * anchor.units;
				const height	= anchor.height * anchor.units;
				// Draw rectangle
				ctx.fillRect( anchor.globalX, anchor.globalY, width, height );
				// Reset canvas drawing opacity to 100%
				ctx.globalAlpha	= 1;
			});
	}

	//-------------------------
	// Timer Functions
	//-------------------------
	// NOTE: method is redundant, look into expanding / changing OSConfigurable
	// Update some clock counter & log its time (override from OSConfigurable).
	// NOTE: Debugger always uses performance.now() rather than Date.now()
	// * stopwatch	- [boolean] whether to log time difference from last clock.
	//   name		- [string] Optional name of the clock (default: 'default')
	//   report		- [boolean] Whether to console log a report
	_clock( stopwatch=false, name='default', report=false ) {
		// Initialize clock if not set
		const start	= this._clocks?.[name] ?? performance.now();
		// Calculate time difference
		const time	= super._clock( name, false, report );
		// Output a time difference report
		if ( stopwatch===true )
			console.log( `Stopwatch '${name}' clocked: ${time - start} seconds` );
		return time; // Return elapsed time
	}
}
