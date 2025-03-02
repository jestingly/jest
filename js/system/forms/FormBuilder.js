console.log( 'jestAlert: js/system/forms/FormBuilder.js loaded' );

//-------------------------
// FormBuilder Class
//-------------------------
// Provides a modular and extensible way to build forms and nested elements.
class FormBuilder {
	// Generates a DOM element with attributes and content using Environment methods.
	// RETURNS: [object] The created DOM element.
	// * options - [object] Configuration for the element.
	//     tag         - [string] The HTML tag (default: 'div').
	//     id          - [string] ID of the element.
	//     classes     - [string|array] Classes to add to the element.
	//     attributes  - [object] Additional attributes for the element.
	//     text        - [string] Text content of the element.
	//     children    - [array] Nested child elements.
	static createElement( options ) {
		// Generate the DOM element
		switch ( options.type ) {
			/*case 'button':
				const element	= new FormButton(options).el;
			case 'dropdown':
				const element	= new FormDropdown(options).el;*/
			default:
				const element	=
					jsos.generateElement(
						options.tag || 'div',
						options.id || '',
						options.classes || [],
						options.text || ''
					);
		}

		// Add attributes
		if ( options.attributes ) {
			Object.keys( options.attributes ).forEach(
				attr => element.setAttribute( attr, options.attributes[attr] )
			);
		}

		// Add nested children
		if ( options.children && Array.isArray(options.children) ) {
			options.children.forEach(
				child => element.appendChild( FormBuilder.createElement(child) )
			);
		}

		return element;
	}

	// Generates a form element with optional inputs, labels, and buttons.
	// RETURNS: [object] The created form element.
	// * config			- [object] Configuration for the form.
	//   id				- [string] ID of the form.
	//   classes		- [string|array] Classes to add to the form.
	//   attributes		- [object] Additional attributes for the form.
	//   elements		- [array] Nested input/label/button definitions.
	static createForm( config ) {
		//  Create a form element
		return
			FormBuilder.createElement({
				tag: 'form',
				id: config.id || '',
				classes: config.classes || [],
				attributes: config.attributes || {},
				children: config.elements || []
			});
	}

	// Populates content recursively for nested elements.
	// RETURNS: [void].
	// * parent   - [object] The parent DOM element.
	//   content  - [array] Nested content definitions.
	/*static populateContent( parent, content ) {
		content.forEach(
			item => parent.appendChild( FormBuilder.createElement( item ) )
		);
	}*/
}
