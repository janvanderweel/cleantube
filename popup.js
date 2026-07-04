document.addEventListener('DOMContentLoaded', () => {
    const recentButton = document.getElementById('recentButton');
    const unwatchedButton = document.getElementById('unwatchedButton');
    const toggleExtension = document.getElementById('toggleExtension');
    const toggleSearchbar = document.getElementById('toggleSearchbar');

    // Load saved state for the extension toggle
    chrome.storage.sync.get('extensionEnabled', (data) => {
        toggleExtension.checked = data.extensionEnabled !== false; // Default to true if not set
    });

    // Load saved state for the search bar toggle
    chrome.storage.sync.get('hideSearchbar', (data) => {
        toggleSearchbar.checked = data.hideSearchbar === true; // Default to false if not set
    });

    recentButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].url.includes('youtube.com')) {
                chrome.tabs.update(tabs[0].id, { url: 'https://www.youtube.com/feed/subscriptions?flow=2' });
            } else {
                chrome.tabs.create({ url: 'https://www.youtube.com/feed/subscriptions?flow=2' });
            }
        });
    });

    unwatchedButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].url.includes('youtube.com')) {
                chrome.tabs.update(tabs[0].id, { url: 'https://www.youtube.com/feed/subscriptions?flow=2&view=0' }); // flow=2 for list view, view=0 for unwatched (though YouTube's unwatched filte
            } else {
                chrome.tabs.create({ url: 'https://www.youtube.com/feed/subscriptions?flow=2&view=0' });
            }
        });
    });

    toggleExtension.addEventListener('change', () => {
        const isEnabled = toggleExtension.checked;
        chrome.storage.sync.set({ extensionEnabled: isEnabled }, () => {
            console.log('Extension enabled state saved:', isEnabled);
            // Send message to background script to update state
            chrome.runtime.sendMessage({ action: "toggleExtension", enabled: isEnabled });
        });
    });

    toggleSearchbar.addEventListener('change', () => {
        const hideSearchbar = toggleSearchbar.checked;
        chrome.storage.sync.set({ hideSearchbar: hideSearchbar }, () => {
            console.log('Hide search bar state saved:', hideSearchbar);
            // Notify content scripts to update
            chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
                tabs.forEach((tab) => {
                    chrome.tabs.sendMessage(tab.id, { action: "updateSearchbarVisibility", hideSearchbar: hideSearchbar }).catch(() => {
                        // Ignore errors for tabs that don't have content script
                    });
                });
            });
        });
    });
});