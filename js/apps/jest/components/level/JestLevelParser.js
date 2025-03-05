console.log( 'jestAlert: js/apps/jest/components/level/JestLevelParser.js loaded' );

//-------------------------
// NWFileParser Class
//-------------------------
// Parses Graal game `.nw` map files.
class JestLevelParser {
	// Declare properties
	keywords			= null;				// [object] Set array of acceptable keyword(s).
	// Tileset scanline reading / handling definition(s)
	charset				= null;				// [string] Default tile decoding order.
	tileSize			= 16;				// tile size
	tileWrap			= 16;				// after 16 tiles, the indices wrap
	tileBlock			= null;				// how many tiles in the wrapping block
	tilesetWidth		= 2048;				// width of tileset in pixels
	tilesetHeight		= 512;				// height of tileset in pixels
	tilesetRows			= null;				// 128 tiles per row
	tilesetColumns		= null;				// 32 tiles per column
	totalTiles			= null;				// 4096 total tiles

	//-------------------------
	// Constructor
	//-------------------------
	// Initializes the parser.
	// RETURNS: [void] Nothing.
	// * options		- [object] Optional configuration parameters.
	//   tileOrder		- [string] Custom tile decoding order.
	constructor( options={} ) {
		// Define reserved keywords
		this.keywords = new Set( ['BOARD', 'LINK', 'SIGN', 'NPC'] );
		// Accept custom tileOrder parse algorithm
		if ( options.tileOrder )
			this.charset	 = options.tileOrder;
		else {
			// Determine parse order
			this.charset	 = '';
			this.charset	+= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			this.charset	+= 'abcdefghijklmnopqrstuvwxyz';
			this.charset	+= '0123456789';
			this.charset	+= '+';
			this.charset	+= '/';
		}
		// Instantiate calculations
		this.tilesetColumns	= this.tilesetWidth / this.tileSize;		// 128 tile columns
		this.tilesetRows	= this.tilesetHeight / this.tileSize;		// 32 tile rows
		this.totalTiles		= this.tilesPerRow * this.tilesPerColumn;	// 4096 total tiles
		this.tileBlock		= this.tilesetRows * this.tileWrap;			// 512 tiles per block

	}

	//-------------------------
	// Tile Encoding/Decoding
	//-------------------------
	// Encodes a tile (x, y) into a 2-character base-64 tile code.
	// RETURNS: [str] Encoded 2-character tile code.
	// * xTile	- [int] Value of tile x on tileset.
	// * yTile	- [int] Value of tile y on tileset.
	encodeTile( xTile, yTile ) {
		// Determine which block this tile belongs to
		const block		= Math.floor( xTile/this.tileWrap );	// 16-column block
		const localX	= xTile % this.tileWrap;				// X coordinate within the block
		// Compute the scan-line index within the block (row-major order)
		const offset	= (yTile*this.tileWrap) + localX;		// Tile's position in the block
		// Compute the final global index in scan-line format
		const index		= (block*this.tileBlock) + offset;		// Global tile index
		// Convert to base-64 encoding
		const char1		= this.charset[ Math.floor(index/64) ];
		const char2		= this.charset[ index%64 ];
		// Return the encoded 2-character tile code
		return char1 + char2;
	}

	// Decodes a 2-character tile code into a tile index.
	// RETURNS: [int] The decoded tile index.
	// * tileCode	- [string] 2-character tile code.
	decodeTile( code ) {
		// Decode the 12-bit number (0-4095)
		const index		= this.charset.indexOf(code[0]) * 64 + this.charset.indexOf(code[1]);
		// There are 512 tiles per block (16 columns x 32 rows)
		const block		= Math.floor( index/this.tileBlock );				// determine which block chunk the tile is in
		const offset	= index % this.tileBlock;							// remainder of blockwrap = index in new block
		// Within a block, tiles are laid out row-major (left-to-right, then next row)
		const xTile		= (offset%this.tileWrap) + (block*this.tileWrap);	// x increases across blocks
		const yTile		= Math.floor( offset/this.tileWrap );
		// Return tile data
		return { ts:0, tx: xTile, ty: yTile, c: code };
	}

	//-------------------------
	// Row Parsing
	//-------------------------
	// Parses a single board row's tile data.
	// RETURNS: [array<int>] Array of tile indices.
	// * dataString	- [string] Concatenated tile codes.
	// * width		- [int] Expected number of tiles in the row.
	parseBoardRow( dataString, width ) {
		// Ensure tile data is complete.
		const expectedLength = width * 2;
		if ( dataString.length<expectedLength ) {
			throw new Error( `Board row tile data too short. Expected ${expectedLength}, got ${dataString.length}` );
		}
		// Decode tile codes.
		const rowTiles = [];
		for ( let i=0; i<expectedLength; i+=2 ) {
			const tileCode = dataString.substr( i, 2 );
			try {
				const index	= this.decodeTile( tileCode );
				rowTiles.push( index );
				//rowTiles.push( this.tileIndexToXY(index) );
			} catch ( e ) {
				console.error( `Error decoding tile at index ${i/2}:`, e );
				rowTiles.push( -1 ); // Default to an invalid tile index.
			}
		}
		return rowTiles;
	}

