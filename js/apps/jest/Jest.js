console.log( 'jestAlert: js/apps/jest/components/Jest.js loaded' );

//-------------------------
// Jest Application
//-------------------------
class Jest extends Application {
	// Declare properties
	icon			= 'images/icons/jest_hat.png';	// application icon image URL [string] value
	name			= 'Jest';				// name of application
	version			= '0.0';				// application version
	// File Handling [objects]
	config			= null;					// [object] JestConfiguration for global property declarations.
	inspector		= null;					// [object] JestInspector for handling custom & some built-in debugging.
	transmitter		= null;					// Transmitter [object] for handling file transmissions (download, upload, etc.)
	parsers			= null;					// [object] Parsers available (e.g. 'level').
	gallery			= null;					// Create the image gallery [object].
	// Game [objects]
	timeout			= null;					// 16ms delay for ~60 FPS (1000ms / 60 ≈ 16ms).
	io				= null;					// JestInputOutput [object] for interaction

	// Creates the application.
	// RETURNS: [bool] `true` on success, else `false`.
	// * options	- [object] Configuration options for the application.
	constructor() {
		super();		// call the parent application constructor
	}

	// Setup the application.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async setup() {
		super.setup(); // call parent setup method
		return true;
	}

	// Launch the application
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async launch() {
		// call parent launch method
		if ( !super.launch() ) return false;; // failed
		// --------------------------------
		// Create Application Window [object]
		// --------------------------------
		// Initialize modal-specific components
		const title		= this.name+' '+this.version+' Window';
		const windowObj	= this.addWindow( title, { classes: 'jest-application-jest' } );
		if ( windowObj===null ) return false;
		// --------------------------------
		// Setup Application Window
		// --------------------------------
		console.log( 'jestAlert: Application `'+this.name+'` launch() opening application window ...' );
		let open		= this.setupWindow( windowObj );
		if ( open!==true ) {
			throw new Error( 'jestAlert: Jest failed to open window!' );
			return false; // fail
		}
		// --------------------------------
		// Open the window
		// --------------------------------
		windowObj.open(); // open the window
		// App open, idle window
		this.gearshift( 'idle' ); // idle window
		// --------------------------------
		// Begin Building Application [object]
		// --------------------------------
		//try { await this.build(); }
		//catch ( err ) { throw new Error(`${this.name} v. ${this.version} build failed: ${err}`); }
		await this.build();
		return true; // success
	}

	// Open the window [object]
	// RETURNS: [bool] `true` on success else `false`
	setupWindow( windowObj ) {
		// Require windowObj to be part of application windows
		if ( !this.windows.includes(windowObj) )
			return false; // "window" not part of application
		// --------------------------------
		// Setup main window
		// --------------------------------
		// Configure the window panel(s)
		windowObj.addElements(
			[
				// Build the header
				{
					name:		'header',
					id:			'jest-window-header',
					classes:	[ 'jest-window-header', 'jest-style-harlequin', 'jest-freezeframe' ],
					elements:	JestEnvironment.librarian.libs.HarlequinWindow.windowHeaderConfig( this.icon, this.name+' '+this.version )
				},
				// Build the body
				{
					name:		'viewport',
					id:			'jest-window-body',
					classes:	[ 'jest-window-body', 'jest-style-harlequin' ],
					//elements:	this.getBuildBodyElements()
				},
				// Build the footer
				{
					name:		'footer',
					id:			'jest-window-footer',
					classes:	[ 'jest-window-footer', 'jest-style-harlequin' ],
					//elements:	this.getBuildFooterElements()
				}
			]);
		return true; // success
	}

	// Build the gameboard, player, components, etc.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async build() {
		// --------------------------------
		// Attempt to Build
		// --------------------------------
		// Determine logic based upon requested status change
		const currentMode	= this.getMode( 'status' );
		if ( currentMode!=='idle' )
			return false; // no need to rebuild
		//super.setup(); // call parent setup method
		// App open, set building status
		this.gearshift( 'building' );
		// Instantiate some variables
		this.parsers		= {};						// Being the blank parsers [object] for storing parser [objects]
		// --------------------------------
		// Configuration [object]
		// --------------------------------
		const config		= new JestConfiguration( this );
		this.config			= config;
		// --------------------------------
		// Inspector / Debugging [object]
		// --------------------------------
		const inspector		= new JestInspector( this );
		this.inspector			= inspector;
		// --------------------------------
		// Create Internal Timer [object]
		// --------------------------------
		// Central game timeout loop
		const timeout		= new Timeout();			// Intervals are 16.67ms delay for ~60 FPS (1000ms / 60 ≈ 16.67ms).
		this.timeout		= timeout;					// set cross-reference to [object] property
		timeout.start();								// start ticking
		//timeout.register( 'tick', 'game', this.update.bind(this,...args) );
		// --------------------------------
		// Create Input-Output Handler [object]
		// --------------------------------
		const io			= new JestInputOutput();	// input-output handling
		this.io				= io;						// set cross-reference to [object] property
		timeout.register( 'tick', 'input-output', e=>io.update(e) );
		// --------------------------------
		// File Handling [objects]
		// --------------------------------
		this.transmitter	= new JestTransmitter();
		// --------------------------------
		// Image Handling
		// --------------------------------
		this.gallery		= new JestGallery( this, `${this.config.webfiles}/images`, 'images/default-placeholder.png', 5 );
		// Register core folder(s)
		this.gallery.registerCategory( 'TILESET', 'tiles' );
		return true;
	}
}
