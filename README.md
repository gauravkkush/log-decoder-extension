# Log Decoder – JWT & Base64

Chrome / Edge Manifest V3 extension for decoding selected values from Grafana, Azure DevOps, Kibana, and other log-management pages.

## Features

- JWT header, payload, and signature displayed on screen
- Base64 / Base64URL decoding
- JSON beautification
- URL decoding
- Recursive decoding of nested Base64/JSON string values
- Smart extraction from a selected log line
- Copy decoded output manually
- Right-click: Decode selected log data
- Keyboard shortcut: Alt + Shift + D
- No backend or external API

## Install

1. Extract the ZIP.
2. Chrome: open `chrome://extensions/` or Edge: `edge://extensions/`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select this folder.

## Usage

Select a JWT, Base64 string, JSON, or a whole log line and click the extension icon. The decoded result is displayed in the popup. Use **Copy result** if you want it in the clipboard.

If you use the context menu or shortcut, the selected text is stored for the next extension popup open.


## Privacy

All decoding and formatting happens locally in the browser. The extension does not upload, transmit, or send decoded log data to any external server.

## Controls

- **Clear** clears the current decoded result.
- **X** closes the extension popup.
- **Copy result** copies the decoded output only when explicitly clicked.
