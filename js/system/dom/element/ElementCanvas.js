console.log( 'jestAlert: js/dom/element/ElementCanvas.js loaded' );

// ElementCanvas class
class ElementCanvas extends OSElement {
	// Attribute properties
	width			= 100;			// [int] value of canvas width
	height			= 100;			// [int] value of canvas height

	// Creates the class [object] with configurable components.
	// RETURNS: [object] A new instance.
	// * options		- [object] Configuration options for the class [object].
	constructor( options={} ) {
		// Parse some data
		options.tag		= 'canvas';
		super( options );	// call OSObject parent constructor
		// Handle default canvas size
		this.width		= options.width ? options.width : this.width;
		this.height		= options.height ? options.height : this.height;
		// Setup the [object] before creating the element
		this.setup();		// setup the [object]
		this.render();		// render the [object]
	}

	// Setup the [object].
	// RETURNS: [boolean] true or false.
	setup() {
		super.setup();		// call parent setup method
		// Ensure class(es) include element base class(es)
		this.classes.push( 'jest-canvas' );
		return true;		// success
	}

	// Render the [object].
	// RETURNS: [boolean] true or false.
	render() {
		super.render();		// call parent render method
		// --------------------------------
		// Default Orientation(s)
		// --------------------------------
		this.resize ( this.width, this.height );
		return true;		// success
	}

	// Resize the DOM canvas.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	resize( width=100, height=100 ) {
		// Validate argument(s)
		if ( !Number.isInteger(width) )
			width	= 100;
		if ( !Number.isInteger(height) )
			height	= 100;
		// Set width & height
		this.width		= Math.max( 0, width );		// save new width
		this.height		= Math.max( 0, height );	// save new height
		this.el.width	= width;					// update element width
		this.el.height	= height;					// update element height
		return true;		// success
	}
}
