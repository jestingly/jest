console.log( 'jestAlert: js/modules/menu/DockShortcut.js loaded' );

// DockShortcut object class
class DockShortcut extends OSElement {
	// Declare properties
	app				= null;			// Application [object]
	icon			= null;			// icon OSElement [object]
	tooltip			= null;			// tooltip OSElement [object]

	// Creates a progress loadbar [object].
	// RETURNS: [object] A new instance.
	// * options		- [object] Configuration options for the class [object].
	constructor( app ) {
		console.log( 'jestAlert: Creating dock shortcut ...' );
		const options	=
		{
				name:	'launch',
				tag:	'button',
				callbacks:
					[
						{
							command:	'click',
							id:			'btnLaunch',
							type:		'dom',
							callback:
								function () {
									// Launch the app
									//console.log( this );
									this.app.launch();
								}
						}
					]
			};
		super( options );
		// Call the parent constructor
		this.app	= app;			// cross-ref Application [object]
		// Setup the loadbar before creating the element
        this.setup();				// setup the loadbar
		this.render();				// render the loadbar
	}

	// Setup the loadbar [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	setup() {
		console.log( 'jestAlert: Setting up dock shortcut ...' );
		super.setup();				// call parent setup method
		// Ensure class(es) include loadbar class(es)
		this.classes.push( 'jest-dock-shortcut' );
		return true;				// success
	}

	// Render the [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	render() {
		console.log( 'jestAlert: Rendering dock shortcut ...' );
		// --------------------------------
		// Create the DOM Element
		// --------------------------------
		super.render();					// call parent setup method
		// --------------------------------
		// Add icon to dock app
		// --------------------------------
		// Create icon
		const options	=
			{
				tag: 'img',
				classes: [ 'jest-dock-shortcut-icon', 'jest-icon' ]
			};
		const icon		= new OSElement( options );
		icon.render(); // render the element
		icon.el.src		= chrome.runtime.getURL( this.app.icon );
		this.el.appendChild( icon.el );	// add icon to the dock appl
		this.icon		= icon;			// cross-reference
		// --------------------------------
		// Add tooltip to shortcut
		// --------------------------------
		const tooltip	= new Tooltip( { text: this.app.name } );
		this.el.appendChild( tooltip.el ); // add tooltip to the dock shortcut
		this.tooltip	= tooltip;		// cross-reference
		return true;					// success
	}
}
