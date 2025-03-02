console.log( 'jestAlert: js/os/OSLibrary.js loaded' );

// OSLibrary class
class OSLibrary {
	// Declare properties
	name				= 'Library';			// name of library
	version				= '0.0';				// library version
	libs				= {};					// [object] of sub-libs part of the library

	// Creates the class [object] with configurable components.
	// RETURNS: [object] A new instance.
	// * libs		- [array|string] of libs inside of library to include.
	constructor( libs=[] ) {
		// Call ship
		this.ship( libs );
	}

	// Setup the DOM element [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	setup() {
		return true;			// success
	}

	// Include librar(ies).
	// RETURNS: [bool] `true` on success, else `false`.
	// * libs		- [array|string] value of library name(s) to include: ie. 'HarlequinWindow'
	ship( libs ) {
		// Iterate libs & generate
		if ( !(libs instanceof Array) )
			libs	= [libs];
		for ( let lib of libs ) {
			const library	= JestEnvironment.librarian.ship( lib ); // generate lib
			this.libs[lib]	= library;
		}
	}
}
