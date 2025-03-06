console.log( 'jestAlert: js/apps/jest/components/JestJaniParser.js loaded' );

//-------------------------
// JestJaniParser Class
//-------------------------
class JestJaniParser {
	// Declare properties
	keywords	= null;				// [object] Set array of acceptable keyword(s).

	//-------------------------
	// Instantiation
	//-------------------------
	// Construct the [object].
	// RETURNS: [void].
	constructor() {
		// Define reserved keywords
		this.keywords = new Set( ['ANI', 'ANIEND', 'ATTR', 'ATTREND', 'SPRITE'] );
	}

	//-------------------------
	// Frame Handling
	//-------------------------
	// Parses a JAni file into an Animation object
	// * filename		- [string] value of Jani filename to identify animation.
	// * fileContent	- [string] value of Jani file content to generate animation.
	parse( { name: filename, data: fileContent } ) {
		// Instantiate variables
		const lines			= fileContent.split('\n').map( line=>line.trim() );
		const frames		= [];
		const sprites		= [];
		const opts			= {};				// Store options as an [object]
		const groups		= new Set();		// Store unique groups
		let region			= null;
		let currentFrame	= [];
		// Iterate over each line in the supplied Jani
		lines.forEach(
			line => {
				//-------------------------
				// Handle Region Changes
				//-------------------------
				if ( line.startsWith('OPTS') && region!=='OPTS' ) {
					region	= 'OPTS';
				}
				else if ( line.startsWith('OPTSEND') && region==='OPTS' ) {
					region	= null;
				}
				else if ( line.startsWith('ANI') && region!=='ANI' ) {
					region	= 'ANI';
				}
				else if ( line.startsWith('ANIEND') && region==='ANI' ) {
					region	= null;
				}
				else if ( line.startsWith('SPRITE') ) {
					const sprite = this.parseSpriteLine( line );
					sprites.push( sprite );
					groups.add( sprite.group );
				}
				//-------------------------
				// Process Attributes Inside the `OPTS` Region
				//-------------------------
				else if ( region==='OPTS' ) {
					const parts	= line.split(/\s+/); // Split by whitespace
					// Ensure the first word isn't a keyword
					if ( this.keywords.has(parts[0]) ) {
						console.warn( `Skipping potential misparsed option: ${line}` );
						return; // Skip this line to avoid conflicts
					}
					// Boolean flag options (e.g., 'LOOP', 'CONTINUOUS')
					if ( parts.length===1 ) {
						opts[parts[0]]	= true;
					}
					// Key-value options (e.g., 'DEFAULTATTR1 hat0.png')
					else if ( parts.length===2 ) {
						opts[parts[0]]	= parts[1];
					}
				}
				//-------------------------
				// Process Frames Inside the `ANI` Region
				//-------------------------
				else if ( region==='ANI' ) {
					if ( line==='' ) {
						if ( currentFrame.length>0 ) {
							frames.push( this.parseFrame(currentFrame,sprites) );
							currentFrame	= [];
						}
					}
					else currentFrame.push( line );
				}
			});
		// Create animation [object]
		const animation		= new AnimationAnimation( filename );
		frames.forEach( frame=>animation.addFrame(frame) ); // iterate & add frame to animations
		// Store the options in the animation
		animation.options	= opts;
		// Store the groups in the animation
		animation.groups	= groups;
		// Preload attribute group name(s) into config as attribute(s)
		// NOTE: This is used as default image(s) that can skinned/overrode.
		animation.setAttribute( 'groups', Array.from(groups) );
		return animation; // return animation [object]
	}

	// Parses a JAni sprite definition
	parseSpriteLine( line ) {
		// Split each part of the line by space-key
		const parts	= line.split( /\s+/ );
		// Parse & return new Sprite [object]
		return new AnimationSprite(
			parseInt( parts[1] ),			// id
			parts[2],						// group
			parts.slice(7).join(' '),		// label (e.g., 'shadow', 'shield up')
			parseInt( parts[3] ),			// sx
			parseInt( parts[4] ),			// sy
			parseInt( parts[5] ),			// width
			parseInt( parts[6] )			// height
			);
	}

	// Parses a JAni frame and returns a Frame object
	parseFrame( frameLines, sprites ) {
		// Create new frame [object]
		const frame	= new AnimationFrame(); // Create a new frame
		// Iterate over each "frames" line & parse
		frameLines.forEach(
			line => {
				const parts		= line.split(',').map( part=>part.trim() );
				const layer		= frame.addLayer(); // Add a new layer
				parts.forEach(
					part => {
						const [spriteId,x,y]	= part.split(/\s+/).map(Number);
						//console.log( spriteId, x, y );
						const sprite = sprites.find( s=>s.id===spriteId );
						if ( sprite ) {
							const layerSprite	= Object.create( sprite );
							layerSprite.move( x, y, 0 ); // Adjust the position
							layer.sprites.push( layerSprite );
						}
					});
			});
		return frame;
	}
}
