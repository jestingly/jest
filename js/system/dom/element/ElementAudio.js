console.log( 'jestAlert: js/dom/element/ElementAudio.js loaded' );

// ElementAudio class
class ElementAudio extends OSElement {
	// Attribute properties
	url				= null;			// [string] value of src URL
	// Playback status properties
	playing			= false;		// [bool] Value indicating playing status (unreliable).
	// Playback timing
	queued			= false;		// [bool] Whether sound is queued to play as soon as ready

	//-------------------------
	// Setup [Object]
	//-------------------------
	// Creates the class [object] with configurable components.
	// RETURNS: [object] A new instance.
	// * options		- [object] Configuration options for the class [object].
	constructor( options={} ) {
		// Parse some data
		options.tag		= 'audio';
		super( options );	// call OSObject parent constructor
		this.setMode( 'source', 'empty' );			// set status
		this.setMode( 'playback', 'unplayed' );		// playback empty
		// Setup the [object] before creating the element
		this.setup();		// setup the [object]
		this.render();		// render the [object]
		// Determine if audio should autoplay upon load
		this.queued		= options.queued ?? false;	// whether to auto-play
		// Call load complete if source preloaded
		if ( this.isReady() ) this.onLoad();
	}

	// Setup the [object].
	// RETURNS: [boolean] true or false.
	setup() {
		super.setup();		// call parent setup method
		// Ensure class(es) include element base class(es)
		this.classes.push( 'jest-audio' );
		return true;		// success
	}

	// Render the [object].
	// RETURNS: [boolean] true or false.
	render() {
		// Remove 'src' attribute if supplied
		let url	= null;
		if ( this.attributes.src ) {
			url	= this.attributes.src;		// save source
			delete this.attributes.src;		// delete attribute src
		}
		super.render();			// call parent render method
		// Apply listener(s)
		this.register( 'loadeddata', 'status', e=>this.onLoad(e), 'dom' );
		// Apply listener(s)
		this.register( 'play', 'playback', e=>this.onPlay(e), 'dom' );
		this.register( 'playing', 'playback', e=>this.onResume(e), 'dom' );
		const stops	=
			[
				'pause', 'ended',
				'abort', 'error',
				'waiting', 'stalled', 'suspend',
				'emptied'
			];
		stops.forEach(
			type => {
				this.register( 'interrupt', `playback_${type}`, e=>this.onInterrupt(e), 'dom' );
			});
		this.register( 'ended', 'playback', e=>this.onEnd(e), 'dom' );
		// Set source if exists
		if ( url!==null )
			this.setSrc( url );	// set source supplied
		return true;			// success
	}

	//-------------------------
	// Setting Source
	//-------------------------
	// Set the element src attribute.
	// RETURNS: [boolean] true or false.
	// * url		- [string] value of attribute source URL.
	setSrc( url ) {
		// Change status to unloaded & parse URL
		this.setMode( 'source', 'unloaded' );			// set status
		this.url	= chrome.runtime.getURL( url );		// update URL
		// Apply the src URL
		this.el.setAttribute( 'src', this.url );
		return true;
	}

	// Determine if media is ready
	// RETURNS: [boolean] true or false.
	isReady() {
		// Determine if media is ready
		const status	= this.getMode( 'source' )
		// 2 = HAVE_CURRENT_DATA, means it has loaded enough to play
		const ready		= this.el.readyState >= 2;
		if ( ready && status!=='loaded' )
			this.setMode( 'source', 'loaded' );
		return ready; // return ready state
	}

    //-------------------------
	// Playback Handling
    //-------------------------
	// Plays the audio from the beginning.
    // * volume		- [float] Playback volume.
	play( volume=0.2 ) {
		// Make sure file is already loaded
		if ( !this.isReady() ) {
			// console.warn( `Cannot play audio before load.` );
			return;
		}
		// If queued, it is not queued anymore
		if ( this.queued===true )
			this.queued		= false;	// no longer queued
		// Play audio stream
		this.el.volume		= volume;	// set requested audio volume
		this.el.play().catch( err => console.error(`Error playing ${this.name}:`,err) );
    }

	// Plays the audio from the beginning.
    // * volume		- [float] Playback volume.
	replay( volume=0.2 ) {
		// Make sure file is already loaded
		if ( !this.isReady() ) {
			// console.warn( `Cannot replay audio before load.` );
			return;
		}
		// Reset audio stream & play
		this.el.currentTime	= 0;		// reset the audio stream time
		this.el.volume		= volume;	// set requested audio volume
		this.el.play().catch( err => console.error(`Error replaying ${this.name}:`,err) );
    }

	// Stops the audio.
    // * volume		- [float] Playback volume.
	stop() {
		// Make sure file is already loaded
		if ( !this.isReady() ) {
			// console.warn( `Cannot stop audio before load.` );
			return;
		}
		// Stop the audio
		this.el.currentTime	= 0;		// reset the audio stream time
		this.el.stop().catch( err => console.error(`Error stopping ${this.name}:`,err) );
    }

	//-------------------------
	// Event Listener(s)
	//-------------------------
	// onLoad event handler callback for attribute src
	// RETURNS: [void].
	onLoad() {
		this.setMode( 'source', 'loaded' );			// src loaded
		this.emit( 'loaded' );						// emit src load event
		// Play sound if queued
		if ( this.queued===true ) this.play();
	}

	// onPlay event handler callback for playback start.
	// RETURNS: [void].
	onPlay() {
		this.setMode( 'playback', 'playing' );		// playback begin
		this.playing	= true;						// sound started playing
		this.emit( 'started' );						// emit playback start event
	}

	// onResume event handler callback for when playback resumes.
	// RETURNS: [void].
	onResume() {
		this.setMode( 'playback', 'playing' );		// playback resumed
		this.playing	= true;						// sound resumed playing
		this.emit( 'resumed' );						// emit playback resume event
	}

	// onInterrupt event handler callback for playback interrupt.
	// RETURNS: [void].
	onInterrupt() {
		this.setMode( 'playback', 'interrupted' );	// playback interrupted
		this.playing	= false;					// sound playing interrupted
		this.emit( 'interrupted' );					// emit playback interrupted event
	}

	// onEnd event handler callback for playback complete.
	// RETURNS: [void].
	onEnd() {
		this.setMode( 'playback', 'ended' );		// playback finished
		this.playing	= false;					// sound playing interrupted
		this.emit( 'ended' );						// emit playback end event
	}
}
