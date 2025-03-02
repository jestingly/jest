console.log( 'jestAlert: js/apps/jest/components/JestTiledefs.js loaded' );

//-------------------------
// JestTiledefs Class
//-------------------------
class JestTiledefs extends JestSavable {
	// Object properties
	defs			= null;				// [object] of tileset definitions.

	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct the [object].
	// * client		- [object] Application client that this piece belongs to.
	// * name		- [string] Value of overworld tileset (e.g. 'pics1').
	constructor( client, name ) {
		// Call the parent application constructor
		super( client, name );			// construct the parent
		// Ensure defs is a Set
		this.defs		= new Set();	// setup initial data type
	}

	//-------------------------
	// Initialization Methods
	//-------------------------
	// Setup the [object].
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
		return true; // success
	}

	// Build the object.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	build() {
		return true; // success
	}

	//-------------------------
	// Data Handling
	//-------------------------
	// Load the data [object].
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
		//this.client.gameboard.tilesets[this.name] = this; // store reference in stack [object]
		return true;		// success
	}

	// Receive and store parsed tile definitions.
	// * defs		- [object] Parsed definition loaded ata, categorized by type.
	render( defs ) {
		if ( !jsos.prove(defs,'object') )
			throw new Error( 'Invalid parsed defs. Must be an object.' );
		// Iterate through parsed defs and use existing methods.
		for ( let type in defs ) {
			this.addDefType( type );					// Ensure type exists.
			console.log( defs );
			this.addDefTileCodes( type, defs[type] );		// Add tile codes.
		}
	}

	//-------------------------
	// Definition Methods
	//-------------------------
	// Add a new definition type or types.
	// * typeOrTypes	- [string|array] Single definition type or multiple types.
	addDefType( typeOrTypes ) {
		if ( jsos.prove(typeOrTypes,'string') )
			typeOrTypes = [typeOrTypes];	// Convert single type to array.
		if ( !jsos.prove(typeOrTypes,'array') )
			throw new Error( 'Invalid definition type(s). Must be a string or an array of strings.' );
		// Register definition types.
		for ( let type of typeOrTypes ) {
			if ( !jsos.prove(type,'string') )
				throw new Error( `Invalid type: ${type}. Must be a string.` );
			if ( !this.defs[type] )
				this.defs[type] = new Set();
		}
	}

	// Remove an existing definition type or types.
	// * typeOrTypes	- [string|array] Single definition type or multiple types.
	removeDefType( typeOrTypes ) {
		if ( jsos.prove(typeOrTypes,'string') )
			typeOrTypes = [typeOrTypes];	// Convert single type to array.
		if ( !jsos.prove(typeOrTypes,'array') )
			throw new Error( 'Invalid definition type(s). Must be a string or an array of strings.' );
		// Remove definition types.
		for ( let type of typeOrTypes )
			delete this.defs[type];
	}

	// Add tile codes to an existing definition type.
	// * type		- [string] Definition type to add tile codes to.
	// * tileCodes	- [array] Array of index numbers.
	addDefTileCodes( type, tileCodes ) {
		if ( !jsos.prove(type,'string') )
			throw new Error( 'Invalid type. Must be a string.' );
		console.log( tileCodes );
		if ( !jsos.prove(tileCodes,'array') )
			throw new Error( 'Invalid tile codes. Must be an [array] of encoded base-64 [strings].' );
		if ( !this.defs[type] )
			this.defs[type] = new Set();
		// Validate and add tile codes.
		for ( let code of tileCodes ) {
			if ( !jsos.prove(code,'string') || code.length!==2 )
				throw new Error( `Invalid tile code: ${code}. Must be a 2-character base-64 string.` );
			this.defs[type].add( code );
		}
	}

	// Remove specific tile codes from a definition type.
	// * type		- [string] Definition type to remove tile codes from.
	// * tileCodes	- [array] Array of index numbers to remove.
	removeDefTileCodes( type, tileCodes ) {
		if ( !jsos.prove(type,'string') )
			throw new Error( 'Invalid type. Must be a string.' );
		console.log( tileCodes );
		if ( !jsos.prove(tileCodes,'array') )
			throw new Error( 'Invalid tile codes. Must be an [array] of encoded base-64 [strings].' );
		if ( !this.defs[type] ) return;		// Nothing to remove.
		// Remove tile codes if exist
		for ( let code of tileCodes )
			this.defs[type].delete( code );
		// If no tile codes remain, remove the type entirely.
		if ( this.defs[type].size===0 )
		delete this.defs[type];
	}

	//-------------------------
	// Lookups
	//-------------------------
	// Get definitions of a tile code.
	// RETURNS: [Set] of types, or empty Set if none exist.
	// * tileCode	- [string] BASE-64 Tile code to look up.
	getTypesByCode( tileCode ) {
		// Find all types that include this tile code
		const types = new Set();
		for ( let type in this.defs ) {
			if ( this.defs[type].has(tileCode) )
				types.add( type );
		}
		return types;
	}

	// Get definitions of a tile by tilest (x,y) coordinates.
	// RETURNS: [Set] of types, or empty Set if none exist.
	// * x, y		- [int] Tile coordinates in the tileset.
	getTypesByTile( x, y ) {
		// Encode the tile's (x, y) into a base-64 string
		const tileCode = this.client.parsers.levels.encodeTile( x, y );
		// Find all types that include this tile code
		return this.getTypesByCode( tileCode );
	}
}
