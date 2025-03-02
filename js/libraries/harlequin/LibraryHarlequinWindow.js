console.log( 'jestAlert: js/libraries/harlequin/HarlequinWindow.js loaded' );

//-------------------------
// LibraryHarlequinWindow Library
//-------------------------
JestLibraryRegistry.LibraryHarlequinWindow =
	class LibraryHarlequinWindow {
		/**
		 * Creates the harlequin window library [object] for methods.
		 * RETURNS: [bool] `true` on success, else `false`.
		 * * options	- [object] Configuration options for the application.
		 */
		constructor() { }

		// Configure a window header with controls and a title atop a window [object].
		// RETURNS: [array] of data for elements to build
		// * icon		- [string] of icon url if to use one
		// * title		- [string] value of window header display title
		// * minimize	- [bool] `true` or `false` whether to include minimize button
		// * maximize	- [bool] `true` or `false` whether to include maximize button
		// * close		- [bool] `true` or `false` whether to include close button
		windowHeaderConfig( icon, title, minimize=true, maximize=true, close=true ) {
			let elements	= []; // begin configuration elements [array]
			// --------------------------------
			// Create Window Icon & Title
			// --------------------------------
			// Determine icon
			if ( icon!==null ) {
				const configIcon	=
					{
						name:		'icon',
						tag:		'img',
						classes:	[ 'jest-window-icon', 'jest-style-harlequin' ],
						attributes:	{ src: chrome.runtime.getURL(icon) }
					};
				elements.push( configIcon ); // push into elements [array]
			}
			// Create title
			const configTitle	=
				{
					name:		'title',
					tag:		'div',
					classes:	[ 'jest-window-title', 'jest-style-harlequin' ],
					text:		title,
				};
			elements.push( configTitle ); // push into elements [array]
			// --------------------------------
			// Create Controls
			// --------------------------------
			let controls	= [];
			// Determine minimize button
			if ( minimize===true ) {
				const configMinBtn	=
					{
						name:		'minimize',
						tag:		'button',
						id:			'minimize-button',
						classes:	[ 'jest-button' ],
						text:		'−',
						callbacks:
							[
								{
									name:		'click',
									id:			'btnMinimize',
									type:		'dom',
									callback:
										function () {
											console.log( this.breadcrumbs[1] );
											this.breadcrumbs[1].minimize();
										}
								}
							]
					};
				controls.push( configMinBtn ); // push into elements [array]
			}
			// Determine maximize button
			if ( maximize===true ) {
				const configMaxBtn	=
					{
						name:		'maximize',
						tag:		'button',
						id:			'maximize-button',
						classes:	[ 'jest-button' ],
						text:		'□',
						callbacks:
							[
								{
									name:		'click',
									id:			'btnMaximize',
									type:		'dom',
									callback:
										function () {
											console.log( this );
											this.breadcrumbs[1].maximize();
										}
								}
							]
					};
				controls.push( configMaxBtn ); // push into elements [array]
			}
			// Add controls to the controls panel configuration
			const configControls		=
				{
					name:		'controls',
					tag:		'div',
					classes:	[ 'jest-window-controls', 'jest-style-harlequin' ],
					elements:	controls
				};
			elements.push( configControls ); // push into elements [array]
			// --------------------------------
			// Wrap-Up & Return
			// --------------------------------
			// Return successful configuration [array]
			return elements;
		}

		// Add event callbacks for dragging
		// * windowObj		- the Window [object] making draggable
		// * panelDrag		- the drag region ie. Panel [object]
		makeWindowDraggable( windowObj, panelDrag ) {
			const header = this.el.querySelector( '.jest-window-header' ); // Replace with your actual header class
			let offsetX, offsetY, isDragging = false;

			header.addEventListener(
				'mousedown',
				(e) => {
					isDragging		= true;
					offsetX			= e.clientX - this.el.offsetLeft;
					offsetY			= e.clientY - this.el.offsetTop;
					document.body.style.userSelect = 'none'; // Prevent text selection
				});

			document.addEventListener(
				'mousemove',
				(e) => {
					if ( isDragging ) {
						this.el.style.left	= `${e.clientX - offsetX}px`;
						this.el.style.top	= `${e.clientY - offsetY}px`;
					}
				});

			document.addEventListener(
				'mouseup',
				() => {
					isDragging	= false;
					document.body.style.userSelect = ''; // Restore text selection
				});
		}
	};
