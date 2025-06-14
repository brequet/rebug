export type ReportType = "Screenshot" | "Video";

export type ReportResponse = {
    id: string,
    board_id: string,
    title: string,
    report_type: ReportType,
    description: string | null,
    file_path: string,
    url: string | null,
    created_at: string,
    updated_at: string,
};

export type SendReportPayload = {
    boardId: string;
    title: string;
    description?: string;
    originUrl?: string;
    mediaData: string; // Base64 encoded data
    mediaType: ReportType;
    thumbnail?: string; // Base64 encoded thumbnail image
    browserInfo?: BrowserInfo;
    os?: string;
}

export interface BrowserInfo {
    name: string;
    version: string;
}
