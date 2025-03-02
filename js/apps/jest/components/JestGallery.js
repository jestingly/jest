console.log( 'jestAlert: js/apps/jest/components/JestGallery.js loaded' );

//-------------------------
// JestGallery Class
//-------------------------
// Manages image assets, including categories, loading, and preloading.
class JestGallery extends JestGamepiece {
	categories			= {};				// [Object] Stores categories with folders, assets, and placeholders.
	baseURL				= null;				// Set the base URL which will contain the category folders.
	globalPlaceholder	= null;				// Set the global placeholder.
	maxRetries			= 3;				// Set the maximum retry attempts.
	progress			= {};				// [Object] Tracks asset loading progress.

	//-------------------------
	// Constructor
	//-------------------------
	// Initializes JestGallery with a default base URL, placeholder, & retry limit.
	// * game				- Game [object] that this piece belongs to.
	// * baseURL			- [string] Base URL for all image(s) / image folder(s).
	// * globalPlaceholder	- [string] Default placeholder image URL for all categories.
	// * maxRetries         - [number] Max retry attempts for failed assets.
	constructor( game, baseURL=null, globalPlaceholder='images/placeholder.png', maxRetries=3 ) {
		super( game ); // construct the parent			// Call the parent constructor.
		this.baseURL			= baseURL;				// Set the global placeholder.
		this.globalPlaceholder	= globalPlaceholder;	// Set the global placeholder.
		this.maxRetries			= maxRetries;			// Set the maximum retry attempts.
		this.progress			= { total: 0, loaded: 0, failed: 0 };
	}

	//-------------------------
	// Public Methods
	//-------------------------
	// Registers a new asset category.
	// * category			- [string] Name of the category (e.g., 'heads').
	// * folder				- [string] Path to the category's folder.
	// * placeholderUrl		- [string|null] Optional placeholder for this category.
	registerCategory( category, folder, placeholderUrl=null ) {
		// Create category if it does not exist already
		if ( !this.categories[category] ) {
			// Add category details with assets and placeholder.
			const placeholder	= placeholderUrl || this.globalPlaceholder;
			this.categories[category] = {
				folder,							// Folder path for this category.
				placeholderUrl: placeholder,	// Use specific or global placeholder.
				assets: new Map()				// Store assets using a Map for quick lookups.
			};
			console.log( `Category "${category}" registered with folder "${folder}".` );
		}
		// Warn if the category is already registered.
		else console.warn( `Category "${category}" is already registered.` );
	}

	// Adds an asset to an existing category.
	// * category	- [string] Name of the category.
	// * id			- [string] Unique identifier for the asset.
	// * filename	- [string] Filename of the asset (e.g., 'head104.gif').
	addAsset( category, id, filename ) {
		const categoryData = this.categories[category]; // Get category data.
		// Warn if the category does not exist.
		if ( !categoryData ) {
			console.warn( `Category "${category}" is not registered.` );
			return;
		}
		// Extract folder and assets.
		const { folder, assets } = categoryData;
		// Warn if the asset ID already exists.
		if ( assets.has(id) ) {
			console.warn( `Asset with ID "${id}" already exists in category "${category}".` );
			return;
		}
		// Create asset inside category
		const url	= `${this.baseURL}/${folder}/${filename}`;		// Construct the asset URL.
		assets.set( id, { filename, url, element: null } );					// Add asset details (lazy-load `element`).
		this.progress.total++;												// Increment total assets for progress tracking.
		console.log( `Asset "${id}" added to category "${category}".` );
	}

	// Retrieves an asset, lazily loading it if not already loaded.
	// RETURNS: [ElementImage|null] Asset or null if not found.
	// * category	- [string] Name of the category.
	// * id			- [string] Unique ID of the asset.
	getAsset( category, id ) {
		const categoryData = this.categories[category]; // Get category data.
		// Warn if the category does not exist.
		if ( !categoryData ) {
			console.warn( `Category "${category}" does not exist.` );
			return null;
		}
		const asset = categoryData.assets.get( id ); // Get the asset by ID.
		// Warn if the asset is not found in the category.
		if ( !asset ) {
			console.warn( `Asset with ID "${id}" not found in category "${category}".` );
			return null;
		}
		// Lazily create the ElementImage instance if not already created.
		if ( !asset.element ) {
			asset.element = new ElementImage( { attributes: { src: asset.url } } );
			console.log( `Asset "${id}" in category "${category}" attempting to lazy load.` );
		}
		// Return the loaded asset.
		return asset.element;
	}

	// Unregisters and removes an entire category and all its assets.
	// RETURNS: [boolean] True if the category was successfully removed, false if it did not exist.
	// * category - [string] Name of the category to remove.
	unregisterCategory( category ) {
		// Retrieve category data
		const categoryData	= this.categories[category];
		if ( !categoryData ) {
			console.warn( `Category "${category}" does not exist.` );
			return false;
		}
		// Remove category and adjust total asset count
		const assetCount	= categoryData.assets.size;
		delete this.categories[category];
		this.progress.total -= assetCount;
		console.log( `Category "${category}" and its ${assetCount} assets have been removed.` );
		return true;
	}

	// Unregisters and removes a single asset from a specified category.
	// RETURNS: [boolean] True if the asset was successfully removed, false if the asset or category did not exist.
	// * category - [string] Name of the category containing the asset.
	// * id       - [string] Unique identifier of the asset to remove.
	unregisterAsset( category, id ) {
		// Retrieve category data
		const categoryData	= this.categories[category];
		if ( !categoryData ) {
			console.warn( `Category "${category}" does not exist.` );
			return false;
		}
		// Retrieve asset data
		const asset	= categoryData.assets.get(id);
		if ( !asset ) {
			console.warn( `Asset with ID "${id}" does not exist in category "${category}".` );
			return false;
		}
		// Remove asset and decrement total asset count
		categoryData.assets.delete( id );
		this.progress.total--;
		console.log( `Asset "${id}" from category "${category}" has been removed.` );
		return true;
	}

