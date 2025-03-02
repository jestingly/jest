console.log( 'jestAlert: js/system/forms/FormBuilder.js loaded' );

//-------------------------
// PanelFormDropdown Class
//-------------------------
// Provides a modular and extensible way to create a form dropdown.
class PanelFormDropdown extends PanelElement {
	// Construct the form dropdown [object]
	constructor( options ) {
		options.tag    = 'select';
		super( options );
	}

	// Setup the panel form dropdown [object].
	// RETURNS: [boolean] true or false.
	setup() {
		super.setup();
		this.classes.push( 'jest-panel-element-form-dropdown' );
		// Validate and preprocess options
		if ( this._options.elements ) {
			this.elements = {};
			for ( let key in this._options.elements ) {
				const option		= this._options.elements[key];
				// Parse the option
				const optionParsed	=
					{
						...option,				// Merge additional properties,
						type:		'option',	// Enforce option type
						tag:		'option'	// Enforce tag
					};
				this._options.elements[key] = optionParsed; // set option as parsed
			}
		}
		return true;
	}
}
