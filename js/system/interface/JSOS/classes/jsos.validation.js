console.log( 'jestAlert: js/system/interface/JSOS/classes/JSOSValidation.js loaded' );

// Jest OS class
class JSOSValidation extends JSOSParse {
	//-------------------------
	// Instantiation Methods
	//-------------------------
	// Creates the class [object].
	// RETURNS: [object] A new instance.
	constructor() {
		super(); // call parent constructor
	}

	//-------------------------
	// Validation Utilities
	//-------------------------
	// Validates an argument type.
	// RETURNS: [boolean] `true` if success else `false` on fail.
	// * argument	- [string] The name of the argument being tested.
	// * value		- [...] The value to validate.
	// * types		- [string|array] The type(s) to validate against.
	argue( argument, value, types ) {
		if ( !this.prove(value,types) ) {
			console.warn(`Argument '${argument}' failed validation. Expected type(s): ${Array.isArray(types) ? types.join(', ') : types}.`);
			return false;
		}
		return true;
	}

	// Validates multiple arguments against their expected types.
	// RETURNS: [boolean] True if all arguments pass validation, false otherwise.
	// * args - [object] An object where keys are argument names and values are [value, types] pairs.
	//				e.g. { name: ["John Doe", "string"] }
	argues( args ) {
		let valid = true; // determine if any args are invalid
		for ( const [argument,[value,types]] of Object.entries(args) ) {
			if ( !this.prove(value,types) ) {
				console.warn( `Argument '${argument}' failed validation. Expected type(s): ${Array.isArray(types) ? types.join(', ') : types}.` );
				valid = false; // at least one arg is invalid
			}
		}
		return valid;
	}

	// Validates a value against one or more types.
	// RETURNS: [boolean] `true` if success else `false` on fail.
	// * value - [...] The value to validate.
	// * types - [string|array] The type(s) to validate against.
	prove( value, types ) {
		types = Array.isArray(types) ? types : [types]; // Ensure types is an array.
		return types.some( (type)=>this._checkType(value,type) );
	}

	// Internal type-checking logic for individual types.
	// RETURNS: [boolean] True if the value matches the type.
	// * value - [...] The value to validate.
	// * type  - [string] The type to validate against.
	_checkType( value, type ) {
		// Define type-checking logic for each supported type.
		const typeChecks = {
			array:		(v) => Array.isArray(v),
			boolean:	(v) => typeof v==='boolean',
			int:		(v) => Number.isInteger(v),
			number:		(v) => typeof v==='number' && !isNaN(v),
			object:		(v) => typeof v==='object' && v!==null && !Array.isArray(v),
			string:		(v) => typeof v==='string',
			stray:		(v) => Array.isArray(v) && v.every( item =>typeof item==='string' )
			// Additional types can be added here as needed.
		};
		// Define multiple aliases for each type
		const aliasGroups = {
			int:		[ 'int', 'integer' ],
			boolean:	[ 'bool', 'boolean' ],
			object:		[ 'obj', 'object' ],
			string:		[ 'str', 'string' ],
		};
		// Resolve alias if it exists
		const resolvedType = Object.entries(aliasGroups).find(
			( [ _, aliases ] ) =>
				aliases.includes( type )
			)?.[0] || type;
		// Use the corresponding check or fallback to a basic typeof comparison.
		return typeChecks[resolvedType] ? typeChecks[resolvedType](value) : typeof value === type;
	}

	//-------------------------
	// DATA Validating
	//-------------------------
	// Get variable / data type with validation.
	// RETURNS: [string|boolean] The detected data type or a boolean if validation is performed.
	// * variable       - [any] The variable to check.
	//   expectedType   - [string|null] The expected data type (optional, default: null).
	//   validValues    - [Array|null] An array of valid values to check against (optional, default: null).
	datatype( variable, expectedType=null, validValues=null ) {
		// Determine the data type of the variable.
		let detectedType;
		if ( variable===null )
			detectedType	= 'null';
		else if ( Array.isArray(variable) )
			detectedType	= 'array';
		else if ( typeof variable==='number' ) {
			if ( isNaN(variable) )
				detectedType	= 'nan';		// Special case for NaN
			else if ( !isFinite( variable ) )
				detectedType	= 'infinity';	// Special case for Infinity
			else detectedType	= Number.isInteger(variable) ? 'integer' : 'float';
		}
		else if ( typeof variable==='object' ) {
			if ( variable instanceof HTMLElement
				 || variable instanceof HTMLImageElement
				 || variable instanceof HTMLAudioElement ) {
				detectedType	= 'dom'; // General DOM element
			}
			else {
				const proto		= Object.getPrototypeOf( variable );
				detectedType	= proto && proto.constructor ? proto.constructor.name.toLowerCase() : 'object';
			}
		}
		else detectedType	= typeof variable;	// Handle string, boolean, function, undefined, etc.
		// If no validation is requested, return the detected data type.
		if ( !expectedType && !validValues ) return detectedType;
		// Validate the detected type against the expected type.
		const typeValid		= expectedType ? detectedType===expectedType : true;
		// Validate the variable against the array of valid values.
		const valuesValid	= validValues ? validValues.includes(variable) : true;
		// Return true if both validations pass; otherwise, false.
		return typeValid && valuesValid;
	}

	// Validate supplied button data
	/*validateButton( button, index ) {
		// Detect if button is proper
	    if ( !button || typeof button!=='object' ) {
	        console.warn( `Invalid button definition at index ${index}:`, button );
	        return null;
	    }
		// Return validated button data
	    return {
	        text: button.text || `Button ${index + 1}`,
	        classes: button.classes || 'jest-button',
	        onClick: typeof button.onClick==='function' ? button.onClick : null,
	    };
	}*/
}
