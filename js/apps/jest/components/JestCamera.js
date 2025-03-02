console.log( 'jestAlert: js/apps/jest/components/JestCamera.js loaded' );

//-------------------------
// JestCamera Class
//-------------------------
class JestCamera extends JestGamepiece {
	// Object properties
	padding			= 0;			// [int] Optional padding around the viewport (in pixels).

	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct the [object].
	// * client		- [object] Application client creating the object.
	// * padding	- [int] Optional extra padding (in pixels) around the viewport.
	constructor( client, padding=0 ) {
		// Call the parent object constructor
		super( client );			// construct the parent
		this.padding		= padding;
		// The top-left position of the camera in world space:
		this.anchor.move( 0, 0 );	// [object] Anchor is inherited
	}

	// --------------------------------
	// Get [object] Coordinates
	// --------------------------------
	// Get level, world and global positioning + objects for player their current level.
	// RETURNS: [object|null] `{ player, globalX, globalY, level }` if found, else `null`.
	getLevelLocation() {
		// Get level [object] or throw error
		const level			= this.client.player.level ?? null;
		if ( level===null ) {
			console.error( `Level could not be located.` );
			return null;
		}
		const levelWorldX	= level.anchor.x * this.client.config.levelGrid;
		const levelWorldY	= level.anchor.y * this.client.config.levelGrid;
		const levelGlobalX	= level.anchor.x * this.client.config.levelSpan;
		const levelGlobalY	= level.anchor.y * this.client.config.levelSpan;
		return {
			level, levelX: level.anchor.x, levelY: level.anchor.y,
			levelWorldX, levelWorldY, levelGlobalX, levelGlobalY
			};
	}

	// Get level, world and global positioning + objects for player their current level.
	// RETURNS: [object|null] `{ player, globalX, globalY, level }` if found, else `null`.
	getPlayerLocation() {
		// Get level location data or throw error
		const levelLoc		= this.getLevelLocation();
		if ( !levelLoc ) {
			console.error( `Player location could not be computed.` );
			return null;
		}
		// Define level location(s)
		const { levelWorldX, levelWorldY, levelGlobalX, levelGlobalY } = levelLoc;
		// Return player global (x,y) in overworld
		const player		= this.client.player;
		const playerWorldX	= levelWorldX + player.anchor.x; // Overworld X (in tiles)
		const playerWorldY	= levelWorldY + player.anchor.y; // Overworld Y (in tiles)
		const playerGlobalX	= levelGlobalX + (player.anchor.x*this.client.config.tileGrid);
		const playerGlobalY	= levelGlobalY + (player.anchor.y*this.client.config.tileGrid);
		return {
			player, playerX: player.anchor.x, playerY: player.anchor.y,
			playerWorldX, playerWorldY, playerGlobalX, playerGlobalY
			};
	}

	// --------------------------------
	// Screen Calculating
	// --------------------------------
	// Get the viewport dimensions (in pixels) directly from your gameboard's anchor.
	// RETURNS: [object] { width, height }
	getViewport() {
		return {
			viewportWidth:	this.client.gameboard.anchor.width,
			viewportHeight:	this.client.gameboard.anchor.height,
			};
	}

	// Compute the global dimensions from the overworld (in pixels).
	// RETURNS: [object] { globalWidth, globalHeight }
	getGlobalDimensions() {
		// Get level [object] or throw error
		const level			= this.client.player.level ?? null;
		if ( !(level instanceof JestLevel) ) {
			console.error( `Level could not be located.` );
			return null;
		}
		// Overworld width/height (in pixels) come from the grid dimensions.
		const globalWidth	= level.overworld.anchor.width * this.client.config.levelSpan;
		const globalHeight	= level.overworld.anchor.height * this.client.config.levelSpan;
		return { globalWidth, globalHeight };
	}

	// Returns the camera’s current view rectangle.
	// RETURNS: [object] { x, y, width, height }
	getViewRect() {
		const { viewportWidth, viewportHeight } = this.getViewport();
		return {
			x:		this.anchor.x,
			y:		this.anchor.y,
			width:	viewportWidth,
			height:	viewportHeight
			};
	}

	// Returns the padded view rectangle.
	// RETURNS: [object] { x, y, width, height }
	getPaddedViewRect() {
		const { viewportWidth, viewportHeight } = this.getViewport();
		return {
			x:		this.anchor.x - this.padding,
			y:		this.anchor.y - this.padding,
			width:	viewportWidth + 2 * this.padding,
			height:	viewportHeight + 2 * this.padding,
			};
	}

