console.log( 'jestAlert: js/mediacore/animation/AnimationAnimator.js loaded' );

//-------------------------
// AnimationAnimator Class
//-------------------------
// Manages a stack of animations for sequential updates.
class AnimationAnimator {
	// Declare properties
	canvas			= null;				// ElementCanvas [object] (for CanvasRenderingContext2D [object] drawing)
	animations		= new Set();		// [object] Set of animations to manage & update sequentially.

	// Initializes the Sequencer.
	// RETURNS: [void].
	constructor() { }

	//-------------------------
	// Canvas Management
	//-------------------------
	// Sets the canvas element
	// RETURNS: [void].
	// * canvas		- [object] Canvas element to set
	setCanvas( canvas ) {
		if ( !(canvas instanceof HTMLCanvasElement) )
			throw new Error( 'Invalid canvas element' );
		this.canvas = canvas;
	}

	//-------------------------
	// Animation Management
	//-------------------------
	// Adds an animation to the stack of animations.
	// * animation		- [object] Animation instance to add.
	// RETURNS: [void].
	add( animation ) {
		this.animations.add( animation );
	}

	// Removes an animation from the stack of animations.
	// * animation		- [object] Animation instance to remove.
	// RETURNS: [void].
	remove( animation ) {
		this.animations.delete( animation ); // Remove animation
	}

	//-------------------------
	// Rendering Methods
	//-------------------------
	// Updates all animations in the stack of animations.
	// * elapsedTime	- how much time has passed since the ticker started.
	// * tickDelay		- how much time between each tick (ie. 60ms)
	// * tickCount		- how many ticks have occurred
	// RETURNS: [void].
	update( { elapsedTime, tickDelay, tickCount } ) {
		// Iterate each animation & update it
		this.animations.forEach(
			animation => {
				for ( const name in animation.views ) {
					// Access view & update it
					const view		= animation.views[name];
					if ( typeof view.update==='function' )
						view.update( tickDelay );
					else console.warn( 'Animation view missing update method' );
				}
			});
		// Call central draw method
		this.draw(); // draw animation(s) sprite(s)
	}

	// Draws all animation(s).
	// RETURNS: [void].
	draw() {
		// Determine if canvas is set
		if ( !this.canvas || !this.canvas.el ) {
			console.warn( 'Canvas is not set or invalid' );
			return;
		}
		// Access context & clear the board
		const ctx = this.canvas.el.getContext( '2d' );
		// Iterate each animation & draw onto the canvas
		this.animations.forEach(
			animation => {
				for ( const name in animation.views ) {
					// Access current frame view
					const view		= animation.views[name];
					if ( !view.frame || !view.active ) return;
					// Access active layer
					const layer		= view.frame.layers[view.state] ?? null;
					if ( !layer ) return;
					// Render sprite(s)
					layer.sprites.forEach(
						sprite => {
							try {
								// Attempt to get image
								const image		= view.getAttribute( sprite.group );
								// Render each sprite (if image available)
								if ( image===null || image.getMode('source')!=='loaded' ) return;
								// Calculate final values (using overrides if necessary)
								const sx		= sprite.sx;
								const sy		= sprite.sy;
								const width		= sprite.width;
								const height	= sprite.height;
								// Get x & y positions
								const x			= Math.round( view.globalX + sprite.globalX );
								const y			= Math.round( view.globalY + sprite.globalY );
								//console.log( image.el );
								//console.log( sx, sy, width, height,	x, y, width, height	)
								// Draw the sprite on the canvas
								ctx.drawImage(
									image.el,
									sx, sy, width, height,		// Source crop
									x, y, width, height			// Destination
									);
							}
							catch ( error ) {
								console.error( "An error occurred:", error.message );
							}
						});
				}
			});
	}
}