	//-------------------------
	// Preloading Method(s)
	//-------------------------
	// Logs the current progress of asset loading.
	// RETURNS: [void].
	trackProgress() {
		console.log( `Progress: ${this.progress.loaded}/${this.progress.total} assets loaded, ${this.progress.failed} failed.` );
	}

	// Preloads all assets in the specified category.
	// RETURNS: [Promise] Resolves when preloading is complete.
	// * category	- [string] Name of the category to preload.
	preloadCategory( category ) {
		const categoryData = this.categories[category]; // Get category data.
		// Warn if the category does not exist.
		if ( !categoryData ) {
			console.warn( `Category "${category}" does not exist.` );
			return Promise.resolve();
		}
		// Collect promises for preloading.
		const preloadPromises = [];
		categoryData.assets.forEach(
			( asset, id ) => {
				if ( !asset.element ) {
					// Lazily create ElementImage and preload it.
					const element	= new ElementImage( { attributes: { src: asset.url } } );
					asset.element	= element;	// Assign to the asset.
					const promise	= this._preloadAsset( element, asset.url, id, category );
					preloadPromises.push( promise );
				}
			});

		// Wait for all preloading promises to settle.
		return Promise.allSettled(preloadPromises).then(
			( results ) => {
				const successes		= results.filter( (r)=>r.status==='fulfilled' ).length;		// Count successful loads.
				const failures		= results.filter( (r)=>r.status==='rejected' ).length;		// Count failed loads.
				this.trackProgress(); // Log progress.
				console.log( `Preloading completed for category "${category}": ${successes} assets loaded, ${failures} assets failed.` );
			});
	}

	// Preloads a single asset with retry logic.
	// RETURNS: [Promise] Resolves or rejects based on success.
	// * element		- [ElementImage] Instance representing the image.
	// * url			- [string] Asset URL.
	// * id				- [string] Unique ID of the asset.
	// * category		- [string] Name of the asset's category.
	// * attempt		- [number] Current retry count (default: 0).
	_preloadAsset( element, url, id, category, attempt=0 ) {
		return new Promise(
			( resolve, reject ) => {
				const img	= element.el;		// Get the actual <img> element
				// Asset loaded successfully.
				img.onload	= () => {
					this.progress.loaded++;		// Increment loaded count.
					console.log( `Preloaded asset "${id}" in category "${category}".` );
					resolve();					// Resolve the promise.
				};
				// Handle asset load failure.
				img.onerror	= () => {
					if ( attempt<this.maxRetries ) {
						// Retry if attempts remain.
						console.warn( `Retrying asset "${id}" in category "${category}" (attempt ${attempt+1}/${this.maxRetries}).` );
						// Ensures retries propagate correctly
						return new Promise(
							( res, rej ) => {
								setTimeout(
									() => {
										this._preloadAsset( element, url, id, category, attempt+1 )
											.then( resolve )		// Properly propagate resolve
				                        	.catch( reject );		// Properly propagate reject
									}, 1000 );						// Delay before retrying.
							}).then(resolve).catch(reject);			// Ensures outer promise also resolves/rejects
					}
					else { // Use placeholder after retries are exhausted.
						// Prevent placeholder retry loops
						if ( !this.failedAssets )
							this.failedAssets = new Set();
						if ( !this.failedAssets.has(id) ) {
							this.failedAssets.add( id );
							console.warn( `Failed to preload asset "${id}" in category "${category}" after ${this.maxRetries} attempts.` );
						}
						// Remove image
						img.onload		= null;
						img.onerror		= null;
						img.src			= `${this.baseURL}/${this.categories[category].placeholderUrl}`;
						this.progress.failed++;						// Increment failed count.
						reject( new Error(`Asset "${id}" failed to load after ${this.maxRetries} attempts.`) );	// Reject the promise.
					}
				};
				// Start loading the image.
				img.src = url;
			});
	}

	// --------------------------------
	// Image Handling
	// --------------------------------
	// Load multiple images dynamically using a single object argument.
	// RETURNS: [boolean] `true` if all images load successfully, `false` if any fail.
	// * assets		- [object] where keys are folder names & values are [arrays] of { filename, filetype }
	async loadImages( assets ) {
		// Validate argument(s)
		if ( !Array.isArray(assets) ) {
			console.warn( 'Invalid assets format. Expected an array.' );
			return false;
		}
		// Queue each image
		assets.forEach(
			( { category, filename, filetype='PNG' } ) => {
				this.queueImage( category, filename, filetype );
			});
		// Get unique categories and preload them
		const categories = [ ...new Set( assets.map(asset=>asset.category) ) ];
		const preloadPromises = categories.map(
			category =>
				this.preloadCategory(category)
					.then( () => console.log(`All assets in "${category}" preloaded.`) )
					.catch( () => console.warn(`Not all assets in "${category}" preloaded.`) )
			);
		// Wait for all preloads to complete
		await Promise.allSettled( preloadPromises );
		return true;
	}

	// Queue an image asset to store as an ElementImage [object].
	// RETURNS: [boolean] `true` on success, `false` if fail.
	// * folder			- [string] value of image folder (eg. gallery category, the folder name mask).
	// * filename		- [string] value of filename.
	// * filetype		- [string] value of file filetype.
	queueImage( folder, filename, filetype='PNG' ) {
		// Construct the full filename
		filetype	= filetype.toLowerCase();
		const url	= `${filename}.${filetype}`;
		// Add full filename to category, or folder mask, using filename as label
		this.addAsset( folder, filename, url );
		return true;
	}
}
