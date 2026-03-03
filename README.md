# chrome-page-snapshot — Tab Screenshot Capture

[![npm version](https://img.shields.io/npm/v/chrome-page-snapshot)](https://npmjs.com/package/chrome-page-snapshot)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Chrome Web Extension](https://img.shields.io/badge/Chrome-Web%20Extension-orange.svg)](https://developer.chrome.com/docs/extensions/)
[![Discord](https://img.shields.io/badge/Discord-Zovo-blueviolet.svg?logo=discord)](https://discord.gg/zovo)
[![Website](https://img.shields.io/badge/Website-zovo.one-blue)](https://zovo.one)

> **Built by [Zovo](https://zovo.one)** — Screenshot capture for Chrome extensions

Capture full page snapshots as HTML or images in Chrome extensions.

Part of the [Zovo](https://zovo.one) family of Chrome extension utilities.

## Overview

chrome-page-snapshot provides utilities to capture complete page snapshots, including lazy-loaded content, with HTML or screenshot options.

## Features

- **HTML Capture**: Full page HTML snapshot
- **Screenshot**: PNG/JPEG capture
- **Full Page**: Scroll and capture entire page
- **DataURL/Blob**: Multiple output formats
- **TypeScript Support**: Full type definitions

## Installation

```bash
npm install chrome-page-snapshot
```

## Quick Start

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
- Edge 90+

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/snapshot-improvement`
3. **Make** your changes
4. **Test** your changes
5. **Commit** your changes: `git commit -m 'Add new feature'`
6. **Push** to the branch: `git push origin feature/snapshot-improvement`
7. **Submit** a Pull Request

## See Also

### Related Zovo Repositories

- [chrome-extension-starter-mv3](https://github.com/theluckystrike/chrome-extension-starter-mv3) - Production-ready MV3 starter template
- [chrome-page-info](https://github.com/theluckystrike/chrome-page-info) - Page data extraction
- [chrome-screenshot-api](https://github.com/theluckystrike/chrome-screenshot-api) - Screenshot capture

### Zovo Chrome Extensions

- [Zovo Tab Manager](https://chrome.google.com/webstore/detail/zovo-tab-manager) - Manage tabs efficiently

Visit [zovo.one](https://zovo.one) for more information.

## License

MIT — [Zovo](https://zovo.one)