	//-------------------------
	// NW File Parsing
	//-------------------------
	// Parses the provided `.nw` file content.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * fileContent	- [string] The raw text content of the `.nw` file.
	parse( { data: fileContent } ) {
		// Begin declarations
		const lines = fileContent.split( /\r?\n/ ); // Normalize line breaks.
		const result = {
			version:	null,	// Game version identifier.
			board:		[],		// Board tiles [array<array<int>>].
			links:		[],		// Link objects [array<object>].
			signs:		[],		// Sign objects [array<object>].
			npcs:		[]		// NPC objects [array<object>].
		};
		// Declare reusable counter variable
		let i = 0;
		//-------------------------
		// Extract Version
		//-------------------------
		// The first non-empty line is assumed to be the version identifier.
		while ( i<lines.length && lines[i].trim()==='' ) i++;
		if ( i<lines.length && !/^(BOARD|LINK|SIGN|NPC)/.test(lines[i]) ) {
			result.version = lines[i].trim();
			i++;
		}

		//-------------------------
		// Parse Map Contents
		//-------------------------
		while ( i<lines.length ) {
			let line = lines[i].trim();
			if ( line==='' ) {
				i++;
				continue;
			}

			//-------------------------
			// BOARD Parsing
			//-------------------------
			if ( line.startsWith( 'BOARD' ) ) {
				const tokens = line.split(/\s+/);
				if ( tokens.length<6 ) {
					console.warn( `Invalid BOARD line: ${line}` );
					i++;
					continue;
				}
				const rowIndex	= parseInt( tokens[2], 10 );
				const width		= parseInt( tokens[3], 10 );
				const tileData	= tokens.slice(5).join(''); // Handle potential spaces.

				try {
					const rowTiles = this.parseBoardRow( tileData, width );
					result.board[rowIndex] = rowTiles;
				} catch ( e ) {
					console.error( `Error parsing BOARD row ${rowIndex}:`, e );
				}
				i++;
				continue;
			}

			//-------------------------
			// LINK Parsing
			//-------------------------
			if ( line.startsWith('LINK') ) {
				const tokens = line.split( /\s+/ );
				if ( tokens.length<8 ) {
					console.warn( `Invalid LINK line: ${line}` );
					i++;
					continue;
				}
				const linkObj = {
					target:	tokens[1],
					x:		parseFloat( tokens[2] ),
					y:		parseFloat( tokens[3] ),
					w:		parseFloat( tokens[4] ),
					h:		parseFloat( tokens[5] )
				};

				// Determine whether the last tokens indicate alignment or destination.
				if ( isNaN( parseFloat(tokens[6]) ) ) {
					linkObj.align	= tokens[6];
					linkObj.offset	= parseFloat( tokens[7] );
				} else {
					linkObj.desx	= parseFloat( tokens[6] );
					linkObj.destY	= parseFloat( tokens[7] );
				}
				result.links.push( linkObj );
				i++;
				continue;
			}

			//-------------------------
			// SIGN Parsing
			//-------------------------
			if ( line.startsWith('SIGN') && line!=='SIGNEND' ) {
				const tokens = line.split( /\s+/ );
				if ( tokens.length<3 ) {
					console.warn( `Invalid SIGN header: ${line}` );
					i++;
					continue;
				}
				const x	= parseFloat( tokens[1] );
				const y	= parseFloat( tokens[2] );
				i++;

				let textLines = [];
				while ( i<lines.length && lines[i].trim()!=='SIGNEND' ) {
					textLines.push( lines[i] );
					i++;
				}
				if ( i<lines.length && lines[i].trim()==='SIGNEND' ) i++;

				result.signs.push( { x, y, text: textLines.join('\n') } );
				continue;
			}

			//-------------------------
			// NPC Parsing
			//-------------------------
			if ( line.startsWith( 'NPC' ) && line!=='NPCEND' ) {
				const tokens = line.split(/\s+/);
				if ( tokens.length<4 ) {
					console.warn( `Invalid NPC header: ${line}` );
					i++;
					continue;
				}
				const npcId	= tokens[1]==='-' ? null : tokens[1];
				const x		= parseFloat( tokens[2] );
				const y		= parseFloat( tokens[3] );
				i++;

				let codeLines = [];
				while ( i<lines.length && lines[i].trim()!=='NPCEND' ) {
					codeLines.push( lines[i] );
					i++;
				}
				if ( i<lines.length && lines[i].trim()==='NPCEND' ) i++;

				result.npcs.push( { id:npcId, x, y, code:codeLines.join('\n') } );
				continue;
			}

			// Unrecognized lines are skipped.
			i++;
		}
		// Return result
		return result; // successfully parsed
	}
}
