console.log( 'jestAlert: js/apps/jest/components/JestGamepiece.js loaded' );

//-------------------------
// JestGamepiece Class
//-------------------------
// Represents a basic [object] bound to the client world with various useful properties.
class JestGamepiece extends OSCallback {
	// Declare properties
	client		= null;				// [object] Application client reference.
	// Movement propert(ies)
	anchor		= null;				// [object] Anchor which dictates the real location (x,y).

	// --------------------------------
	// Constructor
	// --------------------------------
	// Initializes the game piece [object].
	// * client		- [object] Application client that this piece belongs to.
	constructor( client ) {
		super();									// construct the parent
		this.client		= client;					// game [object] reference
		// --------------------------------
		// Create Anchor [object]
		// --------------------------------
		// Creator anchor [object] for moving & size specifications
		const anchor	= new Anchor();				// create central anchor
		anchor.move( 0, 0 );						// move anchor to default position
		this.anchor		= anchor;					// store anchor as property
	}

	// Plug the [object] into the central game timeout loop.
	// RETURNS: [void].
	// * callback		- [callable] to call each time the timeout pulse updates.
	/*jumpstart( callback ) {
		this.client.timeout.register( 'tick', 'animator', callback );
	}*/
}
