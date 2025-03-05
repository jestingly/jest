console.log( 'jestAlert: js/mediacore/animation/AnimationView.js loaded' );

//-------------------------
// AnimationView Class
//-------------------------
// Animation configuration "view" [object] for calibrating dynamic variable(s).
class AnimationView extends AnimationObject {
	// Object reference(s).
	animation	= null;				// [object] Animation this View is configuring.
	// Identification properties.
	name		= null;				// [string] Value of animation view name.
	// General animation properties.
	active		= false;			// [bool] Whether the animation is currently active.
	playing		= false;			// [bool] Play state of the animation.
	// Animation progress and state.
	loop		= false;			// Whether the animation should loop.
	time		= 0;				// [int] Current time in the animation.
	progress	= 0;				// [float] Progress through the animation (0 to 1).
	_state		= 0;				// [int] Value of current animation state (determines active layer inside a frame).
	// Frames and attributes.
	frame		= null;				// [object] reference of current active frame.
	attributes	= {};				// [object] Attributes controlling animation.
	validTypes	= {};				// Define expected attribute types.

	//-------------------------
	// Instantiation
	//-------------------------
	// Construct the [object].
	// * animation	- [object] Animation instance to add.
	// * name		- [string] Name of the animation.
	//   x			- [int] value of horizontal offset relative to sprite
	//   y			- [int] value of vertical offset relative to sprite
	//   width		- [int] value of animation width
	//   height		- [int] value of animation height
	constructor( animation, name, x=0, y=0, width=null, height=null ) {
		super( x, y, 0, width, height );		// call parent constructor
		this.animation		= animation;		// store animation reference
		this.name			= name;				// Assign the view name
	}

	//-------------------------
	// State Changing
	//-------------------------
	// Set the current state.
	// * value	- [int] Value of state to set
	set state( value ) {
		// Validate that the input is a number and is an integer
		if ( typeof value!=="number" || !Number.isInteger(value) ) {
			console.warn( `Invalid state: ${value}. Defaulting to state 0.` );
			value	= 0;
		}
		// If valid, set the state
		if ( this._state!==value ) {
			this._state = value;
		}
	}

	// Getter for state
	// RETURNS: [int] value of this.state.
	get state() {
		return typeof this._state==="number" && Number.isInteger(this._state)
			? this._state
			: 0; // Default to 0 if _state is invalid
	}

	//-------------------------
	// Playback Control
	//-------------------------
	// Enable looping for the animation.
	// RETURNS: [void].
	loopOn() {
		this.loop		= true;
		//console.log( `Animation "${this.name}" set to loop.` );
		return this;
	}

	// Disable looping for the animation.
	// RETURNS: [void].
	loopOff() {
		this.loop		= false;
		//console.log( `Animation "${this.name}" set to stop looping.` );
		return this;
	}

	// Play the animation.
	// RETURNS: [this].
	play() {
		if ( this.playing ) {
			//console.warn( `Animation "${this.name}" is already playing.` );
			return this;
		}
		this.playing	= true;
		//console.log( `Animation "${this.name}" started.` );
		return this;
	}

	// Pause the animation.
	// RETURNS: [this].
	pause() {
		if ( !this.playing ) {
			//console.warn( `Animation "${this.name}" is already paused.` );
			return this;
		}
		this.playing = false;
		//console.log( `Animation "${this.name}" paused.` );
		return this;
	}

	// Toggle play/pause state.
	// RETURNS: [this].
	togglePlay() {
		this.playing ? this.pause() : this.play();
		return this;
	}

	// Enable the animation.
	// RETURNS: [this].
	enable() {
		this.active		= true;
		//console.log( `Animation "${this.name}" enabled.` );
		return this;
	}

	// Disable the animation.
	// RETURNS: [this].
	disable() {
		this.active		= false;
		//console.log( `Animation "${this.name}" disabled.` );
		return this;
	}

	// Reset the animation to the start.
	// RETURNS: [this].
	reset() {
		this.time			= 0;		// reset the playhead
		this.progress		= 0;		// reset playhead progress % tracking
		this._clocks.start	= null;		// reset the start time
		this.pause().disable();			// pause & disable the animation
		//console.log( `Animation "${this.name}" reset.` );
		return this;
	}

	//-------------------------
	// Rendering
	//-------------------------
	// Updates the animation's progress.
	// RETURNS: [void].
	// * tickDelay	- the FPS of the ticker (ie. 60 = 60ms/1000ms or 60fps)
	update( tickDelay ) {
		//-------------------------
		// Determine If Playable
		//-------------------------
		// Determine if animation is paused
		if ( !this.playing ) return;
		else if ( this._clocks.start===null )
			this._clock( 'start' ); // set the start time
		//-------------------------
		// Calculate Time
		//-------------------------
		// Increment the animation's elapsed time
		this.time += tickDelay;
		// Check if the animation has completed
		if ( this.time>=this.animation.duration ) {
			if ( this.loop ) {
				this.time	%= this.animation.duration; // Wrap around for looping animations
			}
			else this.complete();			// Animation complete
		}
		// Calculate progress as a percentage (if needed for sprites)
		const progress	= this.time / this.animation.duration;
		//-------------------------
		// Calculate Current Frame
		//-------------------------
		// Determine the current frame based on time
		let elapsed		= this.time;
		let index		= 0;
		for ( const frame of this.animation.frames ) {
			if ( elapsed<frame.duration ) {
				this.frame	= frame;
				break;
			}
			index++;
			elapsed -= frame.duration;		// Reduce elapsed time by the frame's duration
		}
	}

	// Complete the animation
	complete() {
		//-------------------------
		// Determine If Playing
		//-------------------------
		// Determine if animation is paused
		if ( !this.playing ) return;
		//-------------------------
		// Complete Animation
		//-------------------------
		this.time	 = this.animation.duration; // Cap time at the end
		this.pause();	      				// Pause the animation
		this.emit( 'complete' );			// Emit end of sequence callback(s)
	}
}
