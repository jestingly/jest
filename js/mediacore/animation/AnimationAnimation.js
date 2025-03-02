console.log( 'jestAlert: js/mediacore/animation/AnimationAnimation.js loaded' );

//-------------------------
// AnimationAnimation Class
//-------------------------
class AnimationAnimation extends AnimationObject {
	// Identification properties.
	name			= 'ani';			// [string] Value of animation name
	// Animation progress and state.
	duration		= 1000;				// [int] Duration in ms calculated in frame(s)
	// Frames & attributes.
	views			= {};				// [array] List of views to handle individual configurations (branch renders).
	frames			= [];				// [array] of frames with offsets
	// Store some setup / parsed info.
	options			= null;				// [object] Options set during parsing.
	groups			= null;				// [object] Set of parsed sprite group name(s).

	//-------------------------
	// Instantiation
	//-------------------------
	// Construct the [object].
	// * name		- [string] Name of the animation.
	constructor( name ) {
		super();						// Call parent constructor
		this.name	= name;				// Assign the animation name
	}

	//-------------------------
	// View Management
	//-------------------------
	// Adds an animation view configuration to the pile.
	// RETURNS: [object] AnimationView on success else [null] on fail.
	// * name		- [string] Value of view name (e.g. 'player').
	addView( name ) {
		// Validate arguments
		if ( !jsos.argue('name',name,'string') ) return null;
		// Remove view if it exists
		if ( this.views?.[name] ) {
			console.warn( `Animation already contains a view named "${name}"! Remove existing view first, or try a different name.` );
			return null;
		}
		// Create an animation configuration [object]
		const view	= new AnimationView( this, name );
		// Process options
		if ( this.options['LOOP']===true )
			view.loopOn();
		// Set group attributes
		view.setAttribute( 'groups', Array.from(this.groups) );
		this.views[name] = view;	// Add to pile
		return view;				// Return view [object]
	}

	// Removes an animation configuration (e.g. "AnimationView") from the pile.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * name		- [string] Value of view name (e.g. 'player').
	removeView( name ) {
		// Remove view if it exists
		if ( this.views?.[name] )
			delete this.views[name]; // Remove view
		return true;
	}

	//-------------------------
	// Frame Handling
	//-------------------------
	// Adds a frame to the animation.
	// RETURNS: [void].
	// * frame	- [object] Frame to add to animation (containing layers with sprites)
	addFrame( frame ) {
		if ( !(frame instanceof AnimationFrame) )
			throw new Error( 'Invalid frame object' );
		// Add frame to frame pile
		this.frames.push( frame );
		// Increase sprite duration to include frame duration
		this.recalculateDuration();		// Ensure duration stays consistent
	}

	// Remove a frame from the animation.
	// RETURNS: [void].
	// * index		- [int] value of index to remove
	removeFrame( index ) {
		if ( index>=0 && index<this.frames.length ) {
			this.frames.splice( index, 1 );
			this.recalculateDuration();	// Update duration after removal
		}
	}
	// Recalibrate the duration of the animation based upon frames
	// RETURNS: [void].
	recalculateDuration() {
		this.duration = this.frames.reduce( (sum,frame)=>sum+frame.duration, 0 );
	}
}
