console.log( 'jestAlert: js/apps/jest/components/file/JestFiler.js loaded' );

//-------------------------
// JestFiler Class
//-------------------------
// Manages *.* files (downloads, preloading, tileset definition handling).
class JestFiler extends JestGamepiece {
	// Declare properties
	baseURL				= null;				// Set the base URL which will contain the arranged folder(s).
	// Create definition handler object
	filetypes			= null;				// [object] Outlining the filetype loading & parsing specifications.
	// File container(s)
	files				= null;				// [object] Files' data, loaded & parsed.

	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct with a default base URL.
	// * game				- Game [object] that this piece belongs to.
	// * baseURL			- [string] Base URL for all image(s) / image folder(s).
	constructor( game, baseURL=null ) {
		super( game );							// Call the parent constructor.
		this.baseURL	= baseURL;				// Set the global placeholder.
		this.filetypes	= {};					// Define recognized filetype(s)
		this.files		= {};					// Initialize files storage
	}

	// --------------------------------
	// Register Filetype(s)
	// --------------------------------
	// Add a new filetype dynamically.
	// RETURNS: [void] on success, throws [object[ Error on fail.
	// * filetype		- [string] The filetype key (e.g. 'levels').
	// * specs			- [string] The associated filetype specifications:
	//						{ extension, cache, strict }
	addFiletype( filetype, specs ) {
		// Validate argument
		if ( !jsos.prove(filetype,'string') )
			throw new Error( 'Invalid filetype. Both must be of type [string].' );
		// Validate argument
		if ( !specs?.extension?.trim() || !jsos.prove(specs.extension,'string') )
			throw new Error( 'Expected specs.extension must be a valid [string].' );
		// Register filetype.
		this.filetypes[filetype]	= { responseType: 'text', ...specs };
		// Ensure file storage exists for this filetype.
		if ( !this.files[filetype] )
			this.files[filetype]	= {};
	}

	// Remove an existing filetype.
	// RETURNS: [void] on success, throws [object[ Error on fail.
	// * filetype		- [string] The filetype key to remove.
	removeFiletype( filetype ) {
		// Validate argument
		if ( !jsos.prove(filetype,'string') )
			throw new Error( 'Invalid filetype. Must be of type [string].' );
		// Remove associated filetype & storage.
		if ( this.filetypes[filetype] ) {
			delete this.filetypes[filetype];
			delete this.files[filetype];
		}
	}

	// --------------------------------
	// File Handling
	// --------------------------------
	// Retrieves *.* file, parses it, then stores the file by name.
	// RETURNS: [boolean] `true` on success, `false` if any file fails.
	// * filetype	- [string] Name of data file type to load & parse.
	// * name		- [string] value of name of file.
	async loadFile( filetype, name ) {
		return await this.loadFiles( filetype, [name] );
	}

	// Retrieves *.* files, parses them, and stores files by name.
	// RETURNS: [boolean] `true` on success, `false` if any file fails.
	// * filetype	- [string] Value of data filetype to load & parse (e.g. 'level').
	// * names		- [Array] Names of files to load.
	async loadFiles( filetype, names ) {
		// Access methodization data
		const extension		= this.filetypes[filetype]?.extension ?? null;
		if ( !this.filetypes[filetype] ) {
			console.error( `Unrecognized filetype: ${filetype}` );
			return false;
		}
		const cacheTime		= this.filetypes[filetype]?.cacheTime ?? 0;		// cache has no expiration by default
		const strict		= this.filetypes[filetype]?.strict ?? true;		// cache is permanent by default
		const responseType	= this.filetypes[filetype]?.responseType || 'text';
		// Ensure the storage object exists
		this.files			= this.files || {};
		// Determine cachetime &
		// Convert names [array] to an [object] of file request data
		const files			= names.map(
			name => {
				const url	= `${this.baseURL}/${filetype}/${name}.${extension}`;
				return { name, url, type: 'text', cacheTime, strict, responseType };
			});
		// Use transmitter to load files in batches of 3
		await this.client.transmitter.loadFiles( files, 3, cacheTime, strict );
		// Process results
		let success		= true;
		for ( const { name, url } of files ) {
			// Check if file by name already exists
			if ( this.files?.[name] ) continue;
			// Continue to load file
			const file	= this.client.transmitter.getFiles( url );
			//console.log( file );
			if ( !file || !file.parsed ) {
				console.error( `Failed to load '${filetype}': ${name} (${url})` );
				success	= false;
				continue;
			}
			// Further parse file data into game [object]
			const result	= { name, data: file.parsed };
			this.files[filetype][name] = this.client.parsers[filetype].parse( result );
			console.log( `Parsed and stored '${filetype}' object: ${name}` );
		}
		return success; // retrieval & parsing success
	}
}
