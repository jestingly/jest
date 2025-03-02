console.log( 'jestAlert: background.js loaded' );

// Function to retry sending messages to the content script
function sendMessageWithRetry( tabId, message, retries=3 ) {
    chrome.tabs.sendMessage(
        tabId, message,
        ( response ) => {
            if ( chrome.runtime.lastError ) {
                console.warn( `Retrying... (${retries})`, chrome.runtime.lastError.message );
                if ( retries>0 ) {
                    setTimeout( ()=>sendMessageWithRetry(tabId,message,retries-1), 100 );
                }
            }
            else {
                console.log( 'jestAlert: Message response:', response );
            }
        });
}

// Listen for toolbar button clicks
chrome.browserAction.onClicked.addListener(
    (tab) => {
        console.log( 'jestAlert: background.js tab loaded' );
        // Inject content script logic if not already active
        chrome.tabs.executeScript(
            tab.id,
            { file: 'content.js' },
            () => {
                console.log( 'jestAlert: content.js injected successfully' );
                // Retry sending message to ensure listener is ready
                sendMessageWithRetry( tab.id, {action:"openJestEnvironment"} );
            });
    });
