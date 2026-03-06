# chrome-page-snapshot

Visible-tab screenshot capture for Chrome MV3 extensions. One static class, zero dependencies. Capture as PNG data URL, save to downloads, copy to clipboard, or persist snapshots in chrome.storage.

INSTALL

```bash
npm install chrome-page-snapshot
```

MANIFEST PERMISSIONS

Your extension manifest needs these permissions depending on which methods you use.

```json
{
  "permissions": ["activeTab", "downloads", "storage"]
}
```

activeTab (or host permissions) is required for captureVisibleTab. downloads is only needed if you call captureAndDownload. storage is only needed if you call saveToStorage or getSaved.

USAGE

Import the PageSnapshot class and call its static methods from your service worker or extension page.

```ts
import { PageSnapshot } from 'chrome-page-snapshot';
```

Capture the visible tab as a PNG data URL.

```ts
const dataUrl = await PageSnapshot.captureVisible();
```

You can pass a specific window ID if needed.

```ts
const dataUrl = await PageSnapshot.captureVisible(windowId);
```

Capture and immediately download as a PNG file.

```ts
await PageSnapshot.captureAndDownload('my-screenshot.png');
```

When no filename is provided, it generates one from the current timestamp.

```ts
await PageSnapshot.captureAndDownload();
// saves as snapshot_2025-01-15T10-30-00-000Z.png
```

Capture and copy the image to the system clipboard.

```ts
await PageSnapshot.captureToClipboard();
```

Capture as JPEG with a custom quality value (0 to 100, defaults to 80).

```ts
const jpegUrl = await PageSnapshot.captureJPEG(60);
```

Save a snapshot to chrome.storage.local under a key you choose. Each entry stores the data URL, a timestamp, and the page URL. The second argument caps how many snapshots to keep (defaults to 20, oldest dropped first).

```ts
await PageSnapshot.saveToStorage('my-snaps', 50);
```

Retrieve all saved snapshots for a given key. Returns an array of objects with url, timestamp, and page fields.

```ts
const snaps = await PageSnapshot.getSaved('my-snaps');
snaps.forEach(s => {
  console.log(s.timestamp, s.page, s.url.length);
});
```

API REFERENCE

PageSnapshot.captureVisible(windowId?: number): Promise<string>
  Calls chrome.tabs.captureVisibleTab with PNG format at quality 100. Returns a data URL string. Falls back to the current window when no windowId is given.

PageSnapshot.captureAndDownload(filename?: string): Promise<void>
  Captures the visible tab and triggers a download via chrome.downloads.download. If filename is omitted, one is generated from the ISO timestamp.

PageSnapshot.captureToClipboard(): Promise<void>
  Captures the visible tab, converts the data URL to a Blob, and writes it to the clipboard as image/png using the Clipboard API.

PageSnapshot.captureJPEG(quality?: number, windowId?: number): Promise<string>
  Same as captureVisible but outputs JPEG. Quality defaults to 80.

PageSnapshot.saveToStorage(key: string, maxSnapshots?: number): Promise<void>
  Captures the visible tab and appends the result to an array in chrome.storage.local under the given key. Each entry is an object with url (data URL string), timestamp (epoch ms), and page (URL of the active tab). When the array exceeds maxSnapshots (default 20), the oldest entry is removed.

PageSnapshot.getSaved(key: string): Promise<Array<{ url: string; timestamp: number; page: string }>>
  Reads the snapshot array from chrome.storage.local for the given key. Returns an empty array if nothing is stored.

BUILD FROM SOURCE

```bash
git clone https://github.com/theluckystrike/chrome-page-snapshot.git
cd chrome-page-snapshot
npm install
npm run build
```

Output lands in dist/ as compiled JS with type declarations.

BROWSER SUPPORT

Chrome 90 and later. Edge 90 and later (Chromium-based).

LICENSE

MIT. See LICENSE file for details.

---

A zovo.one project. Visit https://zovo.one for more Chrome extension tools.
