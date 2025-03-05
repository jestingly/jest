console.log( 'jestAlert: js/apps/jest/components/sound/JestSoundboard.js loaded' );

//-------------------------
// JestSoundboard Class
//-------------------------
// Handles preloading, caching, and playing sound from downloaded sources.
class JestSoundboard extends JestSavable {
	// Properties
	soundCache			= {};			// [Object] Stores preloaded sound files.
	defaultVolume		= 0.2;			// [float] Default volume (20%).

	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct the [object].
	// * client		- [object] Application client creating the object.
	// * name		- [string] Value of soundboard name (e.g. 'primary').
	constructor( client, name ) {
		// Call the parent object constructor
		super( client, name );			// construct the parent
	}

	//-------------------------
	// Download File(s)
	//-------------------------
	// Download sound file(s) asynchronously & store as JestSound [objects] for playback.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * filenames	- [stray] Values of sound URL filename(s) to load without extension (e.g. 'explosion').
	async preload( filenames ) {
		// Validate argument(s)
		if ( !jsos.prove(filenames,'stray') )
			throw new Error( `Argument 'filenames' must be of type [stray].` );
		// Load tile definitions *.tdefs file
		await this.client.filer.loadFiles( 'sounds', filenames )
			.catch(
				( err ) => {
					throw new Error( `Not all sound files were loaded: ${err.message}` );
				});
		// Iterate sound file data & create [objects]
		for ( const filename of filenames ) {
			// Create a new JestSound instance & render the parsed data.
			const data		= this.client.filer.files.sounds[filename];
			const sound		= new JestSound( this.client, filename );
			sound.setup();				// call any necessary setup
			sound.render( data.blob );	// render blob into JestSound [object]
		}
		return true; // success
	}

	//-------------------------
	// playSound
	//-------------------------
	// Plays an sound file from memory.
	// RETURNS: [void].
	// * key			- [string] Sound key.
	// * volume			- [float] Playback volume (default: `defaultVolume`).
	// * simultaneous	- [bool] If true, plays a separate instance instead of reusing the cached instance.
	playSound( key, volume=this.defaultVolume, simultaneous=true ) {
		// Retrieve the parsed sound object from the filer.
		const audio	= this.client.gameboard.sounds?.[key];
		if ( !audio ) {
			console.error( `Sound not found in cache: ${key}` );
			return;
		}
		// Attempt to play the sound
		audio.play( volume, simultaneous ); // call JestAudio play
	}

	//-------------------------
	// pauseSound
	//-------------------------
	// Pauses a currently playing sound file.
	// * key		- [string] Sound key.
	// RETURNS: [void].
	pauseSound( key ) {
		/*const sound = this.soundCache[key];
		if ( sound && !sound.paused ) {
			sound.pause();
			console.log(`Sound paused: ${key}`);
		}
		else console.error( `Sound not found or already paused:`, key );*/
	}

	//-------------------------
	// stopSound
	//-------------------------
	// Stops playback and resets an sound file.
	// * key		- [string] Sound key.
	// RETURNS: [void].
	stopSound( key ) {
		/*const sound	= this.soundCache[key];
		if ( sound ) {
			sound.pause();			// Stop playback.
			sound.currentTime = 0;	// Reset to the beginning.
			console.log( `Sound stopped: ${key}` );
		}
		else console.error( `Sound instance not found:`, key );*/
	}
}