	// --------------------------------
	// Coordinate Conversion Method(s)
	// --------------------------------
	// Convert a point from global space to screen space (relative to the camera’s viewport).
	// * globalX	- [int] X coordinate in global space.
	// * globalY	- [int] Y coordinate in global space.
	// RETURNS: [object] { x, y } Screen coordinates.
	globalToScreen( globalX, globalY ) {
		return {
			x:	globalX - this.anchor.x,
			y:	globalY - this.anchor.y,
			};
	}

	// (Optional) Convert a point from screen space to global space.
	// * screenX	- [int] X coordinate in screen space.
	// * screenY	- [int] Y coordinate in screen space.
	// RETURNS: [object] { x, y } Global coordinates.
	screenToGlobal( screenX, screenY ) {
		return {
			x:	screenX + this.anchor.x,
			y:	screenY + this.anchor.y,
			};
	}

	//-------------------------
	// Player Boundary Handling
	//-------------------------
	// Checks and corrects player position if out of bounds.
	// RETURNS: [object] `{ level: [string], x: [int], y: [int] }`
	// * x			- [int] Player's attempted X position.
	// * y			- [int] Player's attempted Y position.
	checkPlayerPosition( x, y ) {
		// Get current level info.
		const levelData	= this.getLevelLocation();
		if ( !levelData )
			return { level: this.client.player.level.name, x, y };
		// Destructure level location and current level
		const { levelX, levelY, level } = levelData;
		const overworld	= level.overworld;
		// Use separate config properties for width and height.
		const { levelGrid: levelWidth, levelGrid: levelHeight, tileGrid } = this.client.config;
		const { width: playerWidth, height: playerHeight } = this.client.player.anchor;
		// Get level neighbors (only N, E, S, W)
		const limits = {
			n:	overworld.matrix[levelY - 1]?.[levelX] || null,
			e:	overworld.matrix[levelY]?.[levelX + 1] || null,
			s:	overworld.matrix[levelY + 1]?.[levelX] || null,
			w:	overworld.matrix[levelY]?.[levelX - 1] || null
		};

		// Player movement boundaries
		const bleedX	= 0;
		const bleedY	= 0;
		const minX		= limits.w ? -bleedX : 0;
		const maxX		= limits.e ? levelWidth - bleedX : levelWidth - 1;
		const minY		= limits.n ? -bleedY : 0;
		const maxY		= limits.s ? levelHeight - bleedY : levelHeight - 2;

		// Instantiate dynamic variables to calculate new position
		let newX = x, newY = y, newLevelX = levelX, newLevelY = levelY;
		// Determine overshoots along each axis
		const overshootX = x<minX ? minX-x : x>maxX ? x-maxX : 0;
		const overshootY = y<minY ? minY-y : y>maxY ? y-maxY : 0;
		// Handle transitions
		if ( x<minX && limits.w )		{ newLevelX--; newX = levelWidth - bleedX - (minX-x); }
		else if ( x>maxX && limits.e )	{ newLevelX++; newX = x-maxX; }
		else newX = Math.max( minX, Math.min(maxX,x) );

		if ( y<minY && limits.n )		{ newLevelY--; newY = levelHeight - bleedY - (minY-y); }
		else if ( y>maxY && limits.s )	{ newLevelY++; newY = y-maxY; }
		else newY = Math.max( minY, Math.min(maxY,y) );

		// Get new level or stay in the current one
		const nextLevel = overworld.matrix[newLevelY]?.[newLevelX];
		return nextLevel
			? { level: nextLevel.name, x: newX, y: newY }
			: { level: level.name, x: newX, y: newY };
	}

	// --------------------------------
	// Central Rendering Loop
	// --------------------------------
	// Update the camera position so that the given global coordinate (typically the player's position)
	// is centered, clamped to the world boundaries.
	update() {
		// Get player & viewport info
		const { playerGlobalX, playerGlobalY }	= this.getPlayerLocation();
		const { viewportWidth, viewportHeight }	= this.getViewport();
		const { globalWidth, globalHeight }		= this.getGlobalDimensions();
		// Center the camera on the player:
		let camX	= playerGlobalX - (viewportWidth/2);
		let camY	= playerGlobalY - (viewportHeight/2);
		// Clamp to world bounds:
		camX		= Math.max( 0, Math.min(camX,globalWidth-viewportWidth) );
		camY		= Math.max( 0, Math.min(camY,globalHeight-viewportHeight) );
		this.anchor.move( Math.round(camX), Math.round(camY) );
	}
}
