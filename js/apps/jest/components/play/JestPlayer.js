console.log( 'jestAlert: js/apps/jest/components/play/JestPlayer.js loaded' );

//-------------------------
// JestPlayer Class
//-------------------------
// Represents a player object with animations for different parts (head, sword, body).
class JestPlayer extends JestWorldling {
	// --------------------------------
	// Core [objects] & Input/Output
	// --------------------------------
	// Movement propert(ies)
	focus			= null;				// [object] Anchor used to focus the visual location (x,y).
	collider		= null;				// [object] Anchor used to test for collision movement (x,y) location(s).
	// Animation / graphical avatar propert(ies)
	head			= null;				// [object] Sprite for the player's head (spritesheet-based).
	body			= null;				// [object] Sprite for the player's body (spritesheet-based).
	sword			= null;				// [object] Animation for the player's sword (spritesheet-based).
	// World data
	id				= null;				// [int] Value of player account ID (e.g. 120145).
	// Track keys
	keysListen		= [];				// [array] of registered keyboard inputs the player can input
	keys			= {};				// [object] of actual keyboard keys being pressed
	// --------------------------------
	// Motion Variable(s)
	// --------------------------------
	gears			= null;				// [array] of actual possible gears that the player can be in.
	dir				= 2;				// [string] Current facing direction (0=up, 1=left, 2=down, 3=right).
	speed			= 0.5;				// [number] Movement speed of the player.
	freeze			= 0;				// [int] value of time to freeze the player.
	forceX			= 0;
	forceY			= 0;
	dirgo			= null;				// [array] of movement directions determined by -1, 0, and 1
	// Sound propert(ies)
	soundStep		= 0;				// [number] Value of current sound step: 0 through n

	// --------------------------------
	// Initialization
	// --------------------------------
	// Initializes the Player.
	// RETURNS: [void].
	// * client		- client [object] that this piece belongs to.
	constructor( client ) {
		super( client );				// construct the parent
		// Load player data
		this.load();
		// Setup recognizable gears
		this.gears		=
			{
				idle:
					{
						// Gears this gear can shift into (ordered by priority):
						gearshifts:		[ 'sword', 'walk', 'idle' ],
						keycode:		null,
						turbo:			0,			// timeout countdown, not countdown if 0,
						signaled:		null
					},
				sword:
					{
						// Gears this gear can shift into (ordered by priority):
						gearshifts:		[ 'sword', 'walk', 'idle' ],
						keycode:		's',
						turbo:			1000/60*4*5,
						shiftback:		'idle',
						signaled:		null
					},
				walk:
					{
						// Gears this gear can shift into (ordered by priority):
						gearshifts:		[ 'sword', 'walk', 'idle' ],
						keycode:		'arrows',
						turbo:			0,			// timeout countdown, not countdown if 0,
						signaled:		null
					},
			};
		// Setup recognizable keys
		this.keysListen	=
			new Map([
				// Arrow keys
				[ 'ArrowUp', 'up' ],
				[ 'ArrowRight', 'right' ],
				[ 'ArrowDown', 'down' ],
				[ 'ArrowLeft', 'left' ],
				// Control keys
				[ 's', 's' ],
			]);
		// Setup movement preference(s)
		this.dirgo		=
			[
				 0, -1,		// up
				-1,  0,		// left
				 0,  1,		// down
				 1,  0,		// right
				 0,  0		// idle
			];
	}

