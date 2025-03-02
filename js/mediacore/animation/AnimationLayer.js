console.log( 'jestAlert: js/mediacore/animation/AnimationLayer.js loaded' );

//-------------------------
// AnimationLayer Class
//-------------------------
class AnimationLayer {
	// Sprite propert(ies)
	sprites		= [];		// [array] of sprites

	//-------------------------
	// Building Methods
	//-------------------------
	// Adds a sprite to this layer
	// * sprite		- Sprite [object] to add to layer
	// RETURNS: [void].
	addSprite( sprite ) {
		this.sprites.push( sprite );
	}

    // Retrieves a sprite by index
    // * index - [int] Index of the sprite to retrieve
    // RETURNS: [object|null] Sprite at the given index or null if out of bounds.
    getSprite( index ) {
        return this.sprites[index] ?? null; // Return null if index is invalid
    }

    // Removes a sprite by index
    // * index - [int] Index of the sprite to remove
    // RETURNS: [void].
    removeSprite( index ) {
        if ( index>=0 && index<this.sprites.length ) {
            this.sprites.splice(index, 1); // Remove sprite at the given index
        }
    }
}
