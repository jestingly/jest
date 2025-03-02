console.log( 'jestAlert: content.js loaded' );

// Declare global environment [object]
var jsos						= null;
var JestEnvironment				= null;
var JestEnvironmentStatus		= 'shutdown';
var JestLibraryRegistry			= {};				// [object] for registering custom libraries
var JestAppsRegistry			= {};				// [object] for registering custom apps
var JestMixins					= {};				// [object] for registering mixins

// Set status function
const setStatus =
	() => {
		JestEnvironmentStatus	= 'running';
	};

// Handle chrome runtime on message listener
chrome.runtime.onMessage.addListener(
	async ( request, sender, sendResponse ) => {
		console.log( 'jestAlert: content.js response' );
		// --------------------------------
		// Handle content by status
		// --------------------------------
		switch ( JestEnvironmentStatus ) {
			case 'shutdown': // environment not running
				if ( request.action==='openJestEnvironment' ) {
					(async () => {
						console.log( 'jestAlert: openJestEnvironment message received.' );
						try {
							// --------------------------------
							// Load up the helper utility
							// --------------------------------
							// Generate the Jest interface [object]
							console.log( 'jestAlert: Create interface.' );
							jsos = new JSOSInterface();

							// --------------------------------
							// Load up the enviroment
							// --------------------------------
							// Generate the Jest environment
							console.log( 'jestAlert: Create environment.' );
							JestEnvironment = new JSOSEnvironment();
							JestEnvironment.generateEnvironment();
							setStatus( 'running' );

							// --------------------------------
							// Import libraries
							// --------------------------------
							// Harlequin
							JestEnvironment.librarian.ship( 'Harlequin' );
							JestEnvironment.librarian.libs.Harlequin.ship( ['HarlequinWindow'] );

							// --------------------------------
							// Open the game application
							// --------------------------------
							JestEnvironment.execute( 'JestPlay' );
						}
						catch ( e ) {
							console.error( 'jestAlert: Error injecting modal:', e );
						}
						sendResponse( { success: true } );
					})();
				}
				break;
			default: break; // not shutdown
		}
	}
);
