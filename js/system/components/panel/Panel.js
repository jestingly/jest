console.log( 'jestAlert: js/system/components/panel/Panel.js loaded' );
//-------------------------
// Panel Class
//-------------------------
// Provides a class for creating a panel [object].
class Panel extends OSElement {
	// Same constructor argument(s)
	name			= null;			// [string] value of panel name (used for sorting)
	type			= null;			// Type of panel (form, etc.)
	callback		= null;			// function to call when [obect] is created

	// Construct panel [object]
	constructor( options ) {
		super( options ); // parent construct
		// Handle option argument(s)
		this.name			= options.name || null;				// [string] name of object
		this.type			= options.type || 'unspecified';	// [string] value of type of panel
		// Setup the panel before creating the element
        this.setup();		// setup the panel
		this.render();		// render the panel
	}

	// Setup the panel [object].
	// RETURNS: [boolean] true or false.
	setup() {
		super.setup(); // call parent setup method
		// Ensure class(es) include panel base class(es)
		this.classes.push( 'jest-panel' );
		return true; // success
	}

	// Render the panel [object].
	// RETURNS: [boolean] true or false.
	render() {
		super.render(); // call parent render method
		// --------------------------------
		// Render the children
		// --------------------------------
		this.addElements( this._options.elements );				// Generate the panel elements
	}

	// Dynamically updates the panel content.
	// RETURNS: [void].
	// * elements	- [array] New content definitions for the panel.
	addElements( elements ) {
		// Require element data
		if ( !elements ) return;
		// Create panel element [objects]
		for ( const data of elements ) {
			// Ensure panel element [object] contains breadcrumbs
			data.breadcrumbs	= this.breadcrumbs;
			// Create the custom PanelElement [object]
			const element		= this.createChild( data );
		}
	}

	// Dynamically create a child panel element [object].
	// RETURNS: PanelElement [object]
	// * data	- [object] of content definition for the element.
	createChild( data ) {
		// Require this element to be created
		if ( this.el===null ) return false;
		// --------------------------------
		// Create PanelElement [object]
		// --------------------------------
		let element = null; // define element
		switch ( data.type ) {
			case 'form':
				element		= new PanelForm( data );
				break;
			case 'button':
				element		= new PanelFormButton( data );
				break;
			case 'dropdown':
				element		= new PanelFormDropdown( data );
				break;
			default:
				element		= new PanelElement( data );
				break;
		}
		// Append to DOM & return
		this.el.appendChild( element.el );
		// Store quick-ref
		const key	= data.name ? data.name : null;
		this.ref( key, element );
		// Return DOM element [object]
		return element;
	}
}
