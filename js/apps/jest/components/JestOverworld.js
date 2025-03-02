console.log( 'jestAlert: js/apps/jest/components/JestOverworld.js loaded' );

//-------------------------
// JestOverworld Class
//-------------------------
class JestOverworld extends JestSavable {
	// Object properties
	canvas			= null;				// [object] ElementCanvas
	matrix			= null;				// 2D [array] JestLevel [objects] being connected
	width			= null;
	heifhr

	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct the [object].
	// * client		- [object] Application client creating the object.
	// * name		- [string] Value of overworld name (e.g. 'map1').
	constructor( client, name ) {
		// Call the parent object constructor
		super( client, name );			// construct the parent
		this.matrix		= [];			// 2D array holding level objects.
	}

	//-------------------------
	// Initialization Methods
	//-------------------------
	// Setup the object [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async setup() {
		// --------------------------------
		// Build Level
		// --------------------------------
		this.build();					// render the object
		// --------------------------------
		// Load File(s) Data
		// --------------------------------
		await this.load();				// load the data
		return true;					// success
	}

	// Build the object.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	build() {
		// --------------------------------
		// Create Drawing [objects]
		// --------------------------------
		// Create the level rendering [canvas]
		const canvas	= new ElementCanvas();
		this.canvas		= canvas;
		// --------------------------------
		// Setup Sizing Method(s) [object]
		// --------------------------------
		/*// Add resize event handler for canvas updating
		this.anchor.register( 'resize', 'overworld', (w,h)=>this.resize(w,h) );
		// Set tile size
		this.anchor.graticulate( this.client.config.tileGrid );
		// Set level width & height
		this.anchor.resize( this.client.config.levelGrid, this.client.config.levelGrid );*/
		return true;		// success
	}

	//-------------------------
	// Data Handling
	//-------------------------
	// Load the data.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async load() {
		super.load();		// call parent load start method
		this.complete();	// call complete method
		return true;		// success
	}

	// Complete data load.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	complete() {
		super.complete();	// call parent complete method
		this.client.gameboard.overworlds[this.name] = this; // store reference in stack [object]
		return true;		// success
	}

	//-------------------------
	// Lexical Handling
	//-------------------------
	// Sets the width (columns) of the overworld in levels.
	// RETURNS: [object] `this` to return for method chaining.
	measure() {
		this.anchor.width	= this.matrix.reduce( (max,row) => Math.max(max,row.length), 0 );
		this.anchor.height	= this.matrix.length;
		return this;
	}

	//-------------------------
	// Resize the Overworld Grid
	//-------------------------
	// Adjusts the overworld grid size.
	// RETURNS: [bool] `true` on success, else `false`.
	// * width		- [int] New column count (X-axis).
	// * height		- [int] New row count (Y-axis).
	resize( width, height ) {
		// Validate arguments
		if ( !jsos.prove(width,'int') || !jsos.prove(height,'int') ||
			width<=0 || height<=0 ) {
			console.error( `Invalid dimensions: width and height must be positive integers.` );
			return false;
		}
		// If downsizing, remove out-of-bounds levels
		for ( let y=this.matrix.length-1; y>=height; y-- ) {
			if ( this.matrix[y] ) {
				for ( let x=0; x<this.matrix[y].length; x++ ) {
					if ( this.matrix[y][x] instanceof JestLevel ) {
						this.matrix[y][x].anchor.move( 0, 0 ); // Reset level position
					}
				}
			}
		}
		// Resize rows
		this.matrix.length = height;
		for ( let y=0; y<height; y++ ) {
			if ( !this.matrix[y] )
				this.matrix[y] = [];
			// If downsizing, remove levels from columns beyond width
			for ( let x=this.matrix[y].length-1; x>=width; x-- ) {
				if ( this.matrix[y][x] instanceof JestLevel ) {
					this.matrix[y][x].anchor.move( 0, 0 );
				}
			}
			// Resize columns
			this.matrix[y].length = width;
			// Fill empty slots with `null`
			for ( let x=0; x<width; x++ ) {
				if ( this.matrix[y][x]===undefined ) {
					this.matrix[y][x] = null;
				}
			}
		}
		this.measure();		// recalculate overworld width/height
		return true;		// success
	}

	//-------------------------
	// Level Handling
	//-------------------------
	// Adds a level to the overworld.
	// RETURNS: [bool] `true` on success, else `false`.
	// * level	- [object] JestLevel instance.
	// * x		- [int] X coordinate (column) in the overworld grid.
	// * y		- [int] Y coordinate (row) in the overworld grid.
	addLevel( level, x, y ) {
		// Validate argument(s)
		if ( !(level instanceof JestLevel) ) {
			console.error( `Invalid level object.` );
			return false;
		}
		if ( !jsos.prove(x,'int') || !jsos.prove(y,'int') ||
			 x<0 || y<0 ) {
			console.error( `Coordinates must be positive integers.` );
			return false;
		}
		// Expand rows if needed
		while ( this.matrix.length<=y )
			this.matrix.push( [] );
		// Expand columns in the row if needed
		while ( this.matrix[y].length<=x)
			this.matrix[y].push( null );
		// Assign level to the grid
		this.matrix[y][x]	= level;		// store level at coordinate
		level.overworld		= this;			// set the level overworld
		level.anchor.move( x, y );			// update level coordinates
		this.measure();						// recalculate overworld width/height
		return true; // success
	}

	// Removes a level from the overworld.
	// RETURNS: [bool] `true` on success, else `false`.
	// * x		- [int] X coordinate (column) of the level to remove.
	// * y		- [int] Y coordinate (row) of the level to remove.
	removeLevel( x, y ) {
		// Look for level at requested coordinate
		if ( y<this.matrix.length && x<this.matrix[y].length ) {
			// Access level at location
			const level			= this.matrix[y][x];
			// Reset level position if level exists
			if ( level instanceof JestLevel )
				level.anchor.move( 0, 0 );
			// Ensure coordinate is set to [null]
			this.matrix[y][x]	= null;
			this.measure();	// recalculate overworld width/height
			return true;	// success
		}
		return false;		// incorrect coordinate
	}

	// Validates the overworld structure.
	// RETURNS: [bool] `true` if valid, else throws an error.
	/*validate() {
		let expectedWidth = this.width;
		for ( let row of this.matrix ) {
			if ( row.length!==expectedWidth ) {
				throw new Error( `Level grid is not rectangular.` );
			}
		}
		return true;
	}*/

	// Prints the overworld grid structure.
	// RETURNS: [void]
	print() {
		console.log( `JestOverworld: ${this.name}`);
		console.log(
			this.matrix.map(
				row => row.map(
					l => (l?l.name:"EMPTY") ).join(" | ")
					)
				.join("\n"));
	}

	//-------------------------
	// Snapshot Handling (for Player)
	//-------------------------
	// Finds the grid index (x, y) of a level by its name.
	// RETURNS: [object|null] `{ level, x, y }` if found, else `null`.
	// * name			- [string] Name of the level.
	getLevelPos( name ) {
		for ( let y=0; y<this.matrix.length; y++ ) {
			for ( let x=0; x<this.matrix[y].length; x++ ) {
				if ( this.matrix[y][x] && this.matrix[y][x].name===name ) {
					return { level: this.matrix[y][x], x: x, y: y };
				}
			}
		}
		return null;
	}

	// Finds the level at a specific grid position.
	// RETURNS: [object|null] JestLevel instance or null if out of bounds.
	// * x			- [int] Level's X index in the 2D levels array.
	// * y			- [int] Level's Y index in the 2D levels array.
	getLevelAtXY( x, y ) {
		if ( y>=0 && y<this.matrix.length &&
			 x>=0 && x<this.matrix[y].length ) {
			return this.matrix[y][x] || null;
		}
		return null;
	}

	// Gets only the levels that are visible within the viewport.
	// RETURNS: [array] Visible level canvases with cropped sections.
	// * camera		- [object] JestCamera controlling the viewport.
	getSnapshot() {
		// Retrieve padded view rectangle from camera.
		const paddedRect	= this.client.camera.getPaddedViewRect();
		// Get level width/height.
		const levelSpan		= this.client.config.levelSpan;
		// Build the bounds
		const minX			= paddedRect.x;
		const minY			= paddedRect.y;
		const maxX			= paddedRect.x + paddedRect.width;
		const maxY			= paddedRect.y + paddedRect.height;
		// Convert world-space bounds to level grid indices
		let minLevelX		= Math.floor( minX/levelSpan );
		let maxLevelX		= Math.ceil( maxX/levelSpan ) - 1;
		let minLevelY		= Math.floor( minY/levelSpan );
		let maxLevelY		= Math.ceil( maxY/levelSpan ) - 1;
		// Begin return data [array]
		let visibleSections	= [];
		// Iterate only over levels inside the visible range
		for ( let gridY=minLevelY; gridY<=maxLevelY; gridY++ ) {
			for ( let gridX=minLevelX; gridX<=maxLevelX; gridX++ ) {
				const level			= this.getLevelAtXY( gridX, gridY );
				if ( !level ) continue;
				// Compute the level's world-space rectangle.
				const levelWorldX	= gridX * levelSpan;
				const levelWorldY	= gridY * levelSpan;
				// Find the intersection between this level and the padded camera view.
				const interLeft		= Math.max( levelWorldX, minX );
				const interTop		= Math.max( levelWorldY, minY );
				const interRight	= Math.min( levelWorldX+levelSpan, maxX );
				const interBottom	= Math.min( levelWorldY+levelSpan, maxY );
				const interWidth	= interRight - interLeft;
				const interHeight	= interBottom - interTop;
				if ( interWidth<=0 || interHeight<=0 ) continue; // No visible area
				// Compute the visible portion of the level
				let sx				= interLeft - levelWorldX;
				let sy				= interTop - levelWorldY;
				let sWidth			= interWidth;
				let sHeight			= interHeight;
				// Destination rectangle on the screen.
				const screenPos		= this.client.camera.globalToScreen( interLeft, interTop );
				const dx			= screenPos.x;
				const dy			= screenPos.y;
				const dWidth		= interWidth;
				const dHeight		= interHeight;
				// Generate more return data [object]
				visibleSections.push({
					canvas: level.canvas.el, // The level's canvas element.
					sx, sy, sWidth, sHeight, // Source rect in level space.
					dx, dy, dWidth, dHeight  // Destination rect in screen space.
					});
			}
		}
		// Return snapshot specification [array] data
		return visibleSections;
	}

	// Render the visible snapshot of the map player is in.
	// RETURNS: [bool] `true` on success, else `false`.
	// * ctx			- [objet] HTML Canvas element 2d context.
	// * snapshot		- [object] Data of snapshot to render (use getSnapshot() to obtain this data).
	renderVisibleLevels( ctx, snapshot ) {
		// Iterate each specification & snapshot
		snapshot.forEach(
			( { canvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight } ) => {
				ctx.drawImage( canvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight );
			});
		return true; // success
	}
}
