# chrome-page-snapshot — Tab Screenshot Capture
> **Built by [Zovo](https://zovo.one)** | `npm i chrome-page-snapshot`

Capture visible tab as PNG/JPEG, download, copy to clipboard, and save snapshot history.

```typescript
import { PageSnapshot } from 'chrome-page-snapshot';
await PageSnapshot.captureAndDownload('screenshot.png');
await PageSnapshot.captureToClipboard();
await PageSnapshot.saveToStorage('snapshots');
```
MIT License
