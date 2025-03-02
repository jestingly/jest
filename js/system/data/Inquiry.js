console.log( 'jestAlert: js/system/data/Inquiry.js loaded' );

//-------------------------
// Inquiry Class
//-------------------------
// A class for handling a server request.
class Inquiry extends OSCallback {
	// For data & action handling
	url				= null;				// [string] URL endpoint for the transmission.
	iface			= 'HTTP';			// [string] Interface to use for the request (e.g., 'FETCH', 'HTTP').
	method			= 'POST';			// [string] Method for the request (e.g., 'POST', 'GET').
	mime			= null;				// [string] filetype of data to be handled
	// Calibration variables
	action			= null;				// [string] name of action to take: ie. 'load'
	context			= null;				// [string] name of action context: ie. 'settings'
	data			= null;				// [...] outgoing data to send to request
	requestType		= null;				// [string] name of data type to send: ie. 'application/json' (if null, type is approximated)
	contentType		= null;				// [string] name of response data file type: ie. 'image/jpeg'
	responseType	= null;				// [string] name of data type to receive: ie. 'json', 'raw'
	headers			= null;				// [object] Headers for the request.
	// Server interations
	prepped			= null;				// [object] of prepare data to set
	response		= null;				// [object] of data server response
	parsed			= null;				// [object] of parsed data server response

	// Initializes a new Transmission instance.
	// RETURNS: [void] Nothing.
	// * url			- [string] The URL endpoint for the request.
	// * iface			- [string] Fetch or HTTP method to use (default: 'FETCH').
	// * method			- [string] POST or GET method to use (default: 'POST').
	// * action			- [string] name of action to take: ie. 'load'
	// * context		- [string] name of action context: ie. 'settings'
	//   data			- [...] outgoing data to send to action-context
	//   responseType	- [string] name of data type to receive
	//   requestType	- [string] name of data type to send (if null, type is approximated)
	//   headers		- [object] Of headers to send in request.
	constructor( url, iface, method, action, context, data='', responseType='text', requestType='application/json', headers={} ) {
		super(); // call parent constructor
		// Validate action and context
		if ( typeof action!=='string' || action.trim()==='' ) {
			throw new Error( `Invalid action: '${action}'. It must be a non-empty string.` );
		}
		if ( typeof context!=='string' || context.trim()==='' ) {
			throw new Error( `Invalid context: '${context}'. It must be a non-empty string.` );
		}
		// Configure request [object]
		this.url			= url;										// web URL to make request to
		this.setIface( iface ?? null );									// Set request interface (e.g. 'FETCH', 'HTTP')
		this.setMethod( method ?? null );								// Set request method (e.g. 'POST', 'GET')
		this.action			= action;									// e.g., 'load'
		this.context		= context;									// e.g., 'settings'
		this.data			= data ?? '';								// Payload to send
		this.responseType	= responseType ?? this.expect();			// responseType type (e.g., 'json', 'formData', etc.)
		this.requestType	= requestType ?? this.approximate();		// requestType type (e.g., 'application/json', etc.)
		this.head( headers );											// Custom headers
		this.response		= null;										// Store server response
		this.setMode( 'status', 'initialized' );						// status is instantiated
	}

	//-------------------------
	// Argument Processing
	//-------------------------
	// Set the interface to use
	// RETURNS: [void].
	// * iface		- [string] value of interface to use: 'FETCH', 'HTTP'
	setIface( iface='FETCH' ) {
		// Validate & Set Interface
		this.iface	= ['FETCH','HTTP'].includes(iface) ? iface : 'FETCH';
	}

	// Set the method to use
	// RETURNS: [void].
	// * method		- [string] value of method to use: 'POST', 'GET', 'FETCH'
	setMethod( method='POST' ) {
		// Validate & Set Method
		this.method	= ['POST','GET'].includes(method) ? method : 'POST';
	}

	// Approximate the content-type of data being sent.
	approximate() {
		// No content type needed for empty data
		if ( !this.data ) return null;
	    const dataTypeMap = {
		        '[object FormData]':		null,
		        '[object Blob]':			this.data.type || 'application/octet-stream',
		        '[object ArrayBuffer]':		'application/octet-stream',
		        '[object URLSearchParams]':	'application/x-www-form-urlencoded',
		        '[object Document]':		'application/xml',
		    };
	    const type = Object.prototype.toString.call( this.data );
	    return dataTypeMap[type] || (typeof this.data==='object' ? 'application/json' : 'text/plain');
	}

	// Set the data responseType type
	// * type	- [...] value of responseType data type (defaults to 'text').
	expect( type='text' ) {
		// Throw error if none found
		if ( ['json','blob','text','arrayBuffer','document'].includes(type) )
			return type; // Set valid responseType
		else { // error, default to 'text'
			console.warn( `Unsupported responseType: '${type}'. Defaulting to 'text'.` );
			return 'text'; // Default fallback
		}
	}

