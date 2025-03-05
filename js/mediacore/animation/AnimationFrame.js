console.log( 'jestAlert: js/mediacore/animation/AnimationFrame.js loaded' );

//-------------------------
// AnimationFrame Class
//-------------------------
class AnimationFrame {
	// Timing propert(ies)
	duration	= null;				// [int] value of duration of the frame in ms (defaults to 3)
	// Visual propert(ies)
	layers		= [];				// [array] of layer(s) (layers contain the sprite(s))

	//-------------------------
	// Instantiation
	//-------------------------
	// Declare properties.
	//   duration	- [int] value of duration of the frame in ms (defaults to 60)
	constructor( duration=null ) {
		this.duration	= duration ?? 1000/60*4;	// Duration of the frame in ms
	}

	//-------------------------
    // Layer Management
    //-------------------------
    // Adds a layer to the frame
    // RETURNS: [object] The created AnimationLayer.
    addLayer() {
        const layer		= new AnimationLayer();
        this.layers.push( layer );
        return layer;
    }

    // Retrieves a layer by index
    // RETURNS: [object|null] Layer at the given index or null if out of bounds.
    // * index		- [int] Index of the layer to retrieve
    getLayer( index ) {
        return this.layers[index] ?? null;		// Return null if invalid
    }

    // Removes a layer by index
    // RETURNS: [void].
    // * index		- [int] Index of the layer to remove
    removeLayer( index ) {
        if ( index>=0 && index<this.layers.length )
            this.layers.splice( index, 1 );		// Remove layer at index
    }

	// Clears all layers from the frame
	// RETURNS: [void].
	clearLayers() {
	    this.layers = []; // Empty the layers array
	}

    //-------------------------
    // Utility Methods
    //-------------------------
    // Retrieves the total number of layers in this frame
    // RETURNS: [int] Number of layers in the frame.
    getLayerCount() {
        return this.layers.length;
    }
}
