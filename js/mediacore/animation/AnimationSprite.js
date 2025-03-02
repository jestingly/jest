console.log( 'jestAlert: js/mediacore/animation/AnimationSprite.js loaded' );

//-------------------------
// AnimationSprite Class
//-------------------------
// Represents a sprite object, extending the Animation class.
class AnimationSprite extends Anchor {
	// Declare properties
	id			= 0;				// [string] value of sprite id (e.g. 0)
	group		= null;				// [string] value of sprite category (e.g. 'ATTR1')
	label		= null;				// [string] value of sprite label (e.g. 'shadow')
	// Image reference propert(ies)
	sx			= 0;				// [int] value of source X position on the spritesheet
	sy			= 0;				// [int] value of source Y position on the spritesheet

	//-------------------------
	// Instantiation
	//-------------------------
	// Constructor for animation sprite.
	// RETURNS: [void].
	// * id			- [int] value of sprite id
	// * group		- [string] value of sprite category
	// * label		- [string] value of sprite label
	//   sx			- [int] value of source X position on the spritesheet
	//   sy			- [int] value of source Y position on the spritesheet
	//   width		- [int] value of custom sprite width
	//   height		- [int] value of custom sprite height
	constructor( id, group, label, sx=0, sy=0, width=16, height=16 ) {
		// Set sprite crop region on image
		super( 0, 0, 0, width, height );	// call parent constructor
		this.sx			= sx;				// Source X position on the spritesheet
		this.sy			= sy;				// Source Y position on the spritesheet
		// Identify names of sprite identifiers
		this.id			= id;				// Unique identifier for the sprite
		this.group		= group;			// Group or category (e.g., 'SPRITES', 'SHIELD')
		this.label		= label;			// Descriptive label (e.g., 'shadow', 'shield up')
	}
}
