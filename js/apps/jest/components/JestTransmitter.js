console.log( 'jestAlert: js/apps/jest/components/JestTransmitter.js loaded' );

//-------------------------
// JestTransmitter Class
//-------------------------
class JestTransmitter {
	// Transmission propert(ies)
	transmissions		= [];				// [array] Transmission [objects] handling request(s)
	results				= null;				// { url: { blob, parsed, objectURL, responseType, expiresAt, strict } }
	pendingLoads		= new Map();		// Tracks in-progress requests to prevent duplicate loading
	defaultCacheTime	= 0;				// Default expiration time
	strictItems			= null;				// URLs that should never be removed unless explicitly requested


	//-------------------------
	// Instantiation
	//-------------------------
	// Construct the [object].
	// RETURNS: [void].
	constructor( defaultCacheTime=600000 ) { // Default: 10 minutes (in milliseconds)
		this.transmissions		= [];					// [array] Transmission [objects]
		this.results			= new Map();			// { url: { blob, parsed, objectURL, responseType, expiresAt, strict } }
		this.pendingLoads		= new Map();			// Tracks ongoing loads to prevent duplicates
		this.defaultCacheTime	= defaultCacheTime;		// Default expiration time
		this.strictItems		= new Set();			// URLs that should never be removed unless explicitly requested
	}

	//-------------------------
	// Transmission Handling
	//-------------------------
	// Gather and process multiple file requests in batches
	// This function handles fetching multiple files in parallel while leveraging caching
	// to avoid redundant network requests.
	// * files		- [Array] Array of objects { url: [string], responseType: [string] }
	// * batchSize	- [Number] Number of files to process simultaneously (default: 5)
	// * cacheTime	- [Number] Duration (in ms) to cache the response (default: this.defaultCacheTime)
	// * strict		- [Boolean] If true, prevents the cache from being forcefully cleared
	// RETURNS: [void] (Updates internal cache)
	async loadFiles( files, batchSize=5, cacheTime=this.defaultCacheTime, strict=false ) {
		const now	= Date.now(); // Capture the current timestamp
		// Iterate through the file list in chunks of batchSize
		for ( let i=0; i<files.length; i+=batchSize ) {
			const batch		= files.slice( i, i+batchSize ); // Extract the current batch
			// Process each file in the batch concurrently using Promise.all
			const results	=
				await Promise.all(
					batch.map(
						async file => {
							// Check if the file exists in cache and is still valid
							const cached = this.results.get( file.url );
							if ( cached && cached.expiresAt>now ) {
								console.log( `Cache hit: ${file.url}` );	// Log cache usage
								return cached;								// Return cached result
							}
							// If file is already being fetched, return the same promise
							if ( this.pendingLoads.has(file.url) ) {
								console.log( `Waiting for ongoing load: ${file.url}` );
								return await this.pendingLoads.get( file.url );
							}
							// Otherwise, fetch the file and store the promise in pendingLoads
							const loadPromise	=
								this.loadFile(file).finally(
									() => {
										this.pendingLoads.delete( file.url ); // Remove from pending on completion
									});
							// If not cached or expired, fetch the file
							this.pendingLoads.set( file.url, loadPromise );
							return await loadPromise;
						})
					);
			// Store results for later retrieval (commented out)
			//this.results.push( ...results );
		}
		//onsole.log( this.results ); // Log all results for debugging
	}

	// Load a file either from cache (if valid) or by making a new request
	// * file		- [Object] { url: [string], responseType: [string] }
	// * cacheTime	- [Number] Duration (in ms) to cache the response (default: this.defaultCacheTime)
	// * strict		- [Boolean] If true, prevents the cache from being forcefully cleared
	async loadFile( file, cacheTime=this.defaultCacheTime, strict=false ) {
		//const cacheTime		= file.cacheTime ?? this.defaultCacheTime;
		//const strict		= file.strict ?? false;
		const now	= Date.now(); // Capture current timestamp
		// Check if the requested file is already cached and not expired
		if ( this.results.has(file.url) ) {
			const cached	= this.results.get( file.url );
			if ( cached.expiresAt>now ) {
				// If responseType is not defined, return cached result as-is
				if ( !file.responseType ) {
					console.log( `Using cached file (no type check): ${file.url}` );
					return cached;
				}
				// If responseType is defined but mismatches, throw an error and return false
				if ( cached.responseType!==file.responseType ) {
					console.error( `Response type mismatch for ${file.url}. Expected: ${file.responseType}, Cached: ${cached.responseType}` );
					return false;
				}
				// Log cache hit
				console.log( `Using cached file: ${file.url}` );
				return cached; // return cached data
			}
		}
		// If already loading, return existing promise
		if ( this.pendingLoads.has(file.url) ) {
			console.log( `Waiting for ongoing load: ${file.url}` );
			return await this.pendingLoads.get( file.url );
		}
		// If the file is not in cache or is expired, create a new inquiry request
		const inquiry	= new Inquiry( file.url, 'FETCH', 'GET', 'download', 'file', null, file.responseType );
		// Send the inquiry request and return the fetched file data
		return this.sendInquiry( inquiry, cacheTime, strict );
	}

