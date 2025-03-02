console.log( 'jestAlert: js/os/OSConfigurable.js loaded' );

// OSConfigurable class
class OSConfigurable {
	// Declare properties
	_modes 			= {};			// [object] of mode statuses
	_options		= {};			// specific options passed to constructor
	_data			= {};			// [object] of misc. data to set internally
	_temp			= {};			// [object] of temporary data for progressive actions
	_clocks			= {};			// [object] of clocked time(s)

	// Initializes a new OSConfigurable instance.
	// RETURNS: [void] Nothing.
	// * options		- [Object] Configuration options.
	constructor( options={} ) {
		// Save argument data
		this._options		= options;
	}

	//-------------------------
	// Data Methods
	//-------------------------
	// Sets or updates a variable in the container.
	// RETURNS: [void].
	// * name		- [string|Array<string>] Path name or group + key (e.g., ['group', 'key']).
	// * value		- [...] Value to store.
	set( name, value ) {
		if ( Array.isArray(name) ) {
			const [group,key] = name;
			if ( !(group in this._data) )
				this._data[group] = {};
			this._data[group][key] = value;
		}
		else {
			name = jsos.pathologize( name );
			this._data[name] = value;
		}
	}

	// Retrieves a variable from the container (optionally removes it).
	// RETURNS: [...] Value of the variable, or false if not found.
	// * name		- [string|Array<string>] Path name or group + key.
	// * wipe		- [boolean] Whether to remove the variable (default: false).
	get( name, wipe=false ) {
		if ( Array.isArray(name) ) {
			const [group,key] = name;
			if ( group in this._data && key in this._data[group] ) {
				const value = this._data[group][key];
				if ( wipe )
					delete this._data[group][key];
				return value;
			}
		}
		else {
			name = jsos.pathologize( name );
			if ( name in this._data ) {
				const value = this._data[name];
				if ( wipe )
					delete this._data[name];
				return value;
			}
		}
		return false;
	}

	// Checks if a variable exists in the container.
	// RETURNS: [boolean] True if the variable exists, false otherwise.
	// * name		- [string|Array<string>] Path name or group + key.
	has( name ) {
		if ( Array.isArray(name) ) {
			const [group,key] = name;
			return group in this._data && key in this._data[group];
		}
		else {
			name = jsos.pathologize( name );
			return name in this._data;
		}
	}

	// Deletes variables from the container.
	// RETURNS: [boolean] True if successful, false otherwise.
	// * ...names	- [Array<string>] Path names or group + key to delete.
	unset( ...names ) {
		names.forEach( ( name ) => {
			if ( Array.isArray(name) ) {
				const [group,key] = name;
				if ( group in this._data && key in this._data[group] ) {
					delete this._data[group][key];
				}
			}
			else {
				name = jsos.pathologize( name );
				if ( name in this._data ) delete this._data[name];
			}
		});
		return true;
	}

	// Clears all data from the container.
	// RETURNS: [void].
	clear() {
		this._data = {}; // Reset the container.
	}

	// Temporarily pushes a value onto `_temp` and pops it off.
	// RETURNS: [...] Pushed or popped value.
	// * lever   - [boolean] Whether to push (true) or pop (false).
	// * name    - [string] Key name to store the variable under.
	// * value   - [...] Value to temporarily store (only used if `lever` is true).
	pushpop( lever=true, name='variable', value=null ) {
		this._temp = this._temp || {}; // Ensure `_temp` exists.
		if ( lever ) {
			// Push value onto `_temp`.
			this._temp[name] = value;
			return value;
		}
		else {
			// Pop value off `_temp`.
			const result = this._temp[name] ?? null;	// Retrieve and ensure null fallback.
			delete this._temp[name];					// Remove key from `_temp`.
			return result;
		}
	}

