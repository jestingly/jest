console.log( 'jestAlert: js/apps/jest/components/clients/JestPlay.js loaded' );

//-------------------------
// Jest Application
//-------------------------
JestAppsRegistry.AppJestPlay =
	class JestPlay extends Jest {
		// Declare properties
		icon			= 'images/icons/jest_hat.png';	// application icon image URL [string] value
		name			= 'JestPlay';					// name of application
		version			= '0.0';						// application version
		// Game [objects]
		camera			= null;							// [object] JestCamera for viewport clipping the world.
		gameboard		= null;							// JestGameboard [object] with canvas, for rendering
		animator		= null;							// Create the animator [object] (used to render animations).
		filer			= null;							// Create the filer [object] (used to handle file download & parsing).
		fantascope		= null;							// [object] JestFantascope for handling janis.
		player			= null;							// JestPlayer [object] ie. player avatar & interaction device

		// --------------------------------
		// Constructor
		// --------------------------------
		// Construct the [object].
		// * options	- [object] Configuration options for the application.
		constructor() {
			// Call the parent application constructor
			super();
			// --------------------------------
			// Setup application
			// --------------------------------
			this.setup(); // setup the application
		}

		// --------------------------------
		// Initialization
		// --------------------------------
		// Setup the application.
		// RETURNS: [boolean] `true` on success else `false` on fail.
		async setup() {
			await super.setup(); // call parent setup method
			return true;
		}

		// Build the gameboard, player, components, etc.
		// RETURNS: [boolean] `true` on success else `false` on fail.
		async build() {
			// --------------------------------
			// Call Super
			// --------------------------------
			//await super.build();
			try { await super.build(); }
			catch ( err ) {
				console.error( `Build failed in parent super.build() method: ${err}` );
				throw err;
			}
			// --------------------------------
			// Define Properties
			// --------------------------------
			const self			= this;
			// --------------------------------
			// File Handling [objects]
			// --------------------------------
			// Create the filer [object] for file handling
			this.filer				= new JestFiler( this, `${this.config.webfiles}` );
			// Add recognized filetype(s) to filer
			this.filer.addFiletype( 'sounds', { extension: 'wav', responseType: 'blob' } );
			this.filer.addFiletype( 'janis', { extension: 'jani' } );		// jani filetype handler
			this.filer.addFiletype( 'tiledefs', { extension: 'tdefs' } );	// tiledefs filetype handler
			this.filer.addFiletype( 'levels', { extension: 'nw' } );		// levels filetype handler
			// Create parser [objects]
			this.parsers.sounds		= new JestSoundParser();
			this.parsers.janis		= new JestJaniParser();
			this.parsers.tiledefs	= new JestTiledefsParser();
			this.parsers.levels		= new JestLevelParser();
			// --------------------------------
			// Register Image Directories
			// --------------------------------
			// Set character skins folder(s)
			this.gallery.registerCategory( 'SPRITES', 'sprites' );
			this.gallery.registerCategory( 'HEAD', 'heads', 'images/heads-placeholder.png' );
			this.gallery.registerCategory( 'BODY', 'bodies' );
			this.gallery.registerCategory( 'SHIELD', 'shields' );
			this.gallery.registerCategory( 'SWORD', 'swords' );
			// --------------------------------
			// Create Camera [object]
			// --------------------------------
			const camera		= new JestCamera( this );
			this.camera			= camera;					// cross-ref JestCamera [object] reference
			// --------------------------------
			// Create Gameboard [object]
			// --------------------------------
			const gameboard		= new JestGameboard( this );
			gameboard.anchor.resize( 480, 270 );			// set board width & height
			this.gameboard		= gameboard;				// cross-ref JestGameboard [object] reference
			const canvas		= gameboard.canvas;
			// --------------------------------
			// Sound Handling [object]
			// --------------------------------
			// Create primary game soundboard for handling SFX
			const soundboard		= new JestSoundboard( this, 'primary' );
			this.soundboard			= soundboard;
			// Preload some sounds
			const soundNames		= [ 'steps', 'steps2', 'sword' ];
			await this.soundboard.preload( soundNames );
			// --------------------------------
			// Animation Handler [object]
			// --------------------------------
			// Create the fantascope [object] for jani handling
			this.fantascope		= new JestFantascope( this );
			// Create the animator for animation rendering
			const animator		= new AnimationAnimator();	// Create a single Animator instance.
			animator.canvas		= gameboard.canvas;			// Animator canvas is the JestGameboard canvas "screen"
			this.animator		= animator;
			// --------------------------------
			// Load Tileset [objects]
			// --------------------------------
			// Load a default tileset
			const tileset		= await gameboard.addTileset( 'pics1' )
				.catch(
					( err ) => {
						console.warn( `Tileset could not be loaded: ${err.message}` );
					});
			//console.log( tileset ); return;
			// Add canvas to window viewport
			this.windows[0].refs.viewport.el.appendChild( canvas.el );
			console.log( gameboard );
			// --------------------------------
			// Create Overworld [objects]
			// --------------------------------
			// Create overworld
			const overworld		= new JestOverworld( this, 'map1' );
			await overworld.setup();
			// --------------------------------
			// Load Level [object]
			// --------------------------------
			// Load the *.nw file(s)
			const levelNames	= [
				'level39', 'level16', 'level18',
				'level14', 'level13', 'level17',
				'level38', 'level9', 'level10'
				]; // create list of levels to load
			await this.filer.loadFiles( 'levels', levelNames )
				.catch(
					( err ) => {
						console.warn( `Not all levels were loaded: ${err.message}` );
					});
			// --------------------------------
			// Create Level [objects]
			// --------------------------------
			const levels		= {};
			for ( let i=0; i<levelNames.length; i++ ) {
				// Render level13
				const name		= levelNames[i];
				const level		= new JestLevel( this, name );
				await level.setup();
				level.render( this.filer.files.levels[name].board ); // render the level bitmap
				levels[name]	= level;
			}
			// Simulate overworld layout
			overworld.addLevel( levels.level39, 0, 0 ); // MoD?
			overworld.addLevel( levels.level16, 1, 0 ); // supernick
			overworld.addLevel( levels.level18, 2, 0 ); // church?
			overworld.addLevel( levels.level14, 0, 1 ); // vangel
			overworld.addLevel( levels.level13, 1, 1 ); // zol pub
			overworld.addLevel( levels.level17, 2, 1 ); // fox den
			overworld.addLevel( levels.level38, 0, 2 ); // angel clan
			overworld.addLevel( levels.level9, 1, 2 ); // taylor richards
			overworld.addLevel( levels.level10, 3, 2 ); // master-li fields
			// --------------------------------
			// Create Player [object]
			// --------------------------------
			const player		= new JestPlayer( this );	// player character
			await player.setup();
				/*.catch(
					( err ) => {
						console.warn( 'Player did not setup properly. Application [should quit].' );
					});*/
			this.player			= player;
			player.level		= 'level13';
			player.anchor.move( 10, 10 );
			// --------------------------------
			// Add Ticker Event(s) [objects]
			// --------------------------------
			this.timeout.register( 'tick', 'gameboard', e=>gameboard.update(e) );
			this.timeout.register( 'tick', 'animator', e=>animator.update(e) );
			// --------------------------------
			// Setup Debugging
			// --------------------------------
			// Default inspector drawing canvas to gameboard
			this.inspector.canvas	= gameboard.canvas;
			//this.inspector.on();
			//this.inspector.enable( 'showAnchors' );
			/*this.inspector.anchors.add( player.focus );
			player.focus.show( '#f00', 50 );
			this.inspector.anchors.add( player.collider );
			player.collider.show( '#000', 50 );
			this.inspector.anchors.add( player.anchor );
			player.anchor.show( '#00f', 50 );*/
			// --------------------------------
			// Successfully Exit Build
			// --------------------------------
			// App built, set built status
			this.gearshift( 'built' ); // app built
			return true;
		}
	};