	// --------------------------------
	// Setup Method(s)
	// --------------------------------
	// Setup the player [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async setup() {
		// --------------------------------
		// Setup Player Definitions
		// --------------------------------
		this.anchor.graticulate( this.client.config.tileGrid );		// player level anchor is in tile-based units
		this.anchor.resize( 1, 1 );									// player body is 1x1 tiles width/height
		// --------------------------------
		// Graphical Setup
		// --------------------------------
		await this.setupAvatar();
			/*.catch(
				( err ) => {
					console.warn( `Player avatar failed to setup: ${err}` );
				});*/
		// --------------------------------
		// Setup Listener(s)
		// --------------------------------
		// Set other event(s)
		this.register( 'gearshift', 'avatar', (e)=>this.setJani(e) ); // change avatar animation
		// Setup key event listener(s)
		this.client.io.register( 'keyPress', 'playerKeyListener', this.keyPress.bind(this) );
		this.client.io.register( 'keyRelease', 'playerKeyListener', this.keyRelease.bind(this) );
		// Kickstart central pulse
		this.client.timeout.register( 'tick', 'playerPulse', e=>this.pulse(e) );
		// --------------------------------
		// Set Player Mode
		// --------------------------------
		this.setMode( 'mode', 'idle' );
		return true; // success
	}

	// Setup the player avatar animation [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async setupAvatar() {
		// --------------------------------
		// Create Anchor Point [objects]
		// --------------------------------
		// Create focal anchor [object] for animation rendering in viewport camera
		// NOTE: Focus is in 1px units because it is relative to viewport canvas, not level grid.
		const focus		= new Anchor();									// create focal point
		focus.move( 0, 0 );												// move focal point to a default position
		this.focus		= focus;										// store anchor as property
		this.focus.resize( 32, 32 );									// player body is 32x32
		// Create collision anchor [object] for player on-wall detection
		const collider	= new Anchor();									// create collider point
		this.collider	= collider;										// store anchor as property
		this.collider.graticulate( this.client.config.tileGrid );		// collision anchor is in level tile-based units
		this.collider.resize( this.anchor.width, this.anchor.height );	// player body is 2x2 tiles width/height
		collider.move( -collider.width/2, collider.height/2 );			// move collider point to a default position
		this.collider.setParent( this.anchor );
		// --------------------------------
		// Load Default JAnimation [object]
		// --------------------------------
		// Load the *.jani file(s)
		const files		= []; // create list of files to load
		for ( const mode in this.gears )
			files.push( mode );
		await this.client.filer.loadFiles( 'janis', files );
			/*.catch(
				( err ) => {
					console.warn( `Not all janis were loaded: ${err.message}` );
				});*/
		// Iterate all janis & set parent as player anchor point
		for ( const mode in this.gears ) {
			// Access loaded jani
			const jani		= this.client.filer.files.janis?.[mode] ?? null;
			//console.log( this.client.filer.files.janis );
			if ( jani===null ) // throw error if jani missing
				throw new Error( `Player JANI missing: ${mode}.` );
			// Add jani to animator loop
			this.client.animator.add( jani );
			// Create a jani view for player
			const view	= jani.addView( `player${this.id}` );
			if ( view ) {
				view.resize( 48, 48 );				// set animation width/height
				view.setParent( this.focus );		// lock animation to focal point coordinates
				const aniCenterX	= -view.width / 2;
				const aniCenterY	= -view.height / 2;
				view.move( aniCenterX, aniCenterY );
				// Store animation inside of gear [object] for quick-ref
				this.gears[mode].view	= view;
			}
			else throw new Error( `Player JANI view failed to create: ${mode}.` );
		}
		// --------------------------------
		// Set Visual(s)
		// --------------------------------
		// Set the current JAni
		this.avatar		= this.gears.idle.view; // make sure avatar default value is a JAni
		// Load varying images
		await this.client.gallery.loadImages([
			{ category: 'HEAD', filename: 'head104', filetype: 'GIF' },
			{ category: 'HEAD', filename: 'head17', filetype: 'GIF' },
			{ category: 'BODY', filename: 'body', filetype: 'PNG' },
			{ category: 'BODY', filename: 'body2', filetype: 'PNG' },
			{ category: 'SWORD', filename: 'sword1', filetype: 'PNG' }
			]);
		// Set player sprites
		this.skin( 'SPRITES', 'sprites1' );
		this.skin( 'HEAD', 'head17' );
		this.skin( 'BODY', 'body' );
		this.skin( 'SWORD', 'sword1' );
		//console.log( this.avatar.attributes );
		return true; // succees
	}

	//-------------------------
	// Data Handling
	//-------------------------
	// Load the data.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async load() {
		super.load();		// call parent load start method
		this.id		= 0;	// set user account ID
		this.complete();	// call complete method
		return true;		// success
	}

	// Complete data load.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	complete() {
		super.complete();	// call parent complete method
		this.client.gameboard.players[this.id] = this; // store reference in stack [object]
		return true;		// success
	}

	// --------------------------------
	// Avatar Handling
	// --------------------------------
	// Set the player's avatar JAnimation.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * name	- [string] value of loaded JAni to use for the player display.
	setJani( name ) {
		// --------------------------------
		// Remove Current Avatar
		// --------------------------------
		// Turn off existing avatar
		this.avatar.reset();						// Reset the current JAni
		// --------------------------------
		// Setup New Avatar
		// --------------------------------
		// Equip new avatar
		const view		= this.gears[name].view;
		// Configure new JAni to match pertinent current player stats
		view.state	= this.dir;						// update avatar / player visual
		view.reset().enable().play();				// Reset, enable, then play the new JAni
		// --------------------------------
		// Change Player Avatar
		// --------------------------------
		this.avatar		= view;						// Change player avatar to new JAni
		//console.log( avatar );
		return true; // success
	}

	// --------------------------------
	// Graphic Skin Handling
	// --------------------------------
	// Set the player's image for a given type ('head', 'body', 'sword')
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * type		- [string] The type of skin to change ('head', 'body', 'sword').
	// * filename	- [string] The filename of the image asset (e.g. 'head104').
	skin( type, filename ) {
		// Get allowable skin type
		const types		= [ 'SPRITES', 'HEAD', 'BODY', 'SWORD' ];
		if ( !types.includes(type) ) {
			console.warn( `Player skin(), invalid type: ${type}` );
			return false;
		}
		// Set the filename as the current image
		this[type]		= filename;					// example: this.head = 'head104'
		// Update all player animation image attributes
		for ( const mode in this.gears )
			this.client.fantascope.setImage( mode, `player${this.id}`, type, filename ); // set new skin
		return true; // success
	}

	// --------------------------------
	// Key Listener(s) & Handling
	// --------------------------------
	// Register key presses.
	// * data	- [object] Data passed from keyboard listener event.
	keyPress( data ) {
		// Handle key event
		const now	= performance.now();					// current time
		const key	= this.keysListen.get( data.key );		// keyboard key being pressed
		if (!key) return; // Ignore keys not in keysListen
		//console.log( key );
		// Set key state to true
		if ( !(key in this.keys) )
			this.keys[key] = true; // set key pressed as active
		//console.log( `Key pressed: ${data.key} (Mapped: ${key})`, this.keys );
	}

	// Handle key releases.
	// * data - [object] Data passed from keyboard listener event.
	keyRelease( data ) {
		// Remove the key from the active keys [array]
		const key	= this.keysListen.get( data.key );		// Keyboard key being released
		if ( !key ) return;
		// Remove key on release
		if ( this.keys.hasOwnProperty(key) )
			delete this.keys[key];
		//console.log( `Key released: ${data.key} (Mapped: ${key})`, this.keys );
	}

	// --------------------------------
	// Central Loop
	// --------------------------------
	// Central player timeout loop.
	// * elapsedTime	- how much time has passed since the ticker started.
	// * tickDelay		- how much time between each tick (ie. 60ms)
	// * tickCount		- how many ticks have occurred
	// RETURNS: [void].
	pulse( { elapsedTime, tickDelay, tickCount } ) {
		// Check if player is frozen
		if ( this._clocks?.freeze!==null ) {
			// Get current time
			const now	= performance.now();
			// Determine if frozen
			if ( now<this._clocks.freeze )
				return; // player frozen
			else this._clock( 'freeze' ); // unfreeze
		}
		// Update only every 33.33ms
		if ( tickCount%2!==0 ) return;
		// Refocus the animation
		this.refocus();
		// Perform core central actions
		this.input(); // check player input
	}

	// Handle player input.
	// RETURNS: [void].
	input() {
		// --------------------------------
		// Determine Active Keycode(s)
		// --------------------------------
		// Generate [object] of modes player is actively trying to shift into (by keypress)
		// Get current time
		const now			= performance.now();
		let keycodes		= {};
		for ( const mode in this.gears ) {
			let keycode		= this.keycode( this.gears[mode].keycode );
			if ( keycode!==false ) {
				if ( !this.gears[mode].turboBlocked ) {			// 🚨 Only allow non-blocked modes
					keycodes[mode] = keycode;
					if ( this.gears[mode].signaled===null )		// 🚨 Only update if first press
						this.gears[mode].signaled = now;
				}
			}
			else {
				this.gears[mode].turboBlocked	= false;		// 🚨 Reset block when key is released
				this.gears[mode].signaled		= null;			// 🚨 Reset signaled on release
			}
		}
		// --------------------------------
		// Check For Player Gear Change
		// --------------------------------
		// Determine current player mode & make move(s)
		const currentMode	= this.getMode( 'mode' );
		const gearshifts	= this.gears[ currentMode ].gearshifts; // get current player gear
		let enacted			= false;
		for ( const mode of gearshifts ) {
			if ( mode in keycodes ) {
				// Determine turbo time remaining (or null for infinite)
				let turbo	= (this.gears?.[mode]?.turbo ?? 0)>0 && this.gears?.[mode]?.signaled>0
					? this.gears?.[mode]?.signaled + this.gears[mode].turbo
					: null;
				//console.log( now, turbo );
				// If turbo is active, run gear
				if ( turbo===null || now<turbo ) {
					this.runMode( mode, keycodes[mode] );
					enacted = true;
				}
				else if ( now>=turbo && !this.gears[mode].turboBlocked ) {
					//console.log( `Turbo expired for ${mode}, locking out` );
					this.gears[mode].turboBlocked = true; // 🚨 Lock this mode from re-triggering
					if ( this.gears[mode].shiftback ) {
						//console.log( `Shifting back to ${this.gears[mode].shiftback}` );
						this.runMode( this.gears[mode].shiftback ); // 🚨 Shift back mode
					}
				}
				break;
			}
		}
		// Run fallback if no gearshift occurred
		if ( !enacted )
			this.runMode( 'idle' );
	}

	// Check for available requested key code(s).
	// RETURNS: [...] value on success, else [bool] `false` on fail.
	// * codes	- [string|stray] Value of code(s) to check for (ie. 'arrow')
	keycode( codes ) {
		// If codes is null, return true
		if ( codes===null ) return false;
		// If directions is an int, convert it to an array
		if ( jsos.prove(codes,'string') )
			codes	= [codes];
		// If it's neither a string nor an array of strings, throw an error
		codes	= jsos.typecast( codes, 'stray' );
		if ( !codes.length>0 )
			throw new Error( 'Invalid input: arg `codes` must be an [string] or an [array] of [strings].' );
		// Begin parsing which keycode(s) are available
		let keycodes	= []; // return [array] of pertinent pressed keys
		// Iterate requested codes & determine active key code(s) available
		for ( const code of codes ) {
			switch ( code ) {
				case 's':
					return this.keys.hasOwnProperty(code) && this.keys[code]===true; // determine if pressed
				case 'arrows':
					// Determine move keys
					const dirKeys	= [ 'up', 'left', 'down', 'right' ]; // valid dir keys
					// Loop through the keys array from the end to the beginning
					for ( let i=0; i<dirKeys.length; i++ ) {
						// Determine direction code name
						let dir		= dirKeys[i];
						// Check if the key is a direction key
						if ( this.keys?.[dir] )
							keycodes.push( i );
					}
					// Check if keys pressed
					return keycodes.length>0 ? keycodes : false;
				default: return false; // fail
			}
		}
		return false; // no keycode
	}

	//-------------------------
	// Modal Methods
	//-------------------------
	// Set a mode state (override OSConfigurable parent method).
	// * mode		- [string] name of mode to set.
	// * state		- [string] value of mode.
	// RETURNS: [bool] `true` on success, else `false`.
	setMode( mode, state ) {
		// If setting state, handle differently
		if ( mode==='mode' && state!==this.getMode('mode') ) { // determine if status is changing
			if ( super.setMode('mode',state) ) {
				//console.log( `Changing player mode: ${state}` );
				this.emit( 'gearshift', null, state ); // emit mode change event
				return true;		// success
			}
			else return false;		// fail
		}
		// Set some other mode besides 'status'
		return super.setMode( mode, state ); // call super
	}

	// Try to operate the player mode based upon key priority
	// * mode		- [string] Value of the mode the player is in.
	//   data		- [...] data pertinent to action.
	runMode( mode, data=null ) {
		// Alert player mode change if need-be
		if ( this.getMode('mode')!==mode )
			this.gearshift( mode ); // call gearshift
		// Perform action based upon mode
		switch ( mode ) {
			case 'idle':	return true;					// do nothing
			case 'walk':	return this.walk( data );		// walk
			case 'sword':	return this.slash();			// Slash sword
			default:		return true;
		}
		return false; // mode not recognized
	}

	// Try to gearshift the player mode based upon key priority
	// * mode	- [string] Value of the mode name the player is changing to.
	gearshift( mode ) {
		// Set new mode
		this.setMode( 'mode', mode ); // change player mode
		// Perform action based upon new mode
		switch ( mode ) {
			case 'sword': // play sword sound effect
				this.client.soundboard.playSound( 'sword', 1 );
				break;
		}
	}

	// Freeze the player for a certain amount of time.
	// * time		- [int] Value of how long to freeze the player in ms.
	/*freeze( time ) {
		// If directions is an int, convert it to an array
		if ( !jsos.prove(time,'int') || time<=0 ) return false;
		// Get current time
		const now	= performance.now();
		// Set the frozen time as now + time
		//this._clock( 'freeze', now+time );
	}*/

	//-------------------------
	// Player Actions
	//-------------------------
	// Move the player in a given direction (walking).
	// * dirs		- [int|array] Value(s) of direction(s) to move (0=up, 1=left, 2=down, 3=right).
	walk( dirs ) {
		// If directions is an int, convert it to an array
		if ( jsos.prove(dirs,'int') )
			dirs	= [dirs];
		// If it's neither an int nor an array of ints, throw an error
		dirs	= jsos.typecast( dirs, 'intray' );
		if ( !dirs.length>0 )
			throw new Error( 'Invalid input: arg `dirs` must be an [int] or an [array] of [ints].' );
		// Footsteps make a sound every #nth iteration
		const soundStep		= this.soundStep;
		const soundDelay	= 10; // even [int] every # interations plays a full SFX footstep cycle
		if ( this.soundStep==0 || this.soundStep==soundDelay/2 ) {
			const step	= this.soundStep===0 ? 'steps' : 'steps2';
			this.client.soundboard.playSound( step, 0.6 );
		}
		this.soundStep = (this.soundStep+1) % soundDelay;
		// Iterate requested directions & move
		for ( const dir of dirs ) {
			// Move player in requested direction
			switch ( dir ) {
				case 0: // up
					//console.log( 'Moving up' );
					// Add logic to move the player up
					this.setDirection( 0 );
					this.move( 0, -this.speed );
					break;
				case 1: // left
					//console.log( 'Moving left' );
					// Add logic to move the player left
					this.setDirection( 1 );
					this.move( -this.speed, 0 );
					break;
				case 2: // down
					//console.log( 'Moving down' );
					// Add logic to move the player down
					this.setDirection( 2 );
					this.move( 0, this.speed );
					break;
				case 3: // right
					//console.log( 'Moving right' );
					// Add logic to move the player right
					this.setDirection( 3 );
					this.move( this.speed, 0 );
					break;
				default:
					console.log( 'Invalid direction' );
			}
		}
	}

	// Move the player in a given direction (walking).
	// * dirs		- [int|array] Value(s) of direction(s) to move (0=up, 1=left, 2=down, 3=right).
	slash() {
		// Get current time
		//const now	= performance.now();
		// Check if slash motion is complete
		/*if ( now>=(this._clocks.sword+this.gears.sword.turbo) ) {
			 console.log( 'changing' );
		}
		else {
			//console.log( now, this._clocks.sword, this.gears.sword.turbo );
			//console.log( 'slashing' );
		}*/
		//return true; // continue
	}

	// --------------------------------
	// Movement Handling
	// --------------------------------
	// Change player direction
	// * dir	- [int] value of direction to move: 0=up, 1=right, 2=down, 3=left
	setDirection( dir ) {
		this.dir			= dir;		// change direction
		this.avatar.state	= dir;		// update avatar / player visual
	}

	//-------------------------
	// Movement Action(s)
	//-------------------------
	// Refocus the player focal point (animation anchor).
	refocus() {
		// Get player anchor definitions
		const { playerGlobalX, playerGlobalY } = this.client.camera.getPlayerLocation();
		const destX		= playerGlobalX;// - this.anchor.width/2;
		const destY		= playerGlobalY;// - this.anchor.height/2;
		// Convert to screen coordinates
		const screenPos	= this.client.camera.globalToScreen( destX, destY );
		this.focus.move( screenPos.x, screenPos.y ); // move x & y
	}

	// Move the actual player X & y some amount.
	// * argX	- [int] Value of how much to move the player's x.
	// * argY	- [int] Value of how much to move the player's y.
	move( argX, argY ) {
		// Declare variable(s)
		let testX, testY;
		const tileGrid	= this.client.config.tileGrid;
		const speed		= this.speed * tileGrid;
		let forceX		= argX * tileGrid;
		let forceY		= argY * tileGrid;
		// Begin testing
		let testing		= forceX!==0 || forceY!==0;
		while ( testing ) {
			testing	= false;
			testX	= forceX;
			testY	= forceY;
			let isVertical		= this.dir===0 || this.dir===2;
			let forcePrimary	= isVertical ? forceY : forceX;
			let dirIndex		= this.dir * 2 + (isVertical ? 1 : 0);
			let dirModifier		= this.dirgo[dirIndex];
			// Check for movement
			if ( Math.abs(forcePrimary)>=2 ) {
				// Check for wall
				if ( this.onwall( this.collider, testX /tileGrid, testY/tileGrid ) ) {
					testing = true;
					if ( isVertical )
						forceY	-= dirModifier / 2;
					else forceX	-= dirModifier / 2;
				}
			}
			else {
				let moveOffset		= 0;
				let blockDetected	= [ false, false, false, false ];
				for ( let i=0; i<4; i++ ) {
					// Handle X & Y movement test
					testX	= isVertical
						? ( i%2===0 ? (tileGrid*3)/2 - moveOffset : -( (tileGrid*3)/2 - moveOffset) )
						: ( i<2 ? 0 : (tileGrid / 2) * dirModifier );
					testY	= isVertical
						? ( i<2 ? 0 : (tileGrid/2) * dirModifier )
						: ( i%2===0 ? tileGrid - moveOffset : -(tileGrid - moveOffset) );
					// Check for wall
					if ( this.onwall( this.collider, testX/tileGrid, testY/tileGrid ) ) {
						if ( moveOffset<tileGrid/2 ) {
							moveOffset += 2;
							i--;
							continue;
						}
						blockDetected[i] = true;
					}
				}
				// Check if no blocks detected
				if ( !blockDetected[0] && !blockDetected[2] ) {
					if ( isVertical ) forceX += speed;
					else forceY += speed;
				}
				// Handle walls detected
				else if ( !blockDetected[1] && !blockDetected[3] ) {
					if ( isVertical ) forceX -= speed;
					else forceY -= speed;
				}
				// Check for wall again & stop movement if so
				if ( this.onwall( this.collider, testX/tileGrid, testY/tileGrid ) ) {
					if ( isVertical ) forceY = 0;
					else forceX = 0;
				}
			}
		}
		// Capture current player x & y coordinates
		const playerX	= this.anchor.x;
		const playerY	= this.anchor.y;
		// Calculate new x & y
		const newX		= playerX + forceX/tileGrid; //argX;
		const newY		= playerY + forceY/tileGrid; //argY;
		// Move the player anchor
		const move		= this.client.camera.checkPlayerPosition( newX, newY );
		this.level		= move.level; // set level [string] name
		this.anchor.move( move.x, move.y );
	}
}