	// Handles the network request, processes the response, and stores it in cache
	// * inquiry	- [Object] Inquiry request object containing file details
	// * cacheTime	- [Number] How long to store the file in cache (in ms)
	// * strict		- [Boolean] If true, prevents certain files from being forcefully flushed
	async sendInquiry( inquiry, cacheTime, strict ) {
		const transmission	= new Transmission();		// Create a new transmission instance
		this.transmissions.push( transmission );		// Add to active transmissions
		try {
			await transmission.send( inquiry );			// Perform the file request
			// Extract response details from the inquiry object
			const { url, responseType, parsed } = inquiry;
			const blob		= parsed instanceof Blob ? parsed : null;		// Store Blob if applicable
			const objectURL	= blob ? URL.createObjectURL(blob) : null;		// Generate an object URL if needed
			// Determine when the cache entry should expire
			const expiresAt	= cacheTime>0 ? Date.now()+cacheTime : Infinity;
			// Mark the file as "strict" if applicable (prevents forced removal)
			if ( strict ) this.strictItems.add( url );
			// Store the fetched data in the cache
			const cache		= { blob, parsed, objectURL, responseType, expiresAt, strict };
			this.results.set( url, cache );
			return cache; // Return the processed response
		}
		catch ( error ) {
			console.error( `Error with URL: ${inquiry.url}`, error ); // Log network errors
		}
		finally {
			// Remove the completed transmission from active list
			this.transmissions = this.transmissions.filter( t => t!==transmission );
		}
	}

	//-------------------------
	// Cached Data Handling
	//-------------------------
	// Retrieves one or multiple files from cache if they exist and are not expired.
	// * urls	- [Array/String] A single URL (string) or an array of URLs to retrieve.
	// RETURNS: [Object | Array | null] Cached file object(s) or null if not found.
	// FILE OBJECT STRUCTURE:
	// {
	//   blob: [Blob|null],			// The raw file data as a Blob (if applicable)
	//   parsed: [Any],				// The parsed file data
	//   objectURL: [String|null],	// A generated object URL for usage in DOM (if applicable)
	//   responseType: [String],	// The type of response (e.g., 'json', 'blob', 'text')
	//   expiresAt: [Number],		// Timestamp indicating when the cache entry expires
	//   strict: [Boolean]			// Whether the file is protected from automatic cache flushing
	// }
	getFiles( urls ) {
		const now = Date.now(); // Current timestamp
		// Handle single URL input
		if ( typeof urls==='string' ) {
			const file	= this.results.get( urls );
			return file && file.expiresAt>now ? file : null;
		}
		// Handle multiple URLs input
		if ( Array.isArray(urls) ) {
			return urls
				.map(
					url => {
						const file	= this.results.get( url );
						return file && file.expiresAt>now ? file : null;
					})
					.filter( file => file!==null ); // Remove null entries (i.e., non-cached files)
		}
		return null; // Invalid input type
	}

	// Clears expired cache entries or removes all cached files based on options
	// * removeAll	- [Boolean] If true, removes all cached items
	// * force		- [Boolean] If true, allows forced removal of "strict" items
	flushCache( { removeAll=false, force=false }={} ) {
		const now	= Date.now(); // Capture current timestamp
		// Iterate through cached items
		this.results.forEach(
			( value, url ) => {
				if ( removeAll ) {
					// Check if the item is marked as "strict" and should be skipped
					if ( this.strictItems.has(url) && !force ) {
						console.log( `Skipping strict item: ${url}` );
						return;
					}
					// Remove the item from the strict set if forced
					this.strictItems.delete( url );
					this.results.delete( url );
					// Revoke associated object URL if applicable
					if ( value.objectURL )
						URL.revokeObjectURL( value.objectURL );
				}
				else if ( value.expiresAt<=now ) {
					// Remove expired cache entries
					this.results.delete( url );
					if ( value.objectURL )
						URL.revokeObjectURL( value.objectURL );
				}
			});
		// Log the status of the cache after the cleanup process
		console.log( `Cache flushed. Strict items kept: ${Array.from(this.strictItems).length}` );
	}

	// Removes a specific file from cache, with optional strict override
	// * url	- [String] File URL to remove from cache
	// * force	- [Boolean] If true, forces removal even if the file is marked as "strict"
	removeFromCache( url, force=false ) {
		// Check if cache is available
		if ( this.results.has(url) ) {
			const item	= this.results.get( url ); // access cache
			// Prevent removal if the item is "strict" and force is not enabled
			if ( this.strictItems.has(url) && !force ) {
				console.log( `Cannot remove strict cache item: ${url}` );
				return false;
			}
			// Remove the file from cache and strict list
			this.results.delete( url );
			this.strictItems.delete( url );
			// Revoke associated object URL if applicable
			if ( item.objectURL )
				URL.revokeObjectURL( item.objectURL );
			console.log( `Cache item removed: ${url}` ); // Log removal action
			return true;
		}
		return false; // Return false if the file was not found in cache
	}
}
