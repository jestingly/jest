console.log( 'jestAlert: js/notification.js loaded' );

// Helper function to generate unique IDs for notifications
function generateNotificationId() {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Notification Manager Object
const NotificationManager = {
    notifications: [],

    // Create a new notification
    showNotification( { text, buttons=[], icon=null, duration=5000, onExpire=null, persistent=false } ) {
        const notificationId = generateNotificationId();
        const notification = document.createElement( 'div' );
        notification.className = 'jest-notification';
        notification.id = notificationId;

        // Add icon if provided
        if ( icon ) {
            const iconElement = jsos.generateElement( 'img', null, 'jest-notification-icon' );
            iconElement.src = icon;
            notification.appendChild( iconElement );
        }

        // Add text
        const textElement = document.createElement( 'span' );
        textElement.className = 'jest-notification-text';
        textElement.textContent = text;
        notification.appendChild( textElement );

        // Add buttons if provided
        if ( buttons.length>0 ) {
            const buttonContainer = document.createElement( 'div' );
            buttonContainer.className = 'jest-notification-buttons';
			// Iterate buttons and append to button container
            buttons.forEach(
				( { label, onClick } ) => {
	                const button = document.createElement( 'button' );
	                button.className = 'jest-notification-button';
	                button.textContent = label;
					// Handle button event listener
	                button.addEventListener(
						'click',
						() => {
							onClick && onClick( { id:notificationId, element:notification } );
							this.closeNotification( notificationId );
		                });

	                buttonContainer.appendChild( button );
	            });
			// Add button container to notification
            notification.appendChild( buttonContainer );
        }

        // Append notification to container
		const container = document.getElementById('jest-notification-container') || this.createContainer();
        container.appendChild( notification );
        this.notifications.push( notificationId );
		// Reposition notifications to handle stacking
		//this.repositionNotifications();

        // Animate notification in
        setTimeout(
			() => {
				notification.classList.add( 'jest-notif-show' );
				// Play alert sound effect
				playAudio( 'alert' );
			},
			10 );

        // Auto-remove after duration if not persistent
        if ( !persistent ) {
            setTimeout(
				() => {
	                this.closeNotification( notificationId );
	                if ( onExpire ) onExpire();
	            },
				duration );
        }

        // Enable drag-to-dismiss functionality
        this.enableDragToDismiss( notification, notificationId );
    },

    // Close notification
    closeNotification( notificationId ) {
        const notification = document.getElementById( notificationId );
        if ( notification ) {
			console.log( 'jestAlert: Fading out:', notificationId );
            // Animate fade-out
			//notification.classList.remove( 'show' )
            notification.classList.add( 'jest-notif-fade-out' );
            // Play close sound effect
            playAudio( 'close' );
            // Set timeout to remove notification completely
            setTimeout(
				() => {
	                notification.remove();
	                this.notifications = this.notifications.filter( id=>id!==notificationId );
		            // Reorganize remaining notifications with a bounce effect
		            this.repositionNotifications();
	            },
				300 ); // Match CSS fade-out duration
        }
    },

	// Function for dropping and shuffling multiple notifications
	repositionNotifications() {
	    const container = document.getElementById( 'jest-notification-container' );
	    if ( container ) {
			console.log( 'jestAlert: rearrange notifications' );
	        const notifications = Array.from( container.children );

	        notifications.forEach(
				( notification, index ) => {
					/*const height = notification.offsetHeight + 10; // Add gap
					const positionY = 0; //index * height;
					// Ensure it doesn't move off the page
					const maxBottom = window.innerHeight - container.offsetTop - height;
					if ( positionY<=maxBottom ) {
					    notification.style.translate = `${positionY}px`;
					}
					else {
						console.warn( `Notification exceeds container bounds: ${positionY}` );
					}*/

					notification.classList.add( 'jest-notif-bounce-down' );
		            // Remove bounce class after animation ends to reset
		            notification.addEventListener(
						'animationend',
						() => {
		                	notification.classList.remove( 'jest-notif-bounce-down' );
		            	});
		        });
	    }
	},

	// Reset the dragging mechanism
	dragReset( notification, notificationId ) {
		// Reset inline styles from drag listener
		notification.style.removeProperty( 'transition' );
		notification.style.removeProperty( 'transform' );
		notification.style.removeProperty( 'translate' );
		notification.classList.remove(
			'jest-notif-slide-dragging',
            'jest-notif-slide-out-right',
            'jest-notif-slide-out-left',
            'jest-notif-slide-reset'
			);
	},

    // Enable drag-to-dismiss functionality
    enableDragToDismiss( notification, notificationId ) {
        let startX = 0;
        let currentX = 0;
        let dragging = false;
        const threshold = 0.5; // 50% by default, customizable

        notification.addEventListener(
			'mousedown',
			(e) => {
	            startX = e.clientX;
	            dragging = true;
	            notification.classList.add( 'jest-notif-slide-dragging' );
	        });

        document.addEventListener(
			'mousemove',
			(e) => {
	            if ( !dragging ) return;
	            currentX = e.clientX - startX;
	            notification.style.translate = `${currentX}px`;
	        });

        document.addEventListener(
			'mouseup',
			() => {
	            if ( !dragging ) return;
	            dragging = false;
				this.dragReset( notification, notificationId ); // reset all drags
				// Determine if the drag exceeds the threshold
				if ( Math.abs(currentX)>notification.offsetWidth*threshold ) {
					// Animate sliding off in the drag direction
					const slideClass = currentX>0 ? 'jest-notif-slide-out-right' : 'jest-notif-slide-out-left';
        			notification.classList.add( slideClass );
					// Remove the notification after animation
					this.closeNotification( notificationId );
				}
				else {
					// Reset position if below threshold
			        notification.classList.add( 'jest-notif-slide-reset' );
			        // Remove reset class after animation ends to allow re-triggering
			        notification.addEventListener(
						'transitionend',
						() => {
				            notification.classList.remove( 'jest-notif-slide-reset' );
				        },
						{ once: true });
				}
	        });
    }
};
