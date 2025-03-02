console.log( 'jestAlert: js/system/interface/JSOS/JSOSEnvironment.js loaded' );

// Jest OS class
class JSOSEnvironment extends OSElement {
	// Declare properties
	apps			= {};				// open application [objects]
	dock			= null;				// main control dock for OS
	librarian		= null;				// OSLibrarian [object] for handling libraries
	skeys			= {};				// [object] of system keys (and what they refer to)

	// Creates the class [object] with configurable components.
	// RETURNS: [object] A new instance.
	// * options		- [object] Configuration options for the class [object].
	constructor( options={} ) {
		super( options );	// call parent constructor
		// --------------------------------
		// Setup & Render Environment
		// --------------------------------
		// Setup the [object]
        this.setup();		// setup the enviroment
		this.render();		// render the enviroment
	}

	// Load mixin data into class prototype.
	// * targetClass	- [string] value of class prototype to implement mixins into.
	// * names			- [array] of mixin names to implement.
	// RETURNS: [bool] `true` on success, else `false`.
	static implement( targetClass, names ) {
		names.forEach(
			name => {
				if ( Mixins[name] ) {
					Object.assign( targetClass.prototype, JestMixins[name] );
				}
				else {
					throw new Error( `Mixin ${name} not found` );
				}
			});
    }

	// Setup the window [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	setup() {
		super.setup();		// call parent setup method
		// Add base window class(es)
		this.id		= 'jest-environment';
		this.classes.push( 'jest-os' );
		return true;		// success
	}

	// Insert environment HTML into the page
	generateEnvironment() {
		console.log( 'jestAlert: Generating environment ...' );
		// --------------------------------
		// Clear environment
		// --------------------------------
		// Remove jest environment if open
		//this.removeEnvironment();
		// --------------------------------
		// Create environment
		// --------------------------------
		// Insert the environment into the DOM
		document.body.appendChild( this.el );
		// --------------------------------
		// Setup the enviroment
		// --------------------------------
		// Setup the environment HTML block
		this.setupEnvironment();
	}

	// Open an application
	// * name	- [string] value of application name
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async execute( name='' ) {
		// --------------------------------
		// Load Application [object]
		// --------------------------------
		// Build class name
		const className		= 'App'+name;
		console.log( `jestAlert: Opening application "${className}" ...` );
		// Check that class is available
		const AppClass		= JestAppsRegistry[className];
		if ( !AppClass )
			throw new Error( `Application "${className}" not found.` );
		// Create class instance of application [object]
		const app			= new AppClass();			// Create the application [object]
		this.apps[name]		= app;						// Save the application in open apps
		// --------------------------------
		// Add Application Dock Shortcut
		// --------------------------------
		console.log( 'jestAlert: Application `'+this.name+'` calling dock shortcut ...' );
		app.dockShortcut();
		return true; // success
	}

	// Setup the environment on the page
	setupEnvironment() {
		console.log( 'jestAlert: Setting up the environment ...' );
		// Ensure previous environment exists
		if ( this.el ) {
			// --------------------------------
			// Create Core [objects]
			// --------------------------------
			const librarian		= new OSLibrarian();
			this.librarian		= librarian;
			// --------------------------------
			// Add status dock menu to the environment
			// --------------------------------
			const dock			= new Dock( { id: 'jest-dock' } );
			this.dock			= dock; // quick-reference
			this.el.appendChild( this.dock.el );
			// --------------------------------
			// Add notification center to the environment
			// --------------------------------
			const notificationCenterBar = jsos.generateElement( 'div', 'jest-notification-container' );
			this.el.appendChild( notificationCenterBar );
			console.log( 'jestAlert: Setup environment.' );
		}
	}

	// Remove environment HTML from the page
	removeEnvironment() {
		console.log( 'jestAlert: Removing existing environment ...' );
		// Ensure previous environment exists
		if ( this.el ) {
			this.el.remove();
			console.log( 'jestAlert: Existing environment removed.' );
		}
	}

	// Get current environment from the page
	getEnvironment() {
		// Ensure previous environment exists
		return this.el ? this.el : null;
	}
}
