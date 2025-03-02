console.log( 'jestAlert: js/system/components/hooks/HooksManager.js loaded' );

//-------------------------
// HooksManager Class
//-------------------------
// Provides a class for handling hooks with callback execution.
class HooksManager {
	// Declare properties
	hooks		= null;				// Component-level hooks: { eventName: [hook1, hook2, ...] }

	// Creates an application.
	constructor() {
		this.hooks = {}; // Global registry of hooks: { eventName: [hook1, hook2, ...] }
	}

	// Registers a global hook for a specific event.
	// RETURNS: [void].
	// * event - [string] The event name.
	// * hook  - [function] The hook function.
	registerHook( event, hook ) {
		if ( !this.hooks[event] ) {
			this.hooks[event] = [];
		}
		this.hooks[event].push( hook );
		console.log( `Hook registered for event: ${event}` );
	}

	// Executes all hooks for a specific event.
	// RETURNS: [void].
	// * event  - [string] The event name.
	// * context - [object] The context to pass to each hook.
	executeHooks( event, context ) {
		if ( this.hooks[event] ) {
			this.hooks[event].forEach( hook=>hook(context) );
		}
	}

	// Deregisters a specific hook for an event.
	// RETURNS: [void].
	// * event - [string] The event name.
	// * hook  - [function] The hook function to remove.
	deregisterHook( event, hook ) {
		if ( this.hooks[event] ) {
			this.hooks[event] = this.hooks[event].filter( h =>h!==hook);
			console.log( `Hook deregistered for event: ${event}` );
		}
	}
}

// Create a global hooks manager
const hooksManager = new HooksManager();
