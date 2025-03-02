console.log( 'jestAlert: js/system/interface/JSOS/classes/JSOSUtility.js loaded' );

// Jest OS class
class JSOSUtility extends JSOSReadWrite {
	// Creates the class [object] with configurable components.
	// RETURNS: [object] A new instance.
	// * options		- [object] Configuration options for the class [object].
	constructor( options={} ) {
		super( options ); // call parent constructor
	}

	// Helper function to generate a random key
	rankey() {
		return `key_${Math.random().toString(36).substr(2, 9)}`; // Example random key generator
	}

	//-------------------------
	// Class Extension
	//-------------------------
	// Load mixin data into class prototype.
	// * targetClass	- [string] value of class prototype to implement mixins into.
	// * names			- [array] of mixin names to implement.
	// RETURNS: [bool] `true` on success, else `false`.
	static implement( targetClass, names ) {
		names.forEach(
			name => {
				if ( Mixins[name] ) {
					Object.assign( targetClass.prototype, JestMixins[name] );
				}
				else {
					throw new Error( `Mixin ${name} not found` );
				}
			});
	}

	//-------------------------
	// HTML Element Methods
	//-------------------------
	// Create an HTML element from markup
	generateElement( type='div', id='', classes=[], markup='', objectURL=null ) {
		// Declare variables
		let datatype	= null;	// used to check datatype(s)
		let el			= null;	// used to create HTML Element
		// Create HTML Element by requested type
		switch ( type ) {
			case 'audio':
				el	= new Audio( objectURL || '' );
				break;
			case 'image':
				el	= new Image( objectURL || '' );
				break;
			default:
				el	= document.createElement( String(type) );
		}
		// Add markup
		el.innerHTML = markup!==null ? String(markup) : '';
		// Add unique identifier
		el.id = id!==null ? String(id) : '';
		// Add class(es)
		datatype = this.datatype( classes );
		if ( datatype==='string' )
			el.classList.add( classes );
		else if ( datatype==='array' ) {
			for ( const className of classes ) {
				el.classList.add( String(className) );
			}
		}
		// Return generated element [object]
		return el;
	}

	// Flip the classes on a DOM element or array of elements
	// RETURNS: [bool] `true` on success else `false` on fail.
	// * elements		- [HTMLElement|HTMLElement[]] Element(s) to apply class-flip to.
	// * add			- [string|string[]] Class(es) to add.
	// * remove			- [string|string[]] Class(es) to remove.
	classflip( elements, add=[], remove=[] ) {
		// Normalize inputs
		if ( !(elements instanceof Array) )	elements	= [elements];
		if ( !(add instanceof Array) )		add			= [add];
		if ( !(remove instanceof Array) )	remove		= [remove];
		// Iterate through elements
		for ( const element of elements ) {
			// Validate each element
			if ( !element || !(element instanceof HTMLElement) ) {
				console.error( 'Invalid element:', element );
				continue; // Skip invalid elements
			}
			// Add and remove classes
			element.classList.add( ...add );
			element.classList.remove( ...remove );
		}
		return true; // Success
	}

	//-------------------------
	// DATA Parsing
	//-------------------------
	// Convert version between string and integer formats.
	// @param {string|number} version - Version to convert.
	// @param {string} [cast='verse'] - Target format: 'verse' (string) or 'intverse' (integer).
	// @returns {string|number|null} - Converted version or null on fail.
	intvert( version, cast='verse' ) {
		// Check if version supplied
		if ( !version ) return null;
		// Convert number to version ie. 100 to 1.0.0
		if ( cast==='verse' && typeof version==='number' ) {
			return
				version
					.toString()
					.padStart( 3, '0' )
					.match( /(\d)(\d)(\d)/ )
					.slice( 1, 4 )
					.join( '.' );
		}
		// Parse
		if ( cast==='intverse' && typeof version==='string' && /^\d+\.\d+\.\d+$/.test(version) ) {
			return parseInt( version.replace(/\./g, ''), 10 );
		}
		return null; // return [null] if fail
	}

	// Pathologize (clean parse a path & return result)
	// RETURNS: [string] or [array] of [strings] depending on request; `null` if empty
	// * path		- [string] or [array] of [strings] to pathologize
	//   explode	- [boolean] whether to return clean split [array] or pathologized [string]; defaults to false
	//   delimiter	- [string] value of delimiter between values ie. ',' or '/' for file paths, etc.
	pathologize( path, explode=false, delimiter='/' ) {
		// Merge the path by delimiter
		path	= path.join( delimiter );
		// Remove trailing slashes
		path	= path.replace( /^\/+/g, '' );				// leading slashes
		path	= path.replace( /\/+$/, '' );				// ending slahes
		path	= path.replace( /([^:])(\/\/+)/g, '$1/' );	// double slashes
		// Explode into [array] if requested (else keep as [string])
		if ( explode===true )
			path = path.split( delimiter );
		return path; // return parsed path
	}

	// Parse a multiuniverse stray path into an object with a customizable delimiter.
 	// @param {string|null} stray				- Multiuniverse stray path.
	// @param {string|null} [fallverse=null]	- Default version fallback if not found.
	// @param {string} [delimiter='/']			- Custom delimiter for parsing.
	// @returns {object|null}					- Parsed multiuniverse object or null on fail.
	multiuniverse( stray=null, fallverse=null, delimiter='/' ) {
    	// Validate input: `stray` must be a non-empty string
		if ( !stray || typeof stray!=='string') return null;
		// Clean and split the input path into parts using `pathologize`
		const parts		= pathologize( stray, true, delimiter );
		// If fewer than 2 parts exist, the path is too short to process
		if ( parts.length<2 ) return null;
		// Extract the last part of the path (could be a version or a type)
		const end		= parts.pop();
		let type, version, verse=null, intverse=null;
		// Check if the last part matches a valid version format (e.g., "1.2.3")
		if ( /^\d+\.\d+\.\d+$/.test(end) ) {
			type		= parts.pop();		// If valid version, the previous part is the type
			version		= end;				// Set the version
		}
		else {
			type		= end;				// If not a valid version, treat it as the type
			// Use `fallverse` if it is a valid fallback version
			version		= fallverse && /^\d+\.\d+\.\d+$/.test(fallverse) ? fallverse : null;
		}
		// Convert the version into both string ('verse') and integer ('intverse') formats
		if ( version ) {
			verse		= intvert( version, 'verse' );
			intverse	= intvert( version, 'intverse' );
		}
		// Rebuild various structured outputs from the processed parts
		const base		= parts.join( delimiter );					// Base path without type or version
		const trail		= [ ...parts, type ];						// Full path as an array
		const path		= trail.join( delimiter );					// Full path as a string
		const typeverse	= version ? [type,verse] : [type];			// Type + version as an array
		const issue		= [ ...parts, ...typeverse ];				// Full issue as an array
		const edition	= issue.join( delimiter );					// Full issue as a string
		// Return the structured object
		return {
			base,		// Base path as string.
			type,		// Type of the multiuniverse.
			verse,		// Version as a string.
			path,		// Full path as a string.
			trail,		// Path as an array.
			edition,	// Full edition path as a string.
			issue,		// Edition as an array.
			intverse	// Integer version or null.
		};
	}
}
