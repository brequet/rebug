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
