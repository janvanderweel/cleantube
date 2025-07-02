// This background script manages the extension's overall state and listens for messages.

chrome.runtime.onInstalled.addListener(() => {
    // Set initial state: extension is enabled by default
    chrome.storage.sync.set({ extensionEnabled: true });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleExtension") {
        const isEnabled = request.enabled;
        console.log("Background script received toggle message. Extension enabled:", isEnabled);
        // We already updated storage in popup.js, so here we just notify content scripts if needed
        // For simplicity, we'll let content.js check storage directly when it runs or gets a message
        // If the user is on youtube.com, we might want to force a redirect or remove elements.
        // For now, content.js will handle the redirect on page load or when it receives a checkAndRedirect message.

        // When the toggle changes, if the user is on the YouTube homepage, try to redirect.
        chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url === 'https://www.youtube.com/' || tab.url === 'https://www.youtube.com/?gl=NL&hl=en') { // Add other common YouTube homepage URLs if needed
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: () => {
                            // This function will be executed in the context of the content script
                            // It's a bit redundant if content.js already has the listener, but ensures a fresh check.
                            chrome.storage.sync.get('extensionEnabled', (data) => {
                                if (data.extensionEnabled) {
                                    window.location.href = 'https://www.youtube.com/feed/subscriptions';
                                } else if (window.location.pathname === '/feed/subscriptions') {
                                     // If extension is disabled and user is on subscriptions, redirect them to home
                                     window.location.href = 'https://www.youtube.com/';
                                }
                            });
                        }
                    });
                } else if (isEnabled === false && tab.url.includes('/feed/subscriptions')) {
                     // If the extension is disabled and the user is on the subscription feed, redirect to home
                     chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: () => {
                            window.location.href = 'https://www.youtube.com/';
                        }
                     });
                }
            });
        });
    }
});