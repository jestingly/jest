console.log( 'jestAlert: js/system/data/Transmission.js loaded' );

//-------------------------
// Transmission Class
//-------------------------
// A class to handle data transmissions using Fetch or XHR with event-based updates.
class Transmission extends OSCallback {
	// Input data
	inquiries		= [];					// [array] queue of inquiries to process (multiple at once)
	inquiry			= null;					// [object] Inquiry currently being processed (or last one sent)
	// Output data
	request			= null;					// The XMLHttpRequest object used for the transmission (if applicable).

	// Initializes a new Transmission instance.
	// RETURNS: [void] Nothing.
	//   options		- [Object] Configuration options.
	constructor( options={} ) {
		super( options );	// call parent constructor
		// Set mode to idle
		this.setMode( 'status', 'idle' );
	}

	//-------------------------
	// Modal Methods
	//-------------------------
	// Set a mode state (override OSConfigurable parent method).
	// * mode		- [string] name of mode to set.
	// * state		- [string] value of mode.
	// RETURNS: [bool] `true` on success, else `false`.
	setMode( mode, state ) {
		// If setting status, handle differently
		if ( mode==='status' && state!==this.getMode('status') ) { // determine if status is changing
			if ( super.setMode('status',state) ) {
				this.emit( 'statusChange', null, state );
				return true; // success
			}
			else return false; // fail
		}
		// Set some other mode besides 'status'
		return super.setMode( mode, state ); // call super
	}

	//-------------------------
	// Server Interactions
	//-------------------------
	// Queue a inquiry
	//   inquiry	- [object] Inquiry configuration data
	queue( inquiry ) {
		console.log( 'transmission queued activity: '+inquiry.action+'->'+inquiry.context );
		// Validate object type
		if ( !(inquiry instanceof Inquiry) ) {
			console.warn( 'transmission cannot queue inquiry: invalid type' );
			return false;
		}
		// Push onto array stack
		if ( this.inquiries===null ) this.inquiries = [];
		this.inquiries.push( inquiry );
	}

	// Retrieve all quir(ies)
	/*retrieve() {
		//-------------------------
		// Validate Retrieval
		//-------------------------
		console.log( 'transmission attempting to retrieve' );
		// Require inquiry(s)
		if ( this.inquiries===null || this.inquiries.length<1 ) {
			console.warn( 'transmission cannot retrieve: no inquiry(s) queued' );
			return false;
		}
		//-------------------------
		// Compile Quir(ies) Data
		//-------------------------
		// Apply inquiries to FormData object
		//data.append( 'bookmark', jsos.bookmark );	// Register with session bookmark
		// Check for inquiry information
		if ( jsos.prove(this.inquiries,'array') ) {
			for ( const inquiry of this.inquiries ) {
				var inquiry	= this.inquiries[i];
				// [insert send logic here]
		}
	}*/

	// Sends a data transmission request using a Inquiry [object].
	// RETURNS: [Promise<any>] Resolves with response data or rejects with an error.
	// * inquiry	- [Object] Inquiry with appropriate data to configure a request.
	async send( inquiry ) {
		//-------------------------
		// Calibrate Mode & Stamp
		//-------------------------
		// Confirm mode
		if ( this.getMode('status')!=='idle' ) {
			console.warn( 'Transmission already in progress.' );
			return Promise.reject( new Error('Transmission already in progress.') );
		}
		//-------------------------
		// Validate & Prepare
		//-------------------------
		// Handle the data & process the method
		switch ( inquiry.method ) {
			case 'POST':	// outgoing transmission
				console.log( 'transmission sending POST: '+inquiry.url );
				break;
			case 'GET':		// ingoing transmission
				console.log( 'transmission sending GET: '+inquiry.url );
				break;
			default: // unknown transmission
				alert( 'Transmission Cannot Start: Unknown Method `'+inquiry.method+'`' );
				this.setMode( 'status', 'idle' );
				return false;
		}
		// Switch mode & attempt errand
		this.setMode( 'status', 'starting' );		// Status is transmitting
		this.emit( 'starting' );					// Kickoff event
		this._clock( 'start' );						// Clock the object to log current timestamp
		this.inquiry	= inquiry;					// Set active inquiry to requested inquiry
		inquiry.prepare();							// Ensure inquiry data is prepared for request
		//-------------------------
		// Begin Retrieval Method
		//-------------------------
		try {
			// Handle request based upon requested interface
			let result;
			switch ( inquiry.iface ) {
				case 'FETCH':	// Fetch interface
					result	= await this._fetchRequest( inquiry );
					break;
				case 'HTTP':	// XMLHttpRequest interface
				default:
					result	= await this._xhrRequest( inquiry );
					break;
			}
			return result;
		}
		catch ( error ) {
			throw error;
		}
	}

