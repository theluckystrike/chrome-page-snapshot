/**
 * Page Snapshot — Capture visible tab and download as image
 */

export class PageSnapshotError extends Error {
    constructor(
        message: string,
        public code: string,
        public operation: string,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'PageSnapshotError';
        if (originalError) {
            this.stack = originalError.stack;
        }
    }
}

export const PageSnapshotErrorCode = {
    CHROME_API_UNAVAILABLE: 'CHROME_API_UNAVAILABLE',
    CAPTURE_FAILED: 'CAPTURE_FAILED',
    DOWNLOAD_FAILED: 'DOWNLOAD_FAILED',
    CLIPBOARD_FAILED: 'CLIPBOARD_FAILED',
    STORAGE_FAILED: 'STORAGE_FAILED',
    INVALID_PARAMETER: 'INVALID_PARAMETER',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;

/**
 * Validates that chrome APIs are available
 */
function validateChromeAPI(): void {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
        throw new PageSnapshotError(
            'Chrome tabs API is not available. This code must run in a Chrome extension environment.',
            PageSnapshotErrorCode.CHROME_API_UNAVAILABLE,
            'validateChromeAPI'
        );
    }
}

/**
 * Validates quality parameter for JPEG capture
 */
function validateQuality(quality: number): void {
    if (quality < 0 || quality > 100) {
        throw new PageSnapshotError(
            `Invalid quality value: ${quality}. Quality must be between 0 and 100.`,
            PageSnapshotErrorCode.INVALID_PARAMETER,
            'validateQuality'
        );
    }
}

/**
 * Validates maxSnapshots parameter
 */
function validateMaxSnapshots(maxSnapshots: number): void {
    if (typeof maxSnapshots !== 'number' || maxSnapshots < 1 || !Number.isInteger(maxSnapshots)) {
        throw new PageSnapshotError(
            `Invalid maxSnapshots value: ${maxSnapshots}. Must be a positive integer.`,
            PageSnapshotErrorCode.INVALID_PARAMETER,
            'validateMaxSnapshots'
        );
    }
}

/**
 * Validates storage key parameter
 */
function validateStorageKey(key: string): void {
    if (!key || typeof key !== 'string') {
        throw new PageSnapshotError(
            `Invalid storage key: ${key}. Must be a non-empty string.`,
            PageSnapshotErrorCode.INVALID_PARAMETER,
            'validateStorageKey'
        );
    }
}

export class PageSnapshot {
    /** Capture visible tab as PNG data URL */
    static async captureVisible(windowId?: number): Promise<string> {
        validateChromeAPI();
        
        try {
            return await chrome.tabs.captureVisibleTab(
                windowId || chrome.windows.WINDOW_ID_CURRENT, 
                { format: 'png', quality: 100 }
            );
        } catch (error) {
            const err = error as Error;
            if (err.message?.includes('Permission denied') || err.message?.includes('access')) {
                throw new PageSnapshotError(
                    `Failed to capture visible tab: Permission denied. Make sure the tab has permission to be captured and is not restricted.`,
                    PageSnapshotErrorCode.PERMISSION_DENIED,
                    'captureVisible',
                    error as Error
                );
            }
            throw new PageSnapshotError(
                `Failed to capture visible tab: ${err.message}. This may happen if the tab is restricted or closed.`,
                PageSnapshotErrorCode.CAPTURE_FAILED,
                'captureVisible',
                error as Error
            );
        }
    }

