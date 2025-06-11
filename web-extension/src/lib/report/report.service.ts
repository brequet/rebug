import { API_BASE_URL } from "$lib/api"
import { AuthUtils } from "$lib/auth/auth.utils"
import { SCREENSHOT_MIME_TYPE, VIDEO_CAPTURE_MIME_TYPE } from "$lib/messaging/types"
import { base64ToBlob } from "$lib/utils/blob-utils"
import { ReportResponse, SendReportPayload } from "./report.types"

class ReportService {
    private static readonly ENDPOINT = `${API_BASE_URL}/reports`

    static async sendReport(report: SendReportPayload): Promise<ReportResponse | null> {
        if (report.mediaType === "Screenshot") {
            return this.sendScreenshot(report);
        } else if (report.mediaType === "Video") {
            throw new Error("Video reports are not supported yet.");
        }

        return null
    }

    private static async sendScreenshot(report: SendReportPayload): Promise<ReportResponse | null> {
        const authHeader = await AuthUtils.getAuthHeader()
        if (!authHeader) {
            return null;
        }

        const formData = new FormData();
        formData.append("board_id", report.boardId);
        formData.append("title", report.title);

        if (report.description) {
            formData.append("description", report.description);
        }

        if (report.originUrl) {
            formData.append("url", report.originUrl);
        }

        if (report.browserInfo) {
            formData.append("browser_name", report.browserInfo.name);
            formData.append("browser_version", report.browserInfo.version);
        }

        if (report.os) {
            formData.append("os_name", report.os);
        }

        const file = base64ToBlob(report.mediaData, report.mediaType === "Screenshot" ? SCREENSHOT_MIME_TYPE : VIDEO_CAPTURE_MIME_TYPE);
        if (file) {
            formData.append("file", file, "screenshot.png");
        } else {
            console.error("File is not a Blob:", typeof report.mediaData);
            return null;
        }

        const url = `${this.ENDPOINT}/screenshots`
        const headers = {
            Authorization: authHeader
        }

        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: formData
        })

        if (!response.ok) {
            console.error("Failed to send screenshot report:", response.statusText);
            return null;
        }

        const data: ReportResponse = await response.json();
        return data;
    }
}

export { ReportService }

