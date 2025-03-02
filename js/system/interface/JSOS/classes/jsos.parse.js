console.log( 'jestAlert: js/system/interface/JSOS/classes/JSOSParse.js loaded' );

// Jest OS class
class JSOSParse {
	//-------------------------
	// Instantiation Methods
	//-------------------------
	// Creates the class [object].
	// RETURNS: [object] A new instance.
	constructor() { }

	//-------------------------
	// Mathematics
	//-------------------------
	// Round a value to n decimal points.
	// RETURNS: [any] The parsed result.
	// * num			- [int] Value to round.
	// * decimalPlaces	- [int] Value of number of decimal places to round to.
	roundTo( num, decimalPlaces ) {
		const factor = Math.pow( 10, decimalPlaces );
		return Math.round( (num+Number.EPSILON)*factor ) / factor;
	}

	//-------------------------
	// Parsing Methods
	//-------------------------
	// Parses a value into a specified format or type.
	// RETURNS: [any] The parsed result.
	// * value - [string|number] The value to parse.
	// * type  - [string] The type of parse to perform (e.g., 'int', 'title').
	parse( value, type ) {
		// Validate input: parsing non-string types (except integers) is not allowed.
		if ( typeof value!=='string' && type!=='int' && type!=='integer' ) {
			console.warn( `Invalid value type for parse: expected string for type "${type}"` );
			return value;
		}
		// Parse based on the specified type.
		switch ( type ) {
			case 'int':
			case 'integer':		return this._parseInteger( value );
			case 'title':		return this._parseTitle( value );
			case 'brand':		return this._parseBrand( value );
			case 'variable':
			case 'var':			return this._parseVariable( value );
			case 'alphanumeric':
			default:			return this._parseAlphanumeric( value );
		}
	}

	//-------------------------
	// Parse Helpers
	//-------------------------
	// Parses a string to remove all non-alphanumeric characters.
	// RETURNS: [string] The cleaned string containing only a-z, 0-9.
	// * value - [string] The value to parse and clean.
	_parseAlphanumeric( value ) {
		return value.replace( /[^a-z0-9]/gi, '' );
	}

	// Parses a string into an integer by removing non-numeric characters.
	// RETURNS: [number] The parsed integer.
	// * value - [string] The value to parse.
	_parseInteger( value ) {
		return parseInt( value.replace( /[^0-9]/g, '' ) );
	}

	// Converts a string to title case (e.g., "hello world" -> "Hello World").
	// RETURNS: [string] The title-cased string.
	// * value - [string] The string to convert.
	_parseTitle( value ) {
		return value
			.split( ' ' )
			.map( (word)=>this._parseBrand(word) )
			.join( ' ' );
	}

	// Capitalizes the first letter of a string and ensures it's alphanumeric.
	// RETURNS: [string] The formatted string.
	// * value - [string] The string to process.
	_parseBrand( value ) {
		value = this._parseAlphanumeric( value );
		return value.charAt(0).toUpperCase() + value.slice(1);
	}

	// Formats a string as a variable-friendly identifier (lowercase, underscores).
	// RETURNS: [string] The variable-friendly string.
	// * value - [string] The string to convert.
	_parseVariable( value ) {
		value = value.replace( / /g, '_' ); // Replace spaces with underscores.
		return value.replace( /[^A-Za-z0-9_-]/g, '' ).toLowerCase(); // Remove invalid characters and lowercase.
	}

	//-------------------------
	// Typecasting Methods
	//-------------------------
	// Converts a value to a specified type.
	// RETURNS: [any] The converted value.
	// * value  - [...] The value to convert.
	// * type   - [string] The target type (e.g., 'array', 'object').
	// * action - [string] Additional action for the conversion (optional).
	typecast( value, type, action ) {
		switch ( type ) {
			case 'array':	return this._toArray( value, action );
			case 'object':	return this._toObject( value );
			case 'obray':	return this._toObray( value );
			case 'stray':	return this._toStray( value );
			case 'intray':	return this._toIntray( value );
			default:		return value; // Return the original value if no match is found.
		}
	}

	//-------------------------
	// Typecasting Helpers
	//-------------------------
	// Converts a value to an array.
	// RETURNS: [array] The converted array.
	// * value		- [...] The value to convert.
	// * action		- [string] Additional action for array conversion (optional).
	_toArray( value, action ) {
		// Convert an [object] to an array
		if ( action==='collect' && this.prove(value,'object') ) {
			return Object.values( value );
		}
		// Return [array] value
		return Array.isArray(value) ? value : [value];
	}

	// Converts a value to an object, using strings/numbers as keys.
	// RETURNS: [object] The converted object.
	// * value - [...] The value to convert.
	_toObject( value ) {
		if ( typeof value!=='object' ) {
			const obj	= {};
			const arg	= Array.isArray(value) ? value : [value];
			arg.forEach(
				( key ) => {
					if ( typeof key==='string' || typeof key==='number' ) {
						obj[ key.toString() ] = true;
					}
				});
			return obj;
		}
		return value;
	}
	// Converts a value to an array of objects, filtering out non-object values.
	// RETURNS: [array] The filtered array of objects.
	// * value	- [...] The value to filter.
	_toObray( value ) {
		return this._toArray(value).filter( (item)=>this.prove(item,'object') );
	}

	// Converts a value to an array of strings, flattening nested arrays and extracting object keys.
	// RETURNS: [array] The converted array of strings.
	// * value - [...] The value to convert.
	_toStray( value ) {
		const arr = this._toArray( value );
		return arr.flatMap(
			( item ) => {
				if ( typeof item==='string' || typeof item==='number' ) return [item.toString()];
				if ( Array.isArray(item) )		return this._toStray( item );
				if ( typeof item==='object' )	return Object.keys( item );
				return [];
			});
	}

	// Converts a value to an array of integers, filtering out non-integer values.
	// RETURNS: [array] The filtered array of integers.
	// * value	- [...] The value to filter.
	_toIntray( value ) {
		return this._toArray(value).filter( (item)=>this.prove(item,'int') );
	}
}
