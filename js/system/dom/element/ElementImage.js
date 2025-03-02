console.log( 'jestAlert: js/dom/element/ElementImage.js loaded' );

// ElementImage class
class ElementImage extends OSElement {
	// Attribute properties
	url				= null;			// [string] value of src URL

	//-------------------------
	// Setup [Object]
	//-------------------------
	// Creates the class [object] with configurable components.
	// RETURNS: [object] A new instance.
	// * options		- [object] Configuration options for the class [object].
	constructor( options={} ) {
		// Parse some data
		options.tag		= 'img';
		super( options );	// call OSObject parent constructor
		this.setMode( 'source', 'empty' ); // set status
		// Setup the [object] before creating the element
		this.setup();		// setup the [object]
		this.render();		// render the [object]
		// Call load complete if source preloaded
		if ( this.isReady() ) this.onLoad();
	}

	// Setup the [object].
	// RETURNS: [boolean] true or false.
	setup() {
		super.setup();		// call parent setup method
		// Ensure class(es) include element base class(es)
		this.classes.push( 'jest-image' );
		return true;		// success
	}

	// Render the [object].
	// RETURNS: [boolean] true or false.
	render() {
		// Remove 'src' attribute if supplied
		let url	= null;
		if ( this.attributes.src ) {
			url	= this.attributes.src;		// save source
			delete this.attributes.src;		// delete attribute src
		}
		super.render();			// call parent render method
		// Apply an onload listener
		this.register( 'load', 'status', e=>this.onLoad(e), 'dom' );
		// Set source if exists
		if ( url!==null )
			this.setSrc( url );	// set source supplied
		return true;			// success
	}

	//-------------------------
	// Setting Source
	//-------------------------
	// Set the element src attribute.
	// RETURNS: [boolean] true or false.
	// * url		- [string] value of attribute source URL.
	setSrc( url ) {
		// Change status to unloaded & parse URL
		this.setMode( 'source', 'unloaded' );			// set status
		this.url	= chrome.runtime.getURL( url );		// update URL
		// Apply the src URL
		this.el.setAttribute( 'src', this.url );
		return true;
	}

	// Determine if media is ready
	// RETURNS: [boolean] true or false.
	isReady() {
		// Determine if media is ready
		const status	= this.getMode( 'source' )
		// Check if image is complete & width is not 0
		const ready		= this.el.complete && this.el.naturalWidth>0;
		if ( ready && status!=='loaded' )
			this.setMode( 'source', 'loaded' );
		return ready; // return ready state
	}

	//-------------------------
	// Event Listener(s)
	//-------------------------
	// onLoad event handler callback for attribute src
	// RETURNS: [void].
	onLoad() {
		this.setMode( 'source', 'loaded' );		// src loaded
		this.emit( 'loaded' );					// emit src load event
	}
}
