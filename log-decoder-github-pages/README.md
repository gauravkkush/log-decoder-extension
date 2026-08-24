# Log Decoder — GitHub Pages

Standalone web version of Log Decoder.

## Features

- JWT header, payload, and signature decoding
- Base64 / Base64URL decoding
- JSON beautification
- URL decoding
- Recursive decoding of nested Base64/JSON string values
- Smart extraction from a complete log line
- Copy decoded output
- No backend, database, analytics endpoint, or external API

## GitHub Pages

This is a static site. Put the contents of this folder in the repository root (or a Pages-enabled folder) and enable GitHub Pages from the repository settings.

For a user site, the URL will be:

`https://<username>.github.io/<repository>/`

The decoder engine is the same client-side JavaScript engine used by the extension.

## Privacy

All decoding happens locally in the browser. No input is uploaded, stored, or transmitted by this application.
