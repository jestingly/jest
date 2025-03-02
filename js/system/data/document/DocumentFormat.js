console.log( 'jestAlert: js/data/documents/DocumentFormat.js loaded' );

//-------------------------
// DocumentFormat Class
//-------------------------
class DocumentFormat {
	// Properties
	raw			= null; 			// [...] Raw source data
	mime		= null;				// [string] File type (e.g., png, txt)

	//-------------------------
	// Methods
	//-------------------------
	// Encode raw data (default: store as-is)
	// * data    - [...] Raw file data
	// RETURNS: [bool] Success state
	encode( data ) {
		this.raw = data;
		return true;
	}
}
