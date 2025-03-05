console.log( 'jestAlert: js/apps/jest/components/tileset/JestTileset.js loaded' );

//-------------------------
// JestTileset Class
//-------------------------
class JestTileset extends JestSavable {
	// Declare properties
	default			= 'pics1';			// [string] Default tileset.
	// Object properties
	image			= null;				// [object] ElementImage of loaded image
	tiledefs		= null;				// [object] JestTiledefs used to define tileset tile properties.

	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct the [object].
	// * client		- [object] Application client that this piece belongs to.
	// * name		- [string] Value of overworld tileset (e.g. 'pics1').
	constructor( client, name ) {
		// Call the parent application constructor
		super( client, name );			// construct the parent
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
		// Try to load & set the image
		try { await this._setImage(this.name); }	// set tileset image
		catch( err ) { throw err; }
		// Try to load & set the tiledefs
		try { await this._setTiledefs(this.name); }	// set tiledefs
		catch( err ) { throw err; }
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

	//-------------------------
	// Definition Methods
	//-------------------------
	// Load & set the image.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * filename	- [string] Value of URL filename to load, without filetype (e.g. 'pics1')
	async _setImage( filename ) {
		// Validate argument(s)
		if ( !jsos.prove(filename,'string') ) {
			throw new Error( `Argument "filename" must be of type [string].` );
		}
		filename	= filename ?? this.default;		// store filename (NOTE: file load handled separately)
		// --------------------------------
		// Load Image
		// --------------------------------
		// Try loading tileset image into gallery
		await this.client.gallery.loadImages([
			{ category: 'TILESET', filename: filename, filetype: 'PNG' }
			])
			.then(
				() => {
					console.log( `Tileset '${filename}' image successfuly loaded!` );
					this.setName( filename ); // store filename [string]
					// Attempt to get the asset
					const asset		= this.client.gallery.getAsset( 'TILESET', filename );
					// Set the asset as the current image
					this.image		= asset;
				})
			.catch( (err) => console.error(`Tileset "${filename}" image could not be loaded: ${err}`) );
		return true; // success
	}

	// Load & set the tileset definitions.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * filename	- [string] Value of URL filename to load, without filetype (e.g. 'pics1')
	async _setTiledefs( filename ) {
		// Validate argument(s)
		if ( !jsos.prove(filename,'string') )
			throw new Error( `Argument 'filename' must be of type [string].` );
		filename		= filename ?? this.default;		// store filename (NOTE: file load handled separately)
		// Load tile definitions *.tdefs file
		await this.client.filer.loadFile( 'tiledefs', filename )
			.catch(
				( err ) => {
					throw new Error( `Not all tiledefs were loaded: ${err.message}` );
				});
		// Create the tileset definitions [object]
		const data		= this.client.filer.files.tiledefs[filename];
		const tiledefs	= new JestTiledefs();	// create new JestTiledefs [object]
		tiledefs.render( data.defs );			// load data into JestTiledefs [object]
		this.tiledefs	= tiledefs;				// cross-ref JestTiledefs [object]
		return true; // success
	}
}
