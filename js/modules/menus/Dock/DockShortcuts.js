console.log( 'jestAlert: js/modules/menu/DockShortcuts.js loaded' );

// DockShortcuts object class
class DockShortcuts extends OSElement {
	// Declare properties
	shortcuts		= [];			// [array] of DockShortcut [objects]

	// Creates a shortcuts container [object].
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
		this.classes.push( 'jest-dock-shortcuts' );
		return true;				// success
	}

	// Render the [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	render() {
		// --------------------------------
		// Create the DOM Element
		// --------------------------------
		super.render();				// call parent setup method
		return true;				// success
	}

	// Add dock shortcut [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * shortcut	- DockShortcut [object]
	addShortcut( shortcut ) {
		// Require [object] of type DockShortcut
		if ( shortcut instanceof DockShortcut ) {
			// Store cross-reference to shortcut
			this.shortcuts.push( shortcut );
			// Add shortcut to element
			this.el.appendChild( shortcut.el );
			return true; // success
		}
		return false; // fail
	}
}
