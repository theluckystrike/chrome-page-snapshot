# chrome-page-snapshot

Capture full page snapshots as HTML or images in Chrome extensions.

## Overview

chrome-page-snapshot provides utilities to capture complete page snapshots, including lazy-loaded content, with HTML or screenshot options.

## Installation

```bash
npm install chrome-page-snapshot
```

## Usage

### Capture HTML

```javascript
import { capturePage } from 'chrome-page-snapshot';

const html = await capturePage.asHtml(tabId);
console.log(html.length);
```

### Capture Screenshot

```javascript
const screenshot = await capturePage.asImage(tabId, {
  format: 'png',
  fullPage: true,
});
```

### Capture as DataURL

```javascript
const dataUrl = await capturePage.asDataUrl(tabId);
```

## API

### Methods

- `asHtml(tabId)` - Get full page HTML
- `asImage(tabId, options)` - Get screenshot
- `asDataUrl(tabId)` - Get as data URL
- `asBlob(tabId)` - Get as blob

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| format | string | 'png' | Image format |
| quality | number | 92 | JPEG quality |
| fullPage | boolean | false | Capture full scroll |
| viewport | object | current | Viewport size |

## Manifest

```json
{
  "permissions": ["tabCapture"]
}
```

## Browser Support

- Chrome 90+

## License

MIT
