/**
 * Page Snapshot — Capture visible tab and download as image
 */
export class PageSnapshot {
    /** Capture visible tab as PNG data URL */
    static async captureVisible(windowId?: number): Promise<string> {
        return chrome.tabs.captureVisibleTab(windowId || chrome.windows.WINDOW_ID_CURRENT, { format: 'png', quality: 100 });
    }

    /** Capture and download */
    static async captureAndDownload(filename?: string): Promise<void> {
        const dataUrl = await this.captureVisible();
        const name = filename || `snapshot_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
        await chrome.downloads.download({ url: dataUrl, filename: name, saveAs: false });
    }

    /** Capture and copy to clipboard (via offscreen or content script) */
    static async captureToClipboard(): Promise<void> {
        const dataUrl = await this.captureVisible();
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    }

    /** Capture with custom quality */
    static async captureJPEG(quality: number = 80, windowId?: number): Promise<string> {
        return chrome.tabs.captureVisibleTab(windowId || chrome.windows.WINDOW_ID_CURRENT, { format: 'jpeg', quality });
    }

    /** Save snapshot URL to storage */
    static async saveToStorage(key: string, maxSnapshots: number = 20): Promise<void> {
        const dataUrl = await this.captureVisible();
        const result = await chrome.storage.local.get(key);
        const snapshots = (result[key] as Array<{ url: string; timestamp: number; page: string }>) || [];
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        snapshots.push({ url: dataUrl, timestamp: Date.now(), page: tabs[0]?.url || '' });
        if (snapshots.length > maxSnapshots) snapshots.shift();
        await chrome.storage.local.set({ [key]: snapshots });
    }

    /** Get saved snapshots */
    static async getSaved(key: string): Promise<Array<{ url: string; timestamp: number; page: string }>> {
        const result = await chrome.storage.local.get(key);
        return (result[key] as any[]) || [];
    }
}