	//-------------------------
	// Private Methods
	//-------------------------
	// Sends a inquiry using the Fetch API.
	// RETURNS: [Promise<any>] Resolves with response data or rejects with an error.
	// * inquiry	- [Object] Inquiry with appropriate data to configure a request.
	_fetchRequest( inquiry ) {
		//-------------------------
		// AbortController Setup
		//-------------------------
		const controller	= new AbortController();
		const request		= controller.signal;
		this.aborter		= controller; // save controller to allow abort later
		//-------------------------
		// Handle Fetch
		//-------------------------
		const options		=
			{
				method:		inquiry.method.toUpperCase(),
				headers:	inquiry.prepped.headers,
				body:		inquiry.method==='POST' ? JSON.stringify(inquiry.prepped.body) : undefined,
				signal:		controller.signal // Attach the abort signal
			};
		// Call the fetch
		return fetch( inquiry.url, options )
			.then(
				response => {
					//console.log( response );
					// Throw error is response not "ok"
					if ( !response.ok ) {
						const error = new Error( `HTTP Error: ${response.status}` );
						this.emit( 'error', null, error ); // Emit error event
						throw error; // throw error
					}
					// Extract Content-Type
					const contentType	= response.headers.get('Content-Type') || 'application/octet-stream';
					inquiry.contentType	= contentType; // store content type in inquiry
					// Emit a "progress" event for download tracking
					if ( response.body && response.headers.get('content-length') ) {
						//console.log( response );
						// Create a reader
						const reader	= response.body.getReader();
						// Create vars for progress counting
						const total		= parseInt( response.headers.get('content-length'), 10 ); // total data size to load
						let loaded		= 0;		// reset load percent for new request
						const _self		= this;		// Capture `this` for use in progress
						// Read the stream and emit custom progress events
						return new ReadableStream({
							start( controller ) {
								function read() {
									reader.read().then(
										( { done, value } ) => {
											// Stream isn't done, track progress
											loaded	= !done ? loaded+value.length : total;
											_self.progress( loaded, total ); // track progress
											// Check if stream is done
											if ( done ) {
												controller.close();
												return;
											}
											else { // continue reading
												controller.enqueue( value );
												read();
											}
										});
								}
								read();
							}});
					}
					// No progress tracking possible
					return response;
				})
			.then(
				stream => {
					console.log( stream );
					return stream ? new Response(stream).arrayBuffer() : null;
				}) // Process response stream
			.then( data => this.load(data) ) // Return loaded data
			.catch( // Throw an error
				error => {
					console.log( error );
					if ( error.name==='AbortError' )
						this.abort( error );		// call abort method
					else this.error( error );		// call error method
				});
		//-------------------------
		// Switch Status
		//-------------------------
		// Switch mode & attempt kickoff errand
		this.setMode( 'status', 'transmitting' );	// status is transmitting
		this.emit( 'kickoff' );						// kickoff event
	}

