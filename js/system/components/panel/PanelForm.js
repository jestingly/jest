console.log( 'jestAlert: js/system/components/panel/PanelElement.js loaded' );

//-------------------------
// PanelForm Class
//-------------------------
// Provides a class for interpreting an element as a panel.
class PanelForm extends PanelElement {
	// Construct the form panel [object]
	constructor( options ) {
		options.tag     = 'form';
		super( options );
	}

	// Setup the panel form [object].
	// RETURNS: [boolean] true or false.
	setup() {
		super.setup();
		this.classes.push( 'jest-panel-element-form' );
		return true;
	}
}
