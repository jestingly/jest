console.log( 'jestAlert: js/system/components/hooks/Hook.js loaded' );

//-------------------------
// Hooks Class
//-------------------------
// Provides a class for handling a hook with callback execution.
class Hooks {
	// Declare properties
	hooks		= null;				// Component-level hooks: { eventName: [hook1, hook2, ...] }

	// Creates an application.
	constructor() {
		this.hooks = {};	// set hooks as empty [object]
	}

	// Registers a hook at the component level.
	// RETURNS: [void].
	// * event - [string] The event name.
	// * hook  - [function] The hook function.
	register( event, hook ) {
		if ( !this.hooks[event] )
			this.hooks[event] = [];
		this.hooks[event].push( hook );
	}

	// Executes all hooks for a specific event at the component level.
	// RETURNS: [void].
	// * event  - [string] The event name.
	// * context - [object] The context to pass to each hook.
	execute( event, context ) {
		if ( this.hooks[event] )
			this.hooks[event].forEach( hook=>hook(context) );
		// Execute global hooks from HooksManager
		hooksManager.executeHooks( event, context );
	}

	// Deregisters a specific hook at the component level.
	// RETURNS: [void].
	// * event - [string] The event name.
	// * hook  - [function] The hook function to remove.
	deregister( event, hook ) {
		if ( this.hooks[event] )
			this.hooks[event] = this.hooks[event].filter( h=>h!==hook );
	}
}
