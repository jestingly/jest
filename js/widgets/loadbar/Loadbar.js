console.log( 'jestAlert: js/widgets/loadbar/Loadbar.js loaded' );

//-------------------------
// Loadbar Class
//-------------------------
class Loadbar extends OSElement {
	// Declare properties
	percent		= null;			// [element] of percent counter
	bar			= null;			// [element] of animated bar

	// Creates a loadbar [object].
	// RETURNS: [object] A new instance.
	// * options		- [object] Configuration options for the class [object].
	constructor( options={} ) {
		// Call the parent constructor
		super( options );
		// Setup the loadbar before creating the element
        this.setup();			// setup the loadbar
		this.render();			// render the loadbar
	}

	// Setup the loadbar [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	setup() {
		super.setup();			// call parent setup method
		// Ensure class(es) include loadbar class(es)
		this.classes.push( 'jest-loadbar' );
		return true;			// success
	}

	// Render the [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	render() {
		// --------------------------------
		// Create the DOM Element
		// --------------------------------
		super.render();					// call parent setup method
		// --------------------------------
		// Create bar element [object]
		// --------------------------------
		const bar		= jsos.generateElement( 'div', null, ['jest-loadbar-bar'] );
		this.el.appendChild( bar );
		this.bar		= bar;			// cross-reference
		// --------------------------------
		// Create percent element [object]
		// --------------------------------
		const percent	= jsos.generateElement( 'div', null, ['jest-loadbar-text'], '0%' );
		bar.appendChild( percent );		// add # percent to bar
		this.percent	= percent;		// cross-reference
		return true;					// success
	}

	// Reset the loadbar to 0
	// RETURNS: [void].
	reset() {
		// Add end animation
		this.setMode( 'loading', 'pending' );							// set state to pending
		jsos.classflip( this.bar, 'pending', ['tracking','complete'] );	// visual classes
		// Reset loadbar width & text
		this.update( 0, 1 );
		this.bar.offsetWidth;			// trigger reflow
	}

	// Set loadbar to active
	// RETURNS: [void].
	activate() {
		// Activate the bar
		this.setMode( 'loading', 'tracking' );							// set state to tracking
		jsos.classflip( this.bar, 'tracking', ['pending','complete'] );	// visual classes
	}

	// Set to active
	// RETURNS: [void].
	complete() {
		// Add end animation
		this.setMode( 'loading', 'complete' );							// set state to complete
		jsos.classflip( this.bar, 'complete', ['pending','tracking'] );	// visual classes
		// Fully expand loadbar width & text
		this.update( 1, 1 );
		// Remove the animation class after completion
		setTimeout(
			() => {
				if ( this.getMode('loading')==='complete' )
					this.el.classList.remove( 'complete' );
			},
			1500 );
		return true;
	}

	// Update the loadbar visual animation
	update( current, total ) {
		// Update loadbar bar percentage text
		const progress				= Math.min( (current/total) * 100, 100 ); // Ensure it doesn't exceed 100%
		this.bar.style.width		= `${progress}%`;
		this.percent.textContent	= `${Math.round(progress)}%`;
	}
}
