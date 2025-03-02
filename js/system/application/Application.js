console.log( 'jestAlert: js/system/application/Application.js loaded' );

//-------------------------
// Application Class
//-------------------------
class Application extends OSObject {
	// Declare properties
	icon				= 'images/icons/med_book1.png'; // application icon image URL [string] value
	name				= 'Application';		// application name [string] value
	version				= '0.0';				// application version [string] value
	windows				= [];					// window(s) [object] reference(s)
	// Key [objects]
	shortcut			= null;					// DockShortcut [object]

	// Creates an application.
	// * options	- [object] Configuration options for the application.
	constructor( options={} ) {
		super( options ); // call OSMachine parent constructor
		// Set status to closed
		this.setMode( 'status', 'closed' );
		// Process options
		this.name		= options.name || this.name;
		this.version	= options.version || this.version;
		console.log( 'Constructing '+this.name+' application ...' );
	}

	// Setup the application [object]
	// RETURNS: [boolean] `true` on success else `false` on fail.
	setup() {
		// Call parent setup method
		return super.setup();
	}

	// Method to launch the application
	// RETURNS: [boolean] `true` on success else `false` on fail.
	launch() {
		return this.gearshift( 'launching' ); // attempt to launch
	}

	// Change the status of the application
	// RETURNS: [boolean] `true` on success else `false` on fail.
	gearshift( status ) {
		// Determine logic based upon requested status change
		const currentMode = this.getMode( 'status' );
		switch ( status ) {
			case 'launching':
				// Ensure application isn't running
				if ( currentMode==='closed' ) {
					// Set status to launching
					this.setMode( 'status', 'launching' );
					// Show the loading in the dock tray shortcut
					this.shortcut.el.classList.add( 'loading' );
					return true;	// success
				}
				break;
			case 'idle':
				// Ensure application is already launching
				if ( currentMode==='launching' ) {
					// Set status to idle
					this.setMode( 'status', 'idle' );
					// Idle the dock tray shortcut
					this.shortcut.el.classList.remove( 'loading' );
					return true;	// success
				}
				break;
			case 'close': break;
		}
		return false; // fail
	}

	// Add a window to application.
	// RETURNS: window [object] else [null] on fail.
	// * title		- [string] value of the window title.
	// * config		- [object] to configure the window with.
	addWindow( title='Application Window', config ) {
		// Initialize modal-specific components
		const windowObj	= new Window( { title: title, breadcrumbs: [this], ...config } );
		this.windows.push( windowObj );		// store window reference inside the application
		return windowObj;					// success
	}

	// Open the a window [object]
	// RETURNS: [bool] `true` on success else `false`
	openWindow( windowObj ) {
		// Require windowObj to be part of application windows
		if ( !this.windows.includes(windowObj) )
			return false; // "window" not part of application
		// --------------------------------
		// Open the window
		// --------------------------------
		windowObj.open(); // open the window
		return true; // success
	}

	// Create a dock shortcut [object]
	// RETURNS: [bool] `true` on success else `false`
	dockShortcut() {
		// Require this element to be created
		//if ( this.el===null ) return false;
		// --------------------------------
		// Create Panel [object]
		// --------------------------------
		const shortcut	= new DockShortcut( this );
		this.shortcut	= shortcut; // keep [object] reference
		// Append to DOM & return
		JestEnvironment.dock.shortcuts.addShortcut( shortcut );
	}
}
