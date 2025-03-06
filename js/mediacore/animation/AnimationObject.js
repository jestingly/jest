console.log( 'jestAlert: js/mediacore/animation/AnimationObject.js loaded' );

//-------------------------
// AnimationObject Class
//-------------------------
// Animation objects extend the anchor class; they are considered movable screen objects.
class AnimationObject extends Anchor {
	// Attributes.
	attributes	= {};				// [object] Attributes controlling animation
	validTypes	= {};				// Define expected attribute types

	//-------------------------
	// Instantiation
	//-------------------------
	// Construct the [object].
	// RETURNS: [void].
	constructor() {
		super();					// call parent constructor
	}

	//-------------------------
	// Setting Attribute(s)
	//-------------------------
	// Adds or updates a single valid type
	// RETURNS: [void]
	// * key		- [string] The attribute name
	// * type		- [string] The expected data type (e.g., "number", "string", "boolean")
	addAttrType( key, type ) {
		// Validate argument(s)
		if ( typeof key!=="string" )
			throw new TypeError( `addAttrType expects a string key, got ${typeof key}` );
		if ( typeof type!=="string" )
			throw new TypeError( `addAttrType expects a string type, got ${typeof type}` );
		// Set valid type
		this.validTypes[key] = type;
	}

	// Adds or updates multiple valid types at once
	// RETURNS: [void]
	// * types		- [object] Mapping of attribute names to expected types
	setAttrTypes( types ) {
		// Validate argument(s)
		if ( typeof types!=="object" || types===null )
			throw new TypeError( `setAttrTypes expects an object, got ${typeof types}` );
		// Set valid type(s)
		for ( const key in types )
			this.addAttrType( key, types[key] ); // Reuse single method for validation
	}

	// Removes a single valid type
	// RETURNS: [Boolean] True if removed, False if key was not found
	// * key		- [string] The attribute name
	removeAttrType( key ) {
		// Validate argument(s)
		if ( typeof key!=="string" )
			throw new TypeError( `removeAttrType expects a string key, got ${typeof key}` );
		// Attempt to remove valid type
		if ( this.validTypes.hasOwnProperty(key) ) {
			delete this.validTypes[key];
			return true;
		}
		return false;
	}

	// Removes multiple valid types at once
	// RETURNS: [Object] Key-value pairs of removed types
	// * ...keys	- [string] List of attribute names
	removeAttrTypes( ...keys ) {
		// Validate argument(s)
		if ( !keys.every( k => typeof k==="string" ) )
			throw new TypeError( `removeAttrTypes expects string keys, got ${keys.map(k => typeof k).join(", ")}` );
		// Attempt to remove valid type(s)
		const removed = {};
		keys.forEach(
			key => {
				if ( this.validTypes.hasOwnProperty(key) ) {
					removed[key] = this.validTypes[key];
					delete this.validTypes[key];
				}
			});
		return removed;
	}

	// Sets a single animation attribute with validation
	// RETURNS: [void]
	// * key		- [string] Attribute name
	// * value		- [any] Attribute value
	setAttribute( key, value ) {
		// Validate argument(s)
		if ( typeof key!=="string" )
			throw new TypeError( `setAttribute expects a string key, got ${typeof key}` );
		// Get expected type
		const expectedType	= this.validTypes[key];
		// Check primitive types
		if ( expectedType ) {
			if ( typeof expectedType==="string" ) {
				if ( expectedType==="array" && !Array.isArray(value) )
					throw new TypeError( `Invalid type for "${key}". Expected an array.` );
				if ( expectedType!=="array" && typeof value!==expectedType )
					throw new TypeError( `Invalid type for "${key}". Expected ${expectedType}, got ${typeof value}` );
			}
			// Check object/class instances
			else if ( typeof expectedType==="function" ) {
				if ( !(value instanceof expectedType) )
					throw new TypeError( `Invalid type for "${key}". Expected an instance of ${expectedType.name}` );
			}
		}
		// Assign attribute
		this.attributes[key] = value;
	}

	// Validates and sets animation attributes
	// RETURNS: [void]
	// * attributes - [object] Attributes to control animation.
	//		<key> [string]	- attribute name
	//		<value> [any]	- attribute value
	setAttributes( attributes ) {
		// Validate argument(s)
		if ( typeof attributes!=="object" || attributes===null )
			throw new TypeError( `setAttributes expects an object, got ${typeof attributes}` );
		// Iterate & assign attribute(s) / throw error if wrong type
		for ( const key in attributes )
			this.setAttribute( key, attributes[key] );
	}

	// Retrieves a attribute or returns a default value
	// RETURNS: [any] Value of the attribute or defaultValue if not found
	// * key - [String] The attribute name
	// * defaultValue - [...] Default value if the attribute doesn't exist (optional)
	getAttribute( key, defaultValue=null ) {
		// Validate argument(s)
		if ( typeof key!=="string" )
			throw new TypeError( `getAttribute expects a string key, got ${typeof key}` );
		// Return attribute
		return this.attributes.hasOwnProperty(key) ? this.attributes[key] : defaultValue;
	}

	// Retrieves multiple attributes at once
	// RETURNS: [Object] Key-value pairs of requested attributes
	// * ...keys	- [string] List of attribute names
	getAttributes( ...keys ) {
		// Validate argument(s)
		if ( !keys.every( k => typeof k==="string" ) )
			throw new TypeError( `getAttributes expects string keys, got ${keys.map(k => typeof k).join(", ")}` );
		// Iterate keys & return attribute(s)
		return keys.reduce(
			( result, key ) => {
				if ( this.attributes.hasOwnProperty(key) )
					result[key] = this.attributes[key];
				return result;
			}, {});
	}

	// Unsets (removes) a attribute
	// RETURNS: [boolean] True if removed, False if key was not found
	// * key	- [string] The attribute name
	unsetAttribute( key ) {
		// Validate argument(s)
		if ( typeof key!=="string" )
			throw new TypeError( `unsetAttribute expects a string key, got ${typeof key}` );
		// Attempt to remove attribute
		if ( this.attributes.hasOwnProperty(key) ) {
			delete this.attributes[key];
			return true; // success
		}
		return false; // fail
	}

	// Removes multiple attributes
	// RETURNS: [Object] Key-value pairs of removed attributes
	// * ...keys	- [string] List of attribute names
	unsetAttributes( ...keys ) {
		// Validate argument(s)
		if ( !keys.every( k => typeof k==="string" ) )
			throw new TypeError( `unsetAttributes expects string keys, got ${keys.map(k => typeof k).join(", ")}` );
		// Attempt to remove attribute(s)
		const removed	= {};
		keys.forEach(
			key => {
				if ( this.attributes.hasOwnProperty(key) ) {
					removed[key]	= this.attributes[key];
					delete this.attributes[key];
				}
			});
		return removed;
	}
}
