console.log( 'jestAlert: js/apps/jest/components/JestGamepiece.js loaded' );

//-------------------------
// JestWorldling Class
//-------------------------
// Represents an [object] inside the game world.
class JestWorldling extends JestSavable {
	// World data
	_level			= null;			// [string] Value of level filename (e.g. level1).

	// --------------------------------
	// Constructor
	// --------------------------------
	// Initializes the game piece [object].
	// RETURNS: [void].
	// * client		- [object] Application client that this piece belongs to.
	// * name		- [string] Value of player username (e.g. 'Antago').
	constructor( client, name ) {
		super( client, name );			// construct the parent
	}

	// --------------------------------
	// World Positioning
	// --------------------------------
	// Get the player's level (world tile map JestLevel [object]).
	// RETURNS: [object] JestLevel or [...] on fail.
	get level() {
		// Get the player level [string] value
		const name		= this._level ?? null; // get current value
		if ( !jsos.prove(name,'string') ) {
			console.error( `Cannot get player level using a non-[string].` );
			return false;
		}
		// Get level [object] or this._level [...] value
		const level		= this.client.gameboard.levels?.[name] ?? null;
		return level; // rturn level value
	}

	// Set the [object] level [string] name (world tile map).
	// RETURNS: [void].
	// * name	- [string] value of player level name.
	set level( name ) {
		// Validate argument
		if ( !jsos.prove(name,'string') ) {
			console.error( `Cannot change player level using a non-[string].` );
			return;
		}
		// Get level [object] or throw error
		const level			= this.client.gameboard.levels?.[name] ?? null;
		if ( !(level instanceof JestLevel) ) {
			console.error( `Level could not be located.` );
			return;
		}
		else this._level	= name; // change level
	}

	// --------------------------------
	// Game Methods
	// --------------------------------
	// Check if the [object] is onwall.
	// RETURNS: [boolean] `true` if yes, else `false` if not.
	// * anchor			- [object] Anchor (units must match tileGrid).
	// * testX, testY	- [int] Level (x,y) coordinates in the tileset.
	onwall( anchor, testX, testY ) {
		// Validate anchor
		const tileGrid	= this.client.config.tileGrid;
		if ( !(anchor instanceof Anchor) || anchor.units!==tileGrid ) {
			console.warn( `Anchor argument must be [object] of instance Anchor with units in: ${tileGrid}` );
			return true; // block movement
		}
		// Calculate if user is actually hitting a wall
		const width		= anchor.width;			// use anchor width
		const height	= anchor.height;		// use anchor height
		const left		= Math.floor( anchor.globalX + testX );
		const right		= Math.floor( anchor.globalX + width + testX );
		const top		= Math.floor( anchor.globalY + testY );
		const bottom	= Math.floor( anchor.globalY + height + testY );
		// DETERMINE IF block detected
		return (
			this.level.getTileTypes(left,top).has( 'BLOCK' )		||
			this.level.getTileTypes(right,top).has( 'BLOCK' )		||
			this.level.getTileTypes(left,bottom).has( 'BLOCK' )		||
			this.level.getTileTypes(right,bottom).has( 'BLOCK' )
			);
	}
}
