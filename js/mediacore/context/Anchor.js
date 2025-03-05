console.log( 'jestAlert: js/mediacore/context/Anchor.js loaded' );

//-------------------------
// Anchor
//-------------------------
// Calculates an [object] location through a stack of nested [objects].
class Anchor extends OSCallback {
	// Object properties
	canvas		= null;				// [object] ElementCanvas (for visual testing).
	_color		= null;				// [string] Hex value, stores debugging color view. Set using this.debugging().
	_alpha		= null;				// [int] Value, stores transparency as a value 0-100.
	// Declare properties
	_parent		= null;				// Parent Anchor [object].
	x			= null;				// [int] value of X coordinate of the [object] relative to parent.
	y			= null;				// [int] value of Y coordinate of the [object] relative to parent.
	z			= null;				// [int] value of Z coordinate of the [object] relative to parent.
	width		= null;				// [int] value of width of the [object] (minimum = 1).
	height		= null;				// [int] value of height of the [object] (minimum = 1).
	units		= null;				// [int] value of grid (x,y) & width/height should conform to (defaults to 1px).

	//-------------------------
	// Instantiation
	//-------------------------
	// Initializes the object.
	// * x			- [int] value of horizontal offset relative to parent(s)
	// * y			- [int] value of vertical offset relative to parent(s)
	// * z			- [int] value of z index relative to parent(s)
	//   width		- [int] value of custom width span of anchor
	//   height		- [int] value of custom height span of anchor
	//   units		- [int] Value of anchor grid size (defaults to 1px).
	constructor( x=0, y=0, z=0, width=1, height=1, units=1 ) {
		super();								// Call parent constructor
		this.move( x, y, z );					// Move the anchor point coordinates
		this.graticulate( units );				// Set the units the anchor is measured in
		this.resize( width, height );			// Set the anchor point WxH span
		this.show( null );						// By default, anchors are hidden
	}

	//-------------------------
	// Debugging
	//-------------------------
	// Create a visual color/alpha to display anchor rectangle in the 'inspector' mode.
	// RETURNS: [void].
	// color		- [string] Hex color (e.g. '#000') to enable debugging square, or [null] to turn off.
	// alpha		- [int] Value of opacity 0-100 (defaults to 80%).
	show( color=null, alpha=80 ) {
		// Validate the hex code
		if ( /^#([0-9A-Fa-f]{3}){1,2}$/.test(color) || color===null )
			this._color	= color;	// store debuggin color
		else {
			console.warn( `Invalid argument for color given. Debugging visual for anchor is turned off.` );
			this._color	= null;		// turn off
		}
		// Set the alpha/opacity
		this._alpha	= jsos.prove(alpha,'int') ? Math.max(0,Math.min(100,alpha)) : 80;
	}

	//-------------------------
	// Public Methods
	//-------------------------
	// Sets the parent through which the points are relative.
	// RETURNS: [void].
	// * anchor		- [object] Anchor serving as the baseline nested [object] (for relative x & y).
	setParent( anchor ) {
		if ( !(anchor instanceof Anchor) ) {
			console.warn( `Parent of anchor must be of type [object] Anchor.` );
			return;
		}
		// Set parent
        this._parent = anchor;
	}

	//-------------------------
	// Movement Handling
	//-------------------------
	// Move the anchor point [object].
	// RETURNS: [void].
	// * x			- [int] value of horizontal offset relative to parent(s)
	// * y			- [int] value of vertical offset relative to parent(s)
	// * z			- [int] value of z index relative to parent(s)
	move( x, y, z=null ) {
		this.x			= x;					// [int] Horizontal offset relative to parent(s)
		this.y			= y;					// [int] Vertical offset relative to parent(s)
		this.z			= z ?? this.z;			// [int] Z index offset relative to parent(s)
	}

	// Raise or lower the z-value of the [object].
	// RETURNS: [void].
	// * z			- [int] value of z index relative to parent(s)
	setZ( z ) {
		this.z			= this.z;				// [int] Z index offset relative to parent(s)
	}

	//-------------------------
	// Definition Methods
	//-------------------------
	// Define the grid size.
	// RETURNS: [bool] `true` on success, else `false`.
	//   size		- [int] Value of grid the anchor is locked to.
	graticulate( size=1 ) {
		// Validate argument(s)
		if ( !jsos.prove(size,'int') || size<1 ) {
			console.warn( `Attempted to set forbidden grid size, resorting to default.` );
			size	= 1;		// default grid width/height
		}
		// Continue to setup the grid
		this.units	= size;		// set grid square of level
		return true;			// success
	}

	//-------------------------
	// Get Position
	//-------------------------
	get globalX() {
        return this._parent ? this.x + this._parent.globalX : this.x;
	}

    get globalY() {
        return this._parent ? this.y + this._parent.globalY : this.y;
    }

	get globalZ() {
		return this._parent ? this.z + this._parent.globalZ : this.z;
    }

	//-------------------------
	// Dimension Handling
	//-------------------------
	// Set width / height
	set width( value ) { this.width = value; }
	set height( value ) { this.height = value; }
	// Get width / height
	get width() { return this.width; }
	get height() { return this.height; }

	// Resize the anchor point [object].
	// RETURNS: [void].
	// * width		- [int] value of custom width span of anchor
	// * height		- [int] value of custom height span of anchor
	resize( width, height ) {
		// Validate argument(s)
		if ( !jsos.prove(width,'int') || width<1 ||
			 !jsos.prove(height,'int') || height<1 )
			console.warn( `Attempted to set forbidden grid size, resorting to default.` );
		this.width		= width;				// [int] value of anchor width
		this.height		= height;				// [int] value of anchor height
		// Emit resize event
		this.emit( 'resize', null, width, height );
	}
}
