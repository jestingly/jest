console.log( 'jestAlert: js/mediacore/animation/AnimationLayer.js loaded' );

//-------------------------
// AnimationLayer Class
//-------------------------
// Animation layer that can be toggled on/off for visual state switching.
class AnimationLayer {
	// Sprite propert(ies)
	sprites		= [];		// [array] of sprites

	//-------------------------
	// Building Methods
	//-------------------------
	// Adds a sprite to this layer
	// RETURNS: [void].
	// * sprite		- Sprite [object] to add to layer
	addSprite( sprite ) {
		this.sprites.push( sprite );
	}

    // Retrieves a sprite by index
    // RETURNS: [object|null] Sprite at the given index or null if out of bounds.
    // * index - [int] Index of the sprite to retrieve
    getSprite( index ) {
        return this.sprites[index] ?? null; // Return null if index is invalid
    }

    // Removes a sprite by index
    // RETURNS: [void].
    // * index - [int] Index of the sprite to remove
    removeSprite( index ) {
        if ( index>=0 && index<this.sprites.length ) {
            this.sprites.splice(index, 1); // Remove sprite at the given index
        }
    }
}
