console.log( 'jestAlert: js/os/OSElement.js loaded' );

// Jest HTML DOM Element class
class OSElement extends OSEventTarget {
	// Element properties
	el				= null;		// DOM element [object]
	tag				= null;		// DOM element type [string]
	id				= null;		// id [string] attribute value of DOM element
	classes			= null;		// class(es) [stray] attribute value of DOM element
	attributes		= null;		// [object] of attributes
	text			= null;		// [string] value of inner text
	objectURL		= null;		// [string] value of objectURL for preloaded data.

	// Creates the class [object] with configurable components.
	// RETURNS: [object] A new instance.
	// * options		- [object] Configuration options for the class [object].
	constructor( options={} ) {
		super( options ); // call parent constructor
		this.tag			= options.tag || 'div';			// [string] value of HTML markup tag
		// Setup element properties
		this.id				= options.id || null;			// HTML id [string] value
		this.classes		= options.classes || [];		// HTML class(es) [stray] value(s)
		let	classesDataType	= jsos.datatype( this.classes );
		if ( classesDataType!=='array' )
			this.classes	= classesDataType==='string' ? [this.classes] : [];
		this.attributes		= options.attributes || {};
		this.text			= options.text || '';
		this.objectURL		= options.objectURL || null;
	}

	// Setup the DOM element [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	setup() {
		return super.setup();	// call parent setup method
	}

	// Render the panel [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	render() {
		// --------------------------------
		// Create the DOM Element
		// --------------------------------
		this.createElement();				// Create the DOM element [object]
		this.applyHooks();					// apply custom callable hooks
		this._attachEventListeners();		// apply callback listeners
		return true;						// sucess
	}

	// Creates the DOM element for the panel.
	// RETURNS: [object] The created DOM element.
	createElement() {
		// Create the DOM element for the panel
		const el			= jsos.generateElement( this.tag, this.id, this.classes, this.text, this.objectURL );
		this.el				= el;			// cross-reference to DOM element
		// Inject inner text content
		this.el.innerHTML	= this.text;	// Clear existing content
		// Add attributes
		Object.keys(this.attributes).forEach(
			(attr) => {
				this.el.setAttribute( attr, this.attributes[attr] );
			});
	}
}
