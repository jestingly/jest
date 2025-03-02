console.log( 'jestAlert: js/modules/menu/Dock.js loaded' );

// Dock object class
class Dock extends OSElement {
	// Declare properties
	logo			= null;			// Corner logo
	loadbar			= null;			// Loadbar [object]
	shortcuts		= null;			// DockShortcuts [object]

	// Creates a progress loadbar [object].
	// RETURNS: [object] A new instance.
	// * options		- [object] Configuration options for the class [object].
	constructor( options={} ) {
		// Call the parent constructor
		super( options );
		// Setup the loadbar before creating the element
        this.setup();				// setup the loadbar
		this.render();				// render the loadbar
	}

	// Setup the loadbar [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	setup() {
		super.setup();				// call parent setup method
		// Ensure class(es) include loadbar class(es)
		this.classes.push( 'jest-dock' );
		return true;				// success
	}

	// Render the [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	render() {
		// --------------------------------
		// Create the DOM Element
		// --------------------------------
		super.render();					// call parent setup method
		// --------------------------------
		// Add shortcuts to dock
		// --------------------------------
		const shortcuts	= new DockShortcuts();
		this.el.appendChild( shortcuts.el );
		this.shortcuts	= shortcuts;	// cross-reference
		// --------------------------------
		// Add loadbar to dock
		// --------------------------------
		const loadbar	= new Loadbar();
		this.el.appendChild( loadbar.el );
		this.loadbar	= loadbar;		// cross-reference
		return true;					// success
	}
}
