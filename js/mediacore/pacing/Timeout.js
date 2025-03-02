console.log( 'jestAlert: js/mediacore/pacing/Timeout.js loaded' );

//-------------------------
// Timeout Class
//-------------------------
// Drives the center clock loop and emits 'tick' events.
class Timeout extends OSCallback {
	// Declare properties
	delay			= null;						// [number] Time interval between ticks in milliseconds.
	running			= false;					// [bool] Indicates if the ticker is currently running.
	startTime		= performance.now();		// [number] Start time of ticker.
	ticksEmitted	= 0;						// [int] Accumulates ticks to maintain precise # of tick intervals.
	boundTick		= null;						// [function] Binds the tick method to preserve context.

	// Initializes the timeout.
	// * delay - [number] Time interval between ticks in milliseconds.
	constructor() {
		super();											// call parent constructor
		this.delay			= 1000 / 60;					// [number] Time interval for each tick.
		this.running		= false;						// [bool] Whether the ticker is active.
		this.boundTick		= this.tick.bind( this );		// Preserve context for the tick method.
	}

	// Main tick method called on each frame.
	// Calculates elapsed time, maintains consistent timing, and emits tick events.
	// RETURNS: [void].
	tick() {
		if ( !this.running ) return;
		// Calculate time elapsed.
		const now			= performance.now();			// Current time.
		const elapsedTime	= now - this.startTime;			// Time since ticker started.
		// Calculate how many ticks should have occurred since the start.
		const expectedTicks	= Math.floor( elapsedTime / this.delay );
		const missedTicks	= expectedTicks - this.ticksEmitted;
		// Emit ticks for all missed intervals.
		for ( let i=0; i<missedTicks; i++ ) {
			const tickDelay	= this.delay;					// Each tick is a fixed interval.
			// Pass the time data to listener(s).
			this.emit(
				'tick', null,
				{
					elapsedTime,
					tickDelay,
					tickCount: this.ticksEmitted + i + 1	// Adjust for missed ticks.
				});
		}
		this.ticksEmitted = expectedTicks;					// Update ticksEmitted count
		// Reset periodically to avoid infinite growth
		if ( this.ticksEmitted>=60 ) {
			this.startTime		= now;						// Adjust startTime forward
			this.ticksEmitted	= this.ticksEmitted % 60;	// Reset counter
		}
		requestAnimationFrame( this.boundTick );			// Schedule the next tick.
	}

	// Starts the ticker.
	// RETURNS: [void].
	start() {
		// Reset & recalibrate ticker if not running
		if ( !this.running ) {
			this.running		= true;						// Set the ticker to running state.
			this.startTime		= performance.now();		// [number] Start time of ticker.
			this.ticksEmitted	= 0;						// [int] # of "frames rendered".
			requestAnimationFrame( this.boundTick );		// Schedule the first tick.
		}
	}

	// Stops the ticker.
	// RETURNS: [void].
	stop() {
		this.running = false; // Set the ticker to stopped state.
	}
}
