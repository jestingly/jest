console.log( 'jestAlert: js/apps/jest/components/JestConfiguration.js loaded' );

//-------------------------
// JestConfiguration Class
//-------------------------
class JestConfiguration extends JestSavable {
	// --------------------------------
	// Media & Web Setting(s)
	// --------------------------------
	// File(s) & resource(s)
	webfiles		= 'http://localhost:8888/webfiles/files'; // [string] value of webfiles root: images, sounds, etc.
	// --------------------------------
	// Game Setting(s)
	// --------------------------------
	// Definition propert(ies)
	tileGrid		= 16;			// [int] Value of tile size width/height (defaults to 16px).
	levelGrid		= 64;			// [int] Value of level width/height (defaults to 64 tiles).
	levelSpan		= null;			// [int] Value of level width/height in pixels (auto-calculated).

	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct the [object].
	// * client		- [object] Application client creating the object.
	//   options	- [object] of custom configuration options (optional)
	//   	webfiles | [string] value of webfiles root URL for game media.
	constructor( client, options={} ) {
		// Call the parent object constructor
		super( client, name );			// construct the parent
		// Set base URL for game media resource file(s)
		this.webfiles	= options.webfiles ?? this.webfiles;
		// Calculate some definitions
		this.levelSpan	= this.tileGrid * this.levelGrid;
	}
}
