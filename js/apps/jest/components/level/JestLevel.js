console.log( 'jestAlert: js/apps/jest/components/level/JestLevel.js loaded' );

//-------------------------
// JestLevel Class
//-------------------------
class JestLevel extends JestSavable {
	// Object properties
	canvas			= null;				// ElementCanvas [object]
	stamp			= null;				// ElementCanvas [object] used for tile stamping
	overworld		= null;				// [object] JestOverworld reference level is within.
	// Level parts
	chunks			= null;				// [array] Tile map chunks of level.
	tiledefs		= null;				// [object] Tiledefs aligned to specific tile indices.

	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct the [object].
	// * client		- [object] Application client creating the object.
	// * name		- [string] Value of level name (e.g. 'level1').
	constructor( client, name ) {
		// Call the parent object constructor
		super( client, name );			// construct the parent
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
		this.build();					// build the object
		// --------------------------------
		// Load File(s) Data
		// --------------------------------
		await this.load();				// load the data
		return true;					// success
	}

	// Build the [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	build() {
		// --------------------------------
		// Create Drawing [objects]
		// --------------------------------
		// Create the level rendering element canvas [object]
		const canvas		= new ElementCanvas();
		this.canvas			= canvas;
		// Update canvas dimensions
		const levelSpan		= this.client.config.levelSpan;
		canvas.resize( levelSpan, levelSpan );
		// Create a canvas for clip stamping onto level element canvas [object]
		const stamp			= new ElementCanvas();
		this.stamp			= stamp;
		// --------------------------------
		// Setup Sizing Method(s) [object]
		// --------------------------------
		/*// Add resize event handler for canvas updating
		this.anchor.register( 'resize', 'level', (w,h)=>this.resize(w,h) );
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
		this.client.gameboard.levels[this.name] = this; // store reference in stack [object]
		return true;		// success
	}

	// --------------------------------
	// Level Rendering
	// --------------------------------
	// Build the object.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * tiles		- Ordered 2D [array] of tile tileset indices.
	render( tiles ) {
		// Generate list of tile
		//const tiles		= this.genLevel();
		//console.log( tiles );
		// Iterate tiles & map local tiledefs
		/*for ( let y=0; y<tiles.length; y++ ) {
			for ( let x=0; x<tiles[y].length; x++ ) {
				const tile	= tiles[y][x];
				if ( !tile ) continue;
				foreach
			}
		}*/
		this.buildTileTypes( tiles );
		const tilemap	= this.encodeRawLevelToChunks( tiles );
		//console.log( tilemap );
		this.blit( tilemap );					// render level bitmap
		//window.open(this.stamp.el.toDataURL());
	}

	// Build tileTypes: 2D array of Sets storing tile types per (x,y).
	// RETURNS: [Set] of types, or empty Set if none exist.
	// * tiles		- Ordered 2D [array] of tile tileset indices.
	buildTileTypes( tiles ) {
		// Gather variable(s)
		let tileset		= this.client.gameboard.tilesets['pics1'];
		const levelGrid	= this.client.config.levelGrid;
		// Initialize a 2D array of Sets
		const levelTileTypes	=
			Array.from(
				{ length: levelGrid },
				() => Array.from( { length: levelGrid }, () => new Set() )
				);
		// Populate tile definitions per tile position
		for ( let y=0; y<levelGrid; y++ ) {
			for ( let x=0; x<levelGrid; x++ ) {
				const tileCode	= tiles[y][x].c; // Get tile code (b64 string)
				const tileTypes	= tileset.tiledefs.getTypesByCode( tileCode ); // Get types
				if ( tileTypes.size>0 )
					levelTileTypes[y][x] = tileTypes; // Store types
			}
		}
		this.tiledefs = levelTileTypes;
	}

	// Retrieve tile types at (x,y) coordinates in level.
	// RETURNS: [Set] of types, or empty Set if none exist.
	// * x, y	- [int] Tile coordinates in the tileset.
	getTileTypes( x, y ) {
		return this.tiledefs[y]?.[x] || new Set();
	}

	//-------------------------
	// Canvas Methods
	//-------------------------
	// Resize the canvas element.
	// NOTE: This is a callback function.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	/*resize() {
		// Update canvas dimensions
		const levelSpan		= this.client.config.levelSpan;
		if ( this.canvas )
			this.canvas.resize( levelSpan, levelSpan );
		return true;	// success
	}*/

	//-------------------------
	// Level Handling
	//-------------------------
	// Encode a 2D array of tiles into a compact string format.
	// RETURNS: [string] Encoded tile string representation.
	// * grid		- [array] 2D array of tiles, where each tile has `ts`, `tx`, and `ty` properties.
	encodeMatrixID( grid ) {
		return grid.map(
			row => row.map( tile =>
				tile.ts.toString(16).padStart(2,'0') +
				tile.tx.toString(16).padStart(2,'0') +
				tile.ty.toString(16).padStart(2,'0')
			).join('')
		).join('_');
	}

	// Decode a string-encoded tile representation back into a 2D tile array.
	// RETURNS: [array] 2D array of tile objects `{ ts, tx, ty }`.
	// * encoded	- [string] Encoded tile string representation.
	decodeMatrixID( encoded ) {
		return encoded.split('_').map(row =>
			row.match(/.{6}/g).map(hex => ({
				ts: parseInt( hex.substring(0,2), 16 ),	// Tileset id
				tx: parseInt( hex.substring(2,4), 16 ),	// Sprite X coordinate on tileset
				ty: parseInt( hex.substring(4,6), 16 )	// Sprite Y coordinate on tileset
			}))
		);
	}

	// Encode an object `{ x, y }` into a 4-character hex string.
	// RETURNS: [string] Encoded hex position.
	// * pos		- [object] `{ x, y }` position object.
	encodePosition( pos ) {
		return pos.x.toString(16).padStart(2,'0') + pos.y.toString(16).padStart(2,'0');
	}

	// Decode an array of hex tile positions into `{ x, y }` objects.
	// RETURNS: [array] Array of `{ x, y }` positions.
	// * positions	- [array] Array of hex strings representing positions.
	decodeMatrixXY( positions ) {
		return positions.map( pos => this.decodePosition(pos) );
	}

	// Decode a 4-character hex position string into `{ x, y }`.
	// RETURNS: [object] `{ x, y }` position object.
	// * encoded	- [string] Encoded hex position (4 characters).
	decodePositionString( encoded ) {
		return encoded.match(/.{4}/g).map( pos => this.decodePosition(pos) );
	}

	// Decode a 4-character hex position string into `{ x, y }`.
	// RETURNS: [object] `{ x, y }` position object.
	// * encoded	- [string] Encoded hex position (4 characters).
	decodePosition( encoded ) {
		return {
			x: parseInt( encoded.substring(0,2), 16 ),
			y: parseInt( encoded.substring(2,4), 16 )
		};
	}

	// Generate a level of tiles.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	genLevel() {
		// Validate level width/height
		const tiles			= [];		// [array] of tiles
		const levelGrid		= this.client.config.levelGrid;
		for ( let y=0; y<levelGrid; y++ ) {
			const row		= [];
			for ( let x=0; x<levelGrid; x++ ) {
				// Create tile & add to row
				const tile	= { ts:0, tx:0, ty:0 };
				row.push( tile );
			}
			tiles.push( row );
		}
		// Return the generated tiles
		return tiles;
		/*// Encode the raw level into chunks.
		const chunks	= this.encodeRawLevelToChunks( tiles );
		// Set tiles
		this.chunks		= chunks;*/
	}

	// Encodes raw 2D [array] of tiles to level chunks [array]
	// RETURNS: [array] of chunks or `false` on fail.
	// * tiles		- 2D [array] of raw tiles comprising the level.
	encodeRawLevelToChunks( tiles ) {
		if ( !tiles || !tiles.length ) return false
		// Group positions by tileId
		const chunks		= {};
	    const visited		= new Set();
		const levelGrid		= this.client.config.levelGrid;
		for ( let y=0; y<levelGrid; y++ ) {
			for ( let x=0; x<levelGrid; x++ ) {
	            let key			= `${x},${y}`;
	            if ( visited.has(key) ) continue; // Skip already processed tiles
	            // Treat each tile as a single 1x1 matrix
	            let matrix		= [[tiles[y][x]]];
	            // Encode the matrix
	            const matrixID	= this.encodeMatrixID( matrix );
	            // Find all matching tiles in the grid
	            for ( let yy=0; yy<levelGrid; yy++ ) {
	                for ( let xx=0; xx<levelGrid; xx++ ) {
	                    let matchKey		= `${xx},${yy}`;
	                    if ( !visited.has(matchKey) && this.sameTile(tiles[y][x],tiles[yy][xx]) ) {
	                        // Store position as a hex string
	                        const posHex	= this.encodePosition( { x: xx, y: yy } );
	                        if ( !chunks[matrixID] )
								chunks[matrixID]	 = "";
	                        chunks[matrixID]		+= posHex;
	                        visited.add( matchKey );
	                    }
	                }
	            }
	        }
	    }
		return chunks;
	}

	// Compare two tiles.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * tileA		- [object] first tile to compare.
	// * tileB		- [object] second tile to compare.
	sameTile( tileA, tileB ) {
		if ( !tileA || !tileB ) return false;
		return tileA.ts===tileB.ts && tileA.tx===tileB.tx && tileA.ty===tileB.ty;
	}

	//-------------------------
	// Level Rendering
	//-------------------------
	// Render a tilemap using pre-rendered tile matrices.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * tilemap   - [object] Tilemap dictionary `{ matrix: [positions] }`.
	blit( tilemap ) {
		// Validate argument(s)
		if ( !tilemap ) return false;
		// Select tileset (by index)
		let units		= this.client.config.tileGrid;
		let tileset		= this.client.gameboard.tilesets['pics1'];
		// Get the main level canvas to draw on
		const ctx		= this.canvas.el.getContext( '2d' );
		// Iterate the tilemap & draw tile(s)
		Object.entries(tilemap).forEach(
			( [ encodedMatrix, encodedPositions ] ) => {
				const matrix		= this.decodeMatrixID( encodedMatrix );
				this.deboss( matrix ); // imprint matrix into this.stamp
				let positions		= this.decodePositionString( encodedPositions );
				positions.forEach(
					( { x: levelX, y: levelY } ) => {
						let dxPos	= levelX * units;
						let dyPos	= levelY * units;
						ctx.drawImage( this.stamp.el, dxPos, dyPos );
					});
			});
		return true;
	}

	// Render a temp tile matrix to stamp onto a canvas.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * matrix		- [array] 2D tile array `{ ts, tx, ty }`.
	deboss( matrix ) {
		// Select tileset (by index)
		let units		= this.client.config.tileGrid;
		let tileset		= this.client.gameboard.tilesets['pics1'];
		// Determine width & height of the matrix
		let width		= matrix[0].length * units;
		let height		= matrix.length * units;
		this.stamp.resize( width, height );
		const ctx		= this.stamp.el.getContext('2d');
		// Iterate tile(s) in matrix & generate stamp
		matrix.forEach(
			( row, ly ) => {
				row.forEach(
					( tile, lx ) => {
						// Select tileset (by index)
						//let tileset	= this.client.gameboard.tilesets[tile.ts];
						// Ensure tile definition(s) set for tile
						//let units	= tileset.units;
						if ( !tileset ) return;				// Skip if tileset does not exist
						// Define sprite x,y of tile & destination + width/hegith
						let sx		= tile.tx * units;		// Source X in tileset
						let sy		= tile.ty * units;		// Source Y in tileset
						let dx		= lx * units;			// Destination X in pixels
						let dy		= ly * units;			// Destination Y in pixels
						// Draw the tile on the map
						ctx.drawImage( tileset.image.el, sx, sy, units, units, dx, dy, units, units );
					});
			});
		return true; // success
	}
}
