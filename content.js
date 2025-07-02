// This content script will run on YouTube pages.
// Its primary purpose is to redirect the user if they land on the main page,
// but only if the extension is enabled.

function redirectIfEnabled() {
    chrome.storage.sync.get('extensionEnabled', (data) => {
        const isEnabled = data.extensionEnabled !== false; // Default to true

        if (isEnabled && window.location.pathname === '/' && !window.location.search) {
            // Check if it's the main YouTube homepage (e.g., youtube.com/)
            // Redirect to the subscriptions page
            window.location.href = 'https://www.youtube.com/feed/subscriptions';
        }
    });
}

// Run immediately when the script loads
redirectIfEnabled();

// Listen for messages from the background script (e.g., when toggle changes)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkAndRedirect") {
        redirectIfEnabled();
    }
});

function addToggleButton() {
    // Avoid adding multiple buttons
    if (document.getElementById("yt-extension-toggle-button")) return;

    const button = document.createElement("button");
    button.id = "yt-extension-toggle-button";
    button.textContent = "Toggle Extension";
    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.zIndex = "9999";
    button.style.padding = "10px";
    button.style.background = "#ff0000";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.fontWeight = "bold";

    // Load initial state
    chrome.storage.sync.get('extensionEnabled', (data) => {
        const isEnabled = data.extensionEnabled !== false;
        button.textContent = isEnabled ? "Disable Extension" : "Enable Extension";
    });

    button.addEventListener("click", () => {
        chrome.storage.sync.get('extensionEnabled', (data) => {
            const current = data.extensionEnabled !== false;
            const newState = !current;

            chrome.storage.sync.set({ extensionEnabled: newState }, () => {
                chrome.runtime.sendMessage({
                    action: "toggleExtension",
                    enabled: newState
                });
                button.textContent = newState ? "Disable Extension" : "Enable Extension";
            });
        });
    });

    document.body.appendChild(button);
};

addToggleButton();

document.addEventListener("DOMContentLoaded", () => {
    addToggleButton();
});

function hideSidebarIfEnabled() {
    chrome.storage.sync.get('extensionEnabled', (data) => {
        const isEnabled = data.extensionEnabled !== false;
        if (isEnabled) {
            const style = document.createElement('style');
            style.id = "hide-sidebar-style";
            style.textContent = `
                #secondary {
                    display: none !important;
                }
                #primary {
                    width: 100% !important;
                }
            `;
            document.head.appendChild(style);
        } else {
            const existingStyle = document.getElementById("hide-sidebar-style");
            if (existingStyle) existingStyle.remove();
        }
    });
}

// Run it on load
hideSidebarIfEnabled();

// Also re-run when toggle changes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkAndRedirect") {
        redirectIfEnabled();
        hideSidebarIfEnabled();
    }
});

