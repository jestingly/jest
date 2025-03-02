console.log( 'jestAlert: js/system/components/panel/PanelElement.js loaded' );

//-------------------------
// PanelElement Class
//-------------------------
// Provides a class for interpreting an element as a panel.
class PanelElement extends Panel {
	// Define properties

	// Construct the panel element
	constructor( options ) {
		super( options );			// call OSObject constructor
	}

	// Setup the panel element [object].
	// RETURNS: [boolean] true or false.
	setup() {
		// Ensure class(es) include panel element base class(es)
		this.classes.push( 'jest-panel-element' );
		return true; // success
	}
}
