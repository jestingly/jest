console.log( 'jestAlert: js/apps/jest/components/sound/JestSoundParser.js loaded' );

//-------------------------
// JestSoundParser Class
//-------------------------
class JestSoundParser {
	// Declare properties

	//-------------------------
	// Instantiation
	//-------------------------
	// Construct the [object].
	// RETURNS: [void].
	constructor() { }

	//-------------------------
	// Initialization Methods
	//-------------------------
	// Parse audio blob retrieved from JestFiler.
	// RETURNS: [object] { blob: data }
	// [object] with properties: { data: fileContent }.
	parse( { name, data: fileContent } ) {
		if ( !(fileContent instanceof Blob) ) {
			console.error( 'Expected [object] Blob data, but got:', fileContent );
			return null;
		}
		// Return validated [object]
		return { blob: fileContent };
	}
}
