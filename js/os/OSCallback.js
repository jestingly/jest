console.log( 'jestAlert: js/os/OSCallback.js loaded' );

// OSCallback class
class OSCallback extends OSConfigurable {
	// Element properties
	handlers		= {};			// [array] of event callback(s): [{ command, id, callback, type }]

	//-------------------------
	// Initialization
	//-------------------------
	// Initializes a new OSCallbacks instance.
	// RETURNS: [void] Nothing.
	// * options		- [object] Configuration options.
	//   callbacks		- [array] Array of callback definitions.
	constructor( options={} ) {
		super( options ); // call parent constructor
		// Store callbacks
		if ( options.callbacks )
			this._initializeCallbacks( options.callbacks );
	}

	//-------------------------
	// Private Methods
	//-------------------------
	// Initializes callbacks from options (if provided).
	// RETURNS: [void] Nothing.
	// * callbacks		- [array] Array of callback definitions.
	_initializeCallbacks( callbacks ) {
		callbacks.forEach(
			( { command, id, callback, type='manual', iterations=null, data={} } ) => {
				this.register( command, id, callback, type, iterations, data );
			}
		);
	}

	//-------------------------
	// Public Methods
	//-------------------------
	// Registers a callback under an event name.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * command		- [string] Name of the event to register under.
	//   id				- [string] Unique ID for the callback.
	//   callback		- [function] The callback function.
	//   type			- [string] Type of callback (default: 'manual').
	//   iterations		- [number|null] How many times the callback can be invoked (null = unlimited).
	//   data			- [object] Optional additional data about the callback.
	register( command, id, callback, type='manual', iterations=null, data={} ) {
		if ( !this.handlers[command] ) {
			this.handlers[command] = [];
		}
		// Prevent duplicate registrations for the same ID.
		if ( this.handlers[command].some( (handler)=>handler.id===id ) ) {
			console.warn( `Callback with ID "${id}" is already registered for event "${command}".` );
			return false;
		}
		this.handlers[command].push( { id, callback: callback.bind(this), type, iterations, iteration: 0, data } );
		return true;
	}

	// Emits all callbacks under an event name.
	// RETURNS: [void] Nothing.
	// * command		- [string] Name of the event to emit.
	//   limit    		- [int] Max number of callbacks to execute (null = all, default: all).
	//   args			- [any] Arguments to pass to the callbacks.
	emit( command, limit=null, ...args ) {
		const callbacks = this.handlers?.[command];
		if ( !callbacks || !Array.isArray(callbacks) ) {
			//console.warn( `No handlers found for event: ${command}` );
			return;
		}
		// Iterate through callbacks and use `trigger` to invoke them.
		let count = 0;
		for ( const handler of callbacks ) {
			if ( handler.type!=='manual' ) continue;	// do not emit non-manual callbacks
			if ( limit!==null && count>=limit ) break;	// stop if limit is reached.
			this._trigger( command, handler.id, ...args );
			count++;
		}
	}

	// Triggers a specific callback by ID under an event name.
	// RETURNS: [void] Nothing.
	// * command		- [string] Name of the event.
	//   id				- [string] ID of the callback to trigger.
	//   args			- [any] Arguments to pass to the callback.
	_trigger( command, id, ...args ) {
		const callbacks = this.handlers?.[command];
		if ( !callbacks ) {
			console.warn( `No handlers found for event: ${command}` );
			return;
		}
		const handler = callbacks.find( (handler)=>handler.id===id );
		if ( handler && typeof handler.callback==='function' ) {
			handler.callback( ...args );
			handler.iteration++;
			// Remove if it exceeds iterations.
			if ( handler.iterations!==null && handler.iteration>=handler.iterations ) {
				this.unregister( command, id );
			}
		}
		else {
			console.warn( `Handler with ID "${id}" not found for event "${command}".` );
		}
	}

	// Unregisters a callback by event name and ID.
	// RETURNS: [void] Nothing.
	// * command		- [string] Name of the event.
	//   id				- [string] ID of the callback to unregister.
	unregister( command, id ) {
		if ( this.handlers?.[command] ) {
			this.handlers[command] = this.handlers[command].filter( (handler)=>handler.id!==id );
			// Remove empty categories.
			if ( this.handlers[command].length===0 ) {
				delete this.handlers[command];
			}
		}
	}
}