	// Finds variables in `_data` by path patterns, including wildcards.
	// RETURNS: [Object|false] Matches as key-value pairs, or false if no matches.
	// * ...args	- [Array<string>] Paths or patterns to search for (e.g., 'group/*').
	// NOTES:
	// - Use `*` for wildcard matches (e.g., 'group/*').
	// - If `snip` is provided, trims the specified number of path parts.
	herd( ...args ) {
		// Ensure `_temp` exists.
		this._temp		= this._temp || {};
		// Retrieve and clear the `snip` value from `_temp`.
		const snip		= this.pushpop( false, 'snip' ); // Pop temporary snip value.
		const matches	= {};
		let found		= false;
		// Process each argument.
		args.forEach(
			( arg ) => {
				const name			= jsos.pathologize( arg );
				const hasWildcard	= name.includes( '*' );
				// Handle wildcards.
				if ( hasWildcard ) {
					const pathParts	= name.split( '/' );
					const loose		= pathParts[pathParts.length-1] === '*';
					// Search `_data` for matches.
					for ( const key in this._data ) {
						const keyParts	= key.split( '/' );
						// Skip if the key is shorter than the path pattern.
						if ( keyParts.length<pathParts.length ) continue;
						// Check each part of the key against the pattern.
						let match		= true;
						for ( let i=0; i<pathParts.length; i++ ) {
							// If loose match, accept any extra parts beyond the wildcard.
							if ( i>=pathParts.length-1 && loose ) break;
							// Skip if parts don't match and it's not a wildcard.
							if ( pathParts[i]!=='*' && pathParts[i]!==keyParts[i] ) {
								match	= false;
								break;
							}
						}
						// If matched, add to results.
						if ( match ) {
							found = true;
							matches[key] = this._data[key];
						}
					}
				}
				// Handle exact matches.
				else if ( this.has(name) ) {
					found = true;
					matches[name] = this._data[name];
				}
			});

		// Return false if no matches found.
		if ( !found ) return false;

		// Apply `snip` logic to trim path parts if needed.
		if ( typeof snip==='number' && snip>0 ) {
			const trimmedMatches = {};
			Object.keys(matches).forEach(
				( key ) => {
					const keyParts		= key.split( '/' );
					// Skip if snipping would remove the entire key.
					if ( keyParts.length<=snip ) return;
					// Trim path parts and reindex.
					const trimmedKey	= keyParts.slice(snip).join('/');
					trimmedMatches[trimmedKey] = matches[key];
				});
			return trimmedMatches;
		}

		// Return result(s)
		return matches;
	}


	//-------------------------
	// Modal Methods
	//-------------------------
	// Set a mode state
	// * mode	- [string] name of mode to set.
	// * state	- [string] value of mode.
	// RETURNS: [bool] `true` on success, else `false`.
	setMode( mode, state ) {
		//console.log( 'jestAlert: Changing mode ...' );
		// --------------------------------
		// Push argument(s)
		// --------------------------------
		this._modes[mode]	= state;
		return true; // success
	}

	// Get a mode state
	// * mode	- [string] name of mode to set.
	// RETURNS: [string] value of mode state.
	getMode( mode ) {
		//console.log( 'jestAlert: Getting mode ...' );
		// --------------------------------
		// Push argument(s)
		// --------------------------------
		if ( !this._modes[mode] )
			this._modes[mode]	= 'default';
		return this._modes[mode]; // mode state
	}

	//-------------------------
	// Timer Functions
	//-------------------------
	// Update some clock counter
	//   name		- [string] Optional name of the clock (default: 'default')
	//   datetime	- [boolean] Whether to log Date.now(), or performance ( defaults to false, e.g. performance.now() )
	//   report		- [boolean] Whether to console log a report
	_clock( name='default', datetime=false, report=false ) {
		// Ensure clock storage exists
		if ( !this._clocks ) this._clocks = {};
		// Get current timestamp
		const now	= !datetime ? performance.now() : Date.now();
		// Initialize clock if not set
		if ( !this._clocks[name] )
			this._clocks[name] = now;
		// Calculate time difference
		const time	= now - this._clocks[name];
		// Update stored timestamp
		this._clocks[name] = now;
		// Output a report if requested
		if ( report )
			console.log( `Clock '${name}' recorded: ${time / 1000} seconds` );
		return time; // Return time
	}
}
