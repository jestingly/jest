console.log( 'jestAlert: js/system/window/BaseWindow.js loaded' );

// BaseWindow class to handle shared functionality
class BaseWindow extends OSElement {
	// Declare properties
	measurements		= null;			// [object] of window measurements (x, y, width, height)

	// Construct the base window
	constructor( options ) {
		super( options ); // call parent constructor
	}

	// Setup the window [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	setup() {
		super.setup(); // call parent setup method
		// Add base window class(es)
		this.classes.push( 'jest-window' );
		return true; // success
	}

	// Open the window inside the OS environment.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	open() {
		// --------------------------------
		// Create window [object]
		// --------------------------------
		// Append the window to the environment
		const environment		= JestEnvironment.getEnvironment();
		environment.appendChild( this.el );
		// Bind window-specific events
		//this.bindWindowEvents();
		// --------------------------------
		// Reframe State of window [object]
		// --------------------------------
		// Set current reframe state
		this.setMode( 'reframing', 'idle' );	// change reframing state
		this.measure();							// Measure the window
		this.maximize();						// Maximize the window
		return true; // success
	}

	// Minimize window
	// RETURNS: [boolean] `true` on success else `false` on fail.
	minimize() {
		// Attempt to reframe to minimized
		return this.reframe( 'minimized' );
	}

	// Maximize window
	// RETURNS: [boolean] `true` on success else `false` on fail.
	maximize() {
		// Attempt to Reframe to maximized
		return this.reframe( 'maximized' );
	}

	// Reframe the window to maximize or minimized state.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * newFrame		- [string] value of frame state to change window to.
	reframe( newFrame ) {
		// Get current state
		const currentFrame		= this.getMode( 'frame' );				// 'minimized', 'maximized', etc.
		const currentState		= this.getMode( 'reframing' );			// 'transitioning' or 'idle'
		console.log( `Reframing window from '${currentFrame}' to '${newFrame}'...` );
		// Determine classes
		const staticClasses		= [ 'maximized', 'minimized' ];			// root classes / modes
		const dynamicClasses	= [ newFrame, 'transitioning' ];		// motion state change
		const excludeClasses	= staticClasses.remove( newFrame );
		if ( newFrame!==currentFrame && currentState!=='transitioning' ) {
			jsos.classflip( this.el, dynamicClasses, excludeClasses );	// change class mode
			this.setMode( 'frame', newFrame );							// change frame state
			this.setMode( 'reframing', 'transitioning' );				// change reframing state
			// Remove the transition class after completion
			const transitionDuration = parseFloat(getComputedStyle(this.el).transitionDuration) * 1000 || 1500;
			setTimeout(
				() => {
					if ( this.getMode('reframing')==='transitioning' ) {
						this.el.classList.remove( 'transitioning' );
						this.setMode( 'reframing', 'idle' );			// change reframing state
					}
				},
				transitionDuration );
			return true; // successfully reframing
		}
		return false; // failed to reframe
	}

	// Close window
	close() {
		console.log( 'Closing window...' );
		if ( this.el ) {
			this.el.remove();
		}
	}

	// Update the window measurements (for resizing)
	// RETURNS: [void].
	measure() {
		// Ensure the element is [null]
		if ( this.el!==null ) {
	        // Get accurate dimensions
	        const rect	= this.el.getBoundingClientRect();
			// Calculate width, height, and location
			this.measurements = {
				width:		this.el.style.width || `${rect.width}px`,			// Use rect width for precision
				height:		this.el.style.height || `${rect.height}px`,			// Use rect height for precision
				top:		this.el.style.top || `${rect.top}px`,				// Save accurate top position
				left:		this.el.style.left || `${rect.left}px`				// Save accurate left position
			}
		}
	}
}