	// Sends a request using XMLHttpRequest.
	// RETURNS: [Promise<any>] Resolves with response data or rejects with an error.
	// * inquiry	- [Object] Inquiry with appropriate data to configure a request.
	_xhrRequest( inquiry ) {
		//-------------------------
		// Create Return Promise
		//-------------------------
		// Return a promise [object]
		return new Promise(
			( resolve, reject ) => {
				//-------------------------
				// Begin XMLHttpRequest
				//-------------------------
				// Create an XMLHttpRequest [object] with listeners
				const request		= new XMLHttpRequest();
				this.request		= request;	// set request reference
				this.aborter		= request;	// the request is also the aborter
				this.request.open( inquiry.method, inquiry.url, true );

				// Add headers
				Object.keys(inquiry.prepped.headers).forEach(
					key => {
						this.request.setRequestHeader( key, inquiry.prepped.headers[key] );
					});

				// Add event listeners
				const onprogress				= (e) => this.progress( e.loaded, e.total );
				this.request.onprogress			= onprogress;
				this.request.upload.onprogress	= onprogress;
				//this.request.onreadystatechange	= (e) => this.change(e);
				this.request.responseType		= 'arraybuffer'; // Force arrayBuffer return

				// On load event
				this.request.onload =
					() => {
						// Require response to be okay
						if ( this.request.status>=200&&this.request.status<300 ) {
							const contentType	= request.getResponseHeader('Content-Type') || 'application/octet-stream';
							inquiry.contentType	= contentType;		// store content type in inquiry
							this.load( this.request.response );		// call load method
							resolve( this.request.response );		// resolve the promise
						}
						else {
							const error = new Error( `XHR failed with status ${this.request.status}` );
							this.error( error );	// call error method
							reject( error );		// reject the promise
						}
					};

				// On error event
				this.request.onerror	=
					( e ) => {
						console.error( 'An error occurred during the XHR request.', e );
						const error		= new Error( 'Network error occurred during the XHR request.' );
						error.event		= e;	// Attach the original event
						this.error( error );	// call error method
						reject( error );		// reject the promise
					};

				// On abort event
				this.request.onabort	=
					() => {
						const err		= new Error( 'Request aborted' );
						this.abort( error );	// call abort method
						reject( error );		// reject the promise
					};
				// Send the request
				this.request.send( inquiry.method==='POST' ? JSON.stringify(inquiry.prepped.body) : null );
			});
	}

	//-------------------------
	// Activity Tracking
	//-------------------------
	// Cancels the current transmission.
	// RETURNS: [void] Nothing.
	cancel() {
		// If aborter exists, attempt abort
		if ( this.aborter ) {
			// Abort the request
			this.aborter.abort();
			console.log( 'Request aborted' );
			// Set mode to aborted & emit abort event
			this.setMode( 'status', 'aborted' );
		}
		else console.log( 'No request to abort' );
	}
	// Tracking state change
	// NOTE: Deprecated!!!
	// RETURNS: [void] Nothing.
	change( e ) {
		// Determine the ready state
		switch ( this.request.readyState ) {
			case 0: // request not initialized
			case 1: // server connection established
			case 2: // request received
			case 3: // processing request
				break;
			case 4:	// complete
				// Determine completion status
				switch ( this.request.status ) {
					case 200: // success
						// Complete the file load
						this.inquiry.receive( this.request.response )
						return;
					default:
						// Complete the request as failed
						console.error( 'XHR request failed:', this.request.status );
						this.close( 'fail' );
						return;
				}
				break;
		}
	}
	// Determine the progress of the transmission
	// RETURNS: [void] Nothing.
	// @param {number} loaded	- The amount of data loaded.
	// @param {number} total	- The total size of the request.
	progress( loaded, total ) {
		const percent	= total>0 ? loaded/total * 100 : 100;
		this.percent	= percent;
		console.log( `Transmission Progress: ${percent.toFixed(2)}%` );
		this.emit( 'progress', null, { loaded, total, percent } ); // Emit intermediate progress
	}
	// Transmission loaded data fully.
	// RETURNS: [void] Nothing.
	// * response		- [...] response data from fetch or xhr request
	load( response ) {
		// Call current inquiry to receive response & content type
		this.inquiry.receive( response, this.inquiry.contentType );
		this.complete();						// Call the complete method
	}
	// Transmission threw an error.
	// RETURNS: [void] Nothing.
	error( err ) {
		this.emit( 'error', null, err );		// Emit error event with data
		this.close( 'error' );					// Call the complete method
	}
	// Transmission has been aborted.
	// RETURNS: [void] Nothing.
	abort( err ) {
		this.close( 'abort' );					// Call the complete method
	}

	//-------------------------
	// End Handling
	//-------------------------
	// Complete the transmission.
	// RETURNS: [void] Nothing.
	complete() {
		this.emit( 'complete' );				// Emit complete event with data
	}
	// A transmission closed before completion (abort, fail, error, etc.)
	// RETURNS: [void] Nothing.
	// * status		- [string] Status of closure reason (e.g. 'abort', 'fail', etc.)
	close( status ) {
		switch ( status ) {
			case 'error':
			case 'abort':
			case 'fail':
				console.log( 'transmission '+status+'ed' );
				this.aborter.abort();
				this.emit( 'close', null, status );		// Emit close event with status
				break;
			default:
				console.warn( 'Unknown status: '+status );
		}
	}
}
