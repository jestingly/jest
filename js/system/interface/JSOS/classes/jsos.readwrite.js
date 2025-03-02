console.log( 'jestAlert: js/system/interface/JSOS/classes/JSOSReadWrite.js loaded' );

class JSOSReadWrite extends JSOSValidation {
	// Determine location of storage (based on browser)
	storage		= null;			// browser storage [object] for saving/reading data

	// Creates the class [object] with configurable components.
	// RETURNS: [object] A new instance.
	// * options		- [object] Configuration options for the class [object].
	constructor( options={} ) {
		super(); // call parent constructor
		// Keep reference to the browser storage [object]
		this.storage		= ( typeof browser!=="undefined" ) ? browser.storage : chrome.storage;
	}

	// Stores saved data.
	// RETURNS: [promise] resolve or reject value.
	// * key		- [string] Value of data variable to store.
	writeData( key, val ) {
		return new Promise(
			( resolve, reject ) => {
				this.storage.local.set(
					{ [key]: val },
					() => {
						if ( chrome.runtime.lastError ) {
							reject( chrome.runtime.lastError );
						}
						else {
							console.log( `jestAlert: writeData() '${key}' saved!` );
							resolve( true ); // Resolve with true
						}
					});
			});
	}

	// Retrieves saved data.
	// RETURNS: [...] Requested saved data.
	// * key		- [string] Value of saved data to retrieve.
	readData( key ) {
		return new Promise(
			( resolve, reject ) => {
		        this.storage.local.get(
					[ key ],
					( result ) => {
						if ( chrome.runtime.lastError ) {
							reject( chrome.runtime.lastError ); // Reject if there's an error
						}
						else {
							const data = result[ key];
							console.log( `jestAlert: readData() '${key}' saved!` );
							resolve( data ); // Resolve with the value of the property
						}
					});
		    });
	}
}
