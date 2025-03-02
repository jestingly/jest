console.log( 'jestAlert: js/os/OSLibrarian.js loaded' );

// Jest librarian class
class OSLibrarian {
	// Declare properties
	libs			= {};					// [object] of OSLibrary [objects]

	// Creates the class [object] with configurable components.
	// RETURNS: [object] A new instance.
	constructor() { }

	// Include a library as part of the librarian
	// RETURNS: [bool] `true` on success, else `false`.
	// * lib		- [string] value of lib name to include: ie. 'HarlequinWindow'
	ship( lib ) {
		// Declare variables
		const className		= 'Library'+lib;
		const LibraryClass	= JestLibraryRegistry[className];
		if ( !LibraryClass )
			throw new Error( `Library "${className}" not found.` );
		// Return generated [object]
		this.libs[lib]		= new LibraryClass();
		return true;
	}
}