    /** Capture and download */
    static async captureAndDownload(filename?: string): Promise<void> {
        validateChromeAPI();
        
        if (filename !== undefined && (typeof filename !== 'string' || filename.trim() === '')) {
            throw new PageSnapshotError(
                `Invalid filename: ${filename}. Must be a non-empty string.`,
                PageSnapshotErrorCode.INVALID_PARAMETER,
                'captureAndDownload'
            );
        }

        try {
            const dataUrl = await this.captureVisible();
            const name = filename || `snapshot_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
            
            if (!chrome.downloads) {
                throw new PageSnapshotError(
                    'Chrome downloads API is not available. Add "downloads" to permissions in manifest.json.',
                    PageSnapshotErrorCode.CHROME_API_UNAVAILABLE,
                    'captureAndDownload'
                );
            }
            
            await chrome.downloads.download({ url: dataUrl, filename: name, saveAs: false });
        } catch (error) {
            if (error instanceof PageSnapshotError) {
                throw error;
            }
            const err = error as Error;
            throw new PageSnapshotError(
                `Failed to download snapshot: ${err.message}. Make sure "downloads" permission is declared in manifest.json.`,
                PageSnapshotErrorCode.DOWNLOAD_FAILED,
                'captureAndDownload',
                error as Error
            );
        }
    }

    /** Capture and copy to clipboard (via offscreen or content script) */
    static async captureToClipboard(): Promise<void> {
        validateChromeAPI();
        
        try {
            const dataUrl = await this.captureVisible();
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            
            if (!navigator.clipboard) {
                throw new PageSnapshotError(
                    'Clipboard API is not available. Use a content script or offscreen document to copy to clipboard.',
                    PageSnapshotErrorCode.CHROME_API_UNAVAILABLE,
                    'captureToClipboard'
                );
            }
            
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        } catch (error) {
            if (error instanceof PageSnapshotError) {
                throw error;
            }
            const err = error as Error;
            if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
                throw new PageSnapshotError(
                    `Failed to copy to clipboard: Permission denied. User must grant clipboard write permission.`,
                    PageSnapshotErrorCode.PERMISSION_DENIED,
                    'captureToClipboard',
                    error as Error
                );
            }
            if (err.name === 'TypeError' && err.message?.includes('ClipboardItem')) {
                throw new PageSnapshotError(
                    'Clipboard write is not supported in this context. Use a content script or offscreen document.',
                    PageSnapshotErrorCode.CLIPBOARD_FAILED,
                    'captureToClipboard',
                    error as Error
                );
            }
            throw new PageSnapshotError(
                `Failed to copy to clipboard: ${err.message}`,
                PageSnapshotErrorCode.CLIPBOARD_FAILED,
                'captureToClipboard',
                error as Error
            );
        }
    }

    /** Capture with custom quality */
    static async captureJPEG(quality: number = 80, windowId?: number): Promise<string> {
        validateChromeAPI();
        validateQuality(quality);
        
        try {
            return await chrome.tabs.captureVisibleTab(
                windowId || chrome.windows.WINDOW_ID_CURRENT, 
                { format: 'jpeg', quality }
            );
        } catch (error) {
            const err = error as Error;
            if (err.message?.includes('Permission denied') || err.message?.includes('access')) {
                throw new PageSnapshotError(
                    `Failed to capture JPEG: Permission denied. Make sure the tab has permission to be captured.`,
                    PageSnapshotErrorCode.PERMISSION_DENIED,
                    'captureJPEG',
                    error as Error
                );
            }
            throw new PageSnapshotError(
                `Failed to capture JPEG: ${err.message}. This may happen if the tab is restricted or closed.`,
                PageSnapshotErrorCode.CAPTURE_FAILED,
                'captureJPEG',
                error as Error
            );
        }
    }

    /** Save snapshot URL to storage */
    static async saveToStorage(key: string, maxSnapshots: number = 20): Promise<void> {
        validateChromeAPI();
        validateStorageKey(key);
        validateMaxSnapshots(maxSnapshots);
        
        if (!chrome.storage) {
            throw new PageSnapshotError(
                'Chrome storage API is not available. Add "storage" to permissions in manifest.json.',
                PageSnapshotErrorCode.CHROME_API_UNAVAILABLE,
                'saveToStorage'
            );
        }
        
        try {
            const dataUrl = await this.captureVisible();
            const result = await chrome.storage.local.get(key);
            const snapshots = (result[key] as Array<{ url: string; timestamp: number; page: string }>) || [];
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            snapshots.push({ url: dataUrl, timestamp: Date.now(), page: tabs[0]?.url || '' });
            if (snapshots.length > maxSnapshots) snapshots.shift();
            await chrome.storage.local.set({ [key]: snapshots });
        } catch (error) {
            if (error instanceof PageSnapshotError) {
                throw error;
            }
            const err = error as Error;
            if (err.message?.includes('QUOTA')) {
                throw new PageSnapshotError(
                    `Storage quota exceeded. Consider reducing maxSnapshots (currently ${maxSnapshots}).`,
                    PageSnapshotErrorCode.STORAGE_FAILED,
                    'saveToStorage',
                    error as Error
                );
            }
            throw new PageSnapshotError(
                `Failed to save snapshot to storage: ${err.message}. Make sure "storage" permission is declared.`,
                PageSnapshotErrorCode.STORAGE_FAILED,
                'saveToStorage',
                error as Error
            );
        }
    }

    /** Get saved snapshots */
    static async getSaved(key: string): Promise<Array<{ url: string; timestamp: number; page: string }>> {
        validateChromeAPI();
        validateStorageKey(key);
        
        if (!chrome.storage) {
            throw new PageSnapshotError(
                'Chrome storage API is not available. Add "storage" to permissions in manifest.json.',
                PageSnapshotErrorCode.CHROME_API_UNAVAILABLE,
                'getSaved'
            );
        }
        
        try {
            const result = await chrome.storage.local.get(key);
            return (result[key] as any[]) || [];
        } catch (error) {
            const err = error as Error;
            throw new PageSnapshotError(
                `Failed to get saved snapshots: ${err.message}. Make sure "storage" permission is declared.`,
                PageSnapshotErrorCode.STORAGE_FAILED,
                'getSaved',
                error as Error
            );
        }
    }
}
