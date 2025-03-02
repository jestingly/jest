console.log( 'jestAlert: js/apps/jest/components/JestPlayer.js loaded' );

//-------------------------
// Jest I/O Class
//-------------------------
// An input-output class for keyboard listening
class JestInputOutput extends OSEventTarget {
	//-------------------------
	// Properties
	//-------------------------
	keyHistory		= [];				// [Array] History of the last 5 key presses
	keyHistorySize	= 10;				// [Int] value of how many key states to store
	activeKeys		= new Map();		// [Map] Tracks keys and their press times
	repeatTimers	= {};				// [Object] Timers for repeat actions
	repeatDelay		= 0;				// [Int] Default delay before repeats (ms)
	repeatInterval	= 0;				// [Int] Default repeat interval (ms)

	//-------------------------
	// Constructor
	//-------------------------
	// Initializes the keyboard listener and starts listening for key events.
	// RETURNS: [void].
	constructor() {
		super();				// Call the parent constructor
		this._bindListeners();	// Bind keydown and keyup listeners
		console.log( 'Input/Output initialized.' );
	}

	//-------------------------
	// Public Methods
	//-------------------------

	// Converts an array of keys to a normalized [string] command.
	// RETURNS: [string] The command as a string.
	// * keys	- [Array] Array of key names (e.g., ['Control', 'Shift', 'S']).
	command( keys ) {
		return keys.sort().join('+');
	}

	// Stops listening to keyboard events.
	// RETURNS: [void].
	destroy() {
		this.unregister( 'keydown', 'press' );
		this.unregister( 'keyup', 'release' );
		console.log( 'KeyboardListener destroyed.' );
	}

	//-------------------------
	// Keyboard Listening
	//-------------------------
	// Binds event listeners for keydown and keyup events.
	// RETURNS: [void].
	_bindListeners() {
		// Use OSEventTarget's `register` for event registration
		this.register( 'keydown', 'press', this._onKeyDown.bind(this), 'window' );
		this.register( 'keyup', 'release', this._onKeyUp.bind(this), 'window' );
	}

	// Handles the `keydown` event.
	// RETURNS: [void].
	// * event		- [KeyboardEvent] The keydown event object.
	_onKeyDown( event ) {
		// Prevent keys events from manipulating the page
		event.preventDefault();
		// Handle key event
		const key	= event.key;
		// Prevent duplicate entries in activeKeys
		if ( !this.activeKeys.has(key) ) {
			const now = performance.now();
			this.activeKeys.set( key, now );
			// Add to key history
			this.keyHistory.push( key );
			if ( this.keyHistory.length>this.keyHistorySize ) {
				this.keyHistory.shift(); // Remove the oldest key
			}
			// Emit a custom event for the pressed key
			this.emit( 'keyPress', null, { event, key, timestamp: now } );
		}
	}

	// Handles the `keyup` event.
	// RETURNS: [void].
	// * event		- [KeyboardEvent] The keyup event object.
	_onKeyUp( event ) {
		// Prevent keys events from manipulating the page
		event.preventDefault();
		const key	= event.key;
		this.activeKeys.delete( key );
		// Emit a custom event for the released key
		this.emit( 'keyRelease', null, { event, key } );
		// Stop repeat actions for this key
		//clearTimeout( this.repeatTimers[key] );
		//delete this.repeatTimers[key];
	}

	//-------------------------
	// Ticker Loop Method(s)
	//-------------------------
	// Listens for a repeat action for a key.
	// * elapsedTime	- how much time has passed since the ticker started.
	// * tickDelay		- how much time between each tick (ie. 60ms)
	// * tickCount		- how many tick have occurred
	// RETURNS: [void].
	update( { elapsedTime, tickDelay, tickCount } ) {
		this.activeKeys.forEach(
			( pressStartTime, key ) => {
				this.emit( 'keyRepeat', null, { event, key } );
			});
		/*const repeat =
			() => {
				if ( this.activeKeys.has(key) ) {
					// Emit a custom event for the repeated key
					this.emit( 'keyRepeated', null, { key } );
					this.repeatTimers[key] = setTimeout( repeat, this.repeatInterval );
				}
			};
		this.repeatTimers[key] = setTimeout( repeat, this.repeatDelay );*/
	}
}