	// Set & validate headers
	// RETURNS: [void].
	// * headers	- [object] Headers for fetch or xhr request to validate.
	head( headers ) {
		// Ensure headers is an object
		if ( !headers || typeof headers!=='object' || Array.isArray(headers) )
			throw new Error( `Invalid headers: Headers must be a plain object. Received: ${typeof headers}` );

		// Iterate through the headers to validate and set them
		Object.entries(headers).forEach(
			( [key, value] ) => {
				// Validation: Key must be a non-empty string
				if ( typeof key!=='string' || key.trim()==='' ) {
					console.warn( `Invalid header key: '${key}'. Keys must be non-empty strings.` );
					return;
				}

				// Validation: Value must be a string or a valid data type
				if ( typeof value!=='string' && typeof value!=='number' && typeof value!=='boolean' ) {
					console.warn( `Invalid header value for key '${key}': Must be a string, number, or boolean. Received: ${typeof value}` );
					return;
				}

				// Special handling for Content-Type
				if ( key.toLowerCase()==='content-type' ) {
					console.warn( `Content-Type header is set automatically based on the requestType. Ignored: '${value}'` );
					return;
				}

				// Add valid header to the headers object
				this.headers[key.trim()] = String( value );
			});

		// Debug: Log the final headers
		//console.log( 'Headers after validation:', this.headers );
	}

	//-------------------------
	// Data Preparation
	//-------------------------
	// Encode the data to be sent.
	encode() {
		// No data to encode
		const data	= this.data;
		if ( data===null || data===undefined ) return null;
		// Attempt to encode data
		const type	= this.requestType;
		if ( type==='application/json' ) return JSON.stringify( data );
		if ( type==='multipart/form-data' ) {
			// Convert [object] data to FormData
			const formData = new FormData();
			Object.keys(this.data).forEach(
				( key ) => {
					formData.append( key, this.data[key] );
				});
			return formData;
		}
		if ( data instanceof FormData || data instanceof Blob || data instanceof ArrayBuffer || data instanceof BufferSource )
			return data; // Binary or FormData doesn't need transformation
		if ( type==='application/x-www-form-urlencoded' )
			return data instanceof URLSearchParams ? data.toString() : null;
		if ( type==='application/xml' && data instanceof Document )
			return new XMLSerializer().serializeToString(data);
		if ( type==='text/plain' && typeof data==='string' )
			return data;
		throw new Error( 'Unsupported data type for responseType.' );
	}

	// Prepare the body & contentType for a request.
	// RETURNS: [bool] `true` on success, else `false`.
	prepare() {
		//-------------------------
		// Calibrate Mode & Stamp
		//-------------------------
		// Confirm mode
		if ( this.getMode('status')!=='initialized' ) {
			console.warn( 'Inquiry already prepped to send.' );
			return false;
		}
		//-------------------------
		// Attempt to Prepare
		//-------------------------
		const prep	= { body: null, headers: { ...this.headers } };		// Begin prepped data return
		const data	= this.data;										// If no data, return empty prep [object]
		// Build body & header(s)
		if ( data!==null && data!==undefined ) {
	        prep.body	= this.encode();
	        if ( this.requestType && this.requestType!=='multipart/form-data' ) {
	            prep.headers['Content-Type'] = this.requestType;
	        }
	    }
		//-------------------------
		// Change Mode & Clock
		//-------------------------
		this.prepped = prep;						// Save prepped data to this.prepped property
		this.setMode( 'status', 'prepped' );		// inquiry prepared to sent
		this._clock( 'prepped' );					// Clock the object to log prepped timestamp
		return true;								// Return processed body & contentType
	}

	//-------------------------
	// Data Receiving
	//-------------------------
	// Receive a server response & parse it.
	// * response	- [...] value of response to parse.
	// * contentType - (Optional) Content-Type header from the server.
	async receive( response, contentType='application/octet-stream' ) {
		// Throw error if response error
		if ( !response ) return null;
		// Attempt to process data by type
		try {
			switch ( this.responseType ) {
			    case 'json':
			        try {
			            this.parsed = JSON.parse( new TextDecoder().decode(response) );
			        }
					catch ( error ) {
			            console.error( 'Failed to parse JSON:', error );
			            this.parsed = null;
			        }
			        break;
				case 'blob': // Create a Blob from the arrayBuffer
					this.parsed	= new Blob( [response], { type: contentType } );
			        break;
				case 'text': // Decode arrayBuffer into a string
					this.parsed	= new TextDecoder().decode( response );
			        break;
			    case 'arrayBuffer':
			        this.parsed	= this.parsed = response; // Already an arrayBuffer
			        break;
			    case 'document': // Parses as XML/HTML
			        try {
						const decoded	= new TextDecoder().decode( response );
			            this.parsed		= new DOMParser().parseFromString( decoded, 'text/html' );
			        }
					catch ( error ) {
			            console.error( 'Failed to parse document:', error );
			            this.parsed	= null;
			        }
			        break;
			    default:
			        console.warn( `Unsupported response type: '${this.responseType}'.` );
			        this.parsed	= null;
			}
		}
		catch ( error ) { // catch error if failed try
			console.error( 'Failed to parse server response:', error) ;
			this.parsed	= null;
		}
		// Return processed data
		return this.parsed;
	}
}
