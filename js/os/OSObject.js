console.log( 'jestAlert: js/os/OSObject.js loaded' );

// Jest object base class for registering an instance as a part of the Jest system.
class OSObject extends OSCallback {
	// Declare properties
	breadcrumbs 	= [];		// breadcrumb trail of [object] creation
	hooks			= null;		// class(es) attribute value of DOM element
	// Accessibility properties
	refs			= {};		// [object] of quick-reference(s) (by keyname)
	// Personal object properties
	skey			= null;		// [string] value of [object] unique system key

	// Creates the class [object] with configurable components.
	// RETURNS: [object] A new instance.
	// * options		- [object] Configuration options for the class [object].
	constructor( options={} ) {
		super( options );	// call OSUtility parent constructor
		this.systemize();	// systemize the [object]
		// Store the creator [object] reference of the panel [object]
        let breadcrumbs		= options.breadcrumbs || [];		// parent trail of [objects] creating `this`
		this.addBreadcrumbs( ...breadcrumbs, this );			// store quick-ref
		// Setup hooks
		this.hooks			= options.hooks || [];				// preprocessing hooks
	}

	// Setup the [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	setup() {
		//super.setup();		// call parent setup method
		return true;			// success
	}

	// Store the [object] in list of all objects by unique key
	systemize() {
		// Do not systemize environment
		if ( this instanceof JSOSEnvironment ) return;
		// Generate random key & store in system [objects]
        let key;
        do {
            key = jsos.rankey();		// Generate a random key
        } while ( JestEnvironment.skeys.hasOwnProperty(key) ); // Ensure the key is unique
        JestEnvironment.skeys[key] = this;		// Store the object in skeys
		this.skey	= key;						// Save system key [string] property
        return key; // Return the assigned key
    }

	// Insert environment HTML into the page
	// * ...args	- [array] of breadcrumb [objects]
	// RETURNS: [bool] `true` on success, else `false`.
	addBreadcrumbs( ...args ) {
		console.log( 'jestAlert: Adding breadcrumb trail ...' );
		// --------------------------------
		// Push argument(s)
		// --------------------------------
		for ( const arg of args ) {
			if ( typeof arg==='object' )
				this.breadcrumbs.push( arg );
		}
		return true; // success
	}

	// Attaches a hook for processing various milestones.
	// RETURNS: [void].
	// * hook - [function] The hook function to apply.
	addHook( hook ) {
		this.hooks.push( hook );
		hook( this );
	}

	// Apply hooks
	applyHooks() {
		this.hooks.forEach( hook=>hook(this) );
	}

	// Create a quick reference
	// RETURNS: [bool] `true` on success, else `false`.
	ref( key, val ) {
		// --------------------------------
		// Store item in reference(s)
		// --------------------------------
		// Determine the key
		let keyUnique	= key || jsos.rankey();
		while ( this.refs.hasOwnProperty(keyUnique) )
			keyUnique	= jsos.rankey(); // Regenerate until unique key is found
		// Add to the new object with the unique key
		this.refs[key]	= val; // Add to the new object with the same key
		return true;
	}

	// Registers this element with its parent hooks.
	// RETURNS: [void].
	// * parentPanel - [object] The parent Panel instance.
	/*registerWithParentHooks( parentPanel ) {
		if ( parentPanel?.hooks )
			parentPanel.hooks.forEach( hook=>hook(this) );
	}*/
}
