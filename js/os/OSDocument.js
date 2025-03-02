console.log( 'jestAlert: js/os/OSDocument.js loaded' );

//-------------------------
// OSDocument Class
//-------------------------
class OSDocument extends OSObject {
	// Properties
	format		= null;				// [object] DocumentFormat instance attached to this file
	lid			= null;				// [int] Library folder record ID (document container)
	folder		= false;			// [bool] Whether the file is a folder
	thumb		= null;				// [string] Path to the thumbnail image
	method		= null;				// [string] Active stream type (e.g., download, upload)
	status		= {};				// [object] Status of file operations
	// HTTP Information
	url			= null;				// [string] value of image URL

	//-------------------------
	// Constructor
	//-------------------------
	// Creates the class [object] with configurable components.
	// RETURNS: [object] A new instance.
	// * options		- [object] Configuration options for the class [object].
	constructor( options={} ) {
		super( options ); // call parent constructor
		this.resetStatus();
	}

	// Reset file status to idle
	// RETURNS: [void]
	resetStatus() {
		const statuses = [ 'file', 'load', 'download', 'upload', 'delete' ];
		statuses.forEach(
			status => {
				this.setMode( status, 'idle' );
			});
	}

	//-------------------------
	// Utility Methods
	//-------------------------
	// Stream a file operation
	// * method    - [string] Operation to perform (e.g., download)
	// RETURNS: [bool] Success state
	stream( method ) {
		if ( this.folder ) return false; // Cannot stream a folder
		let mode	= this.getMode( 'file' );
		if ( mode!=='idle' ) {
			console.error( 'File is already streaming.' );
			return false;
		}
		// Switch the status of the file
		this.setMode( 'self', 'streaming' );
		this.method	= method;
		console.log( `Streaming method: ${method}` );
		return true;
	}

	// Reset the file after an operation
	// RETURNS: [void]
	reset() {
		this.setMode( 'self', 'idle' );
		this.method	= null;
	}

	// Attach a format to the file
	// * format    - [object] DocumentFormat instance
	// RETURNS: [bool] Success state
	form( format ) {
		if ( !(format instanceof DocumentFormat) ) {
			console.error( 'Invalid format provided.' );
			return false;
		}
		this.format	= format;
		return true;
	}
}
