export interface BrowserInfo {
    name: string;
    version: string;
    userAgent: string;
}

export interface ReportContext {
    id: string; // UUID
    createdAt: string; // ISO 8601 timestamp
    metadata: {
        tab: Browser.tabs.Tab;
        browser: BrowserInfo;
    };
    // userActions: unknown[];
    // logs: unknown[];
    // networkActivity: unknown[];
}
