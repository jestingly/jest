console.log( 'jestAlert: js/apps/jest/components/JestFantascope.js loaded' );

//-------------------------
// JestFantascope Class
//-------------------------
// Manages janis.
class JestFantascope extends JestGamepiece {
	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct with a default base URL.
	// * client		- [object] Application client creating the object.
	constructor( client ) {
		super( client );		// Call the parent constructor.
	}

	// --------------------------------
	// Animation Image Handling
	// --------------------------------
	// Set the image of an animation attribute.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * janiName		- [string] Animation name ('walk', 'body', 'sword').
	// * viewName		- [string] Animation view name ('player1').
	// * category		- [string] The registered JestGallery category of image ('head', 'body', 'sword').
	// * filename		- [string] The filename of the image asset.
	setImage( janiName, viewName, category, filename ) {
		// Validate arguments
		if ( !jsos.argues({janiName:[janiName,'string'],viewName:[viewName,'string']}) )
			return false;
		// Attempt to access the animation [object]
		const jani		= this.client.filer.files.janis[janiName] ?? null;
		if ( !(jani instanceof AnimationAnimation) ) {
			console.warn( `Animation not found: ${janiName}` );
			return false;
		}
		// Attempt to access the animation view [object]
		const view		= jani.views[viewName] ?? null;
		if ( !(view instanceof AnimationView) ) {
			console.warn( `Animation '${janiName}' view not found: ${viewName}` );
			return false;
		}
		// Attempt to get the asset
		const asset		= this.client.gallery.getAsset( category, filename );
		if ( !asset ) {
			console.warn( `Image asset '${category}' not found: ${filename}` );
			return false;
		}
		// Set ElementImage as attribute
		view.setAttribute( category, asset );
		return true; // Success
	}
}
