# Log Decoder v1.3.2

Manifest V3 browser extension for decoding JWT, Base64/Base64URL, URL-encoded and JSON log data.

## Views
- Popup: existing decoder workflow.
- Side Panel: Chrome/Edge `chrome.sidePanel` API, opens beside the current tab.
- New Window: standalone decoder window.

## Browser support
- Google Chrome (current Chromium versions with Side Panel API)
- Microsoft Edge (current Chromium versions with Side Panel API)

The extension processes data locally in the browser and does not upload log data to an external server.


### v1.3.4
Side Panel is opened directly from the popup button click to preserve Chrome's required user gesture. The active tab ID is cached when the popup opens.
