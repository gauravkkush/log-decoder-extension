# Log Decoder

A privacy-first developer tool for decoding and inspecting values commonly found in application and log-management systems.

Log Decoder is available in two forms:

- **Chrome / Edge Extension** — decode selected values directly from pages such as Grafana and Azure DevOps logs.
- **Web Version** — use the decoder directly from a browser through GitHub Pages.

## Features

### Decode

- JWT
- Base64
- Base64URL
- JSON
- URL-encoded values
- Values embedded inside larger log lines

### Multiple Views

The browser extension supports:

- Popup view
- Side Panel
- Separate decoder window

## Privacy

**Your data stays in your browser.**

Log Decoder processes data locally using JavaScript running in the browser.

- No backend server
- No database
- No analytics endpoint
- No external API
- No log data upload
- No decoded data storage

Nothing is stored, uploaded, or sent to an external server by the decoder.

## Browser Extension

The extension is designed for Chromium-based browsers:

- Google Chrome
- Microsoft Edge

Typical workflow:

```text
Select a value in a log
        ↓
Click Log Decoder
        ↓
Decode
        ↓
View beautified result
```

## Installing the Extension Locally

### Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Select the project directory containing `manifest.json`.
5. Pin Log Decoder to the browser toolbar.

### Edge

1. Open `edge://extensions`
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Select the project directory containing `manifest.json`.

## Using the Extension

1. Open a page containing the log data.
2. Select the JWT, Base64, JSON, or relevant log value.
3. Open Log Decoder.
4. Click **Decode**.
5. View the decoded result directly in the extension.


## Security & Data Handling

This tool is intended for developer and testing workflows involving encoded log data.

Even though processing is local, users should still follow their organization's security policies when handling sensitive production information.

Avoid sharing decoded production credentials, tokens, personal information, or other confidential data.
