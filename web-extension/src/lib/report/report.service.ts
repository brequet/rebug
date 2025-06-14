import { API_BASE_URL } from '$lib/api';
import { AuthUtils } from '$lib/auth/auth.utils';
import { SCREENSHOT_MIME_TYPE, VIDEO_CAPTURE_MIME_TYPE } from '$lib/messaging/types';
import { base64ToBlob } from '$lib/utils/blob-utils';
import { ReportResponse, SendReportPayload } from './report.types';

class ReportService {
	private static readonly ENDPOINT = `${API_BASE_URL}/reports`;

	static async sendReport(report: SendReportPayload): Promise<ReportResponse | null> {
		const authHeader = await AuthUtils.getAuthHeader();
		if (!authHeader) {
			return null;
		}

		const formData = new FormData();
		formData.append('board_id', report.boardId);
		formData.append('title', report.title);

		if (report.description) {
			formData.append('description', report.description);
		}

		if (report.originUrl) {
			formData.append('url', report.originUrl);
		}

		if (report.browserInfo) {
			formData.append('browser_name', report.browserInfo.name);
			formData.append('browser_version', report.browserInfo.version);
		}

		if (report.os) {
			formData.append('os_name', report.os);
		}

		const file = base64ToBlob(
			report.mediaData,
			report.mediaType === 'Screenshot' ? SCREENSHOT_MIME_TYPE : VIDEO_CAPTURE_MIME_TYPE
		);
		if (file) {
			formData.append(
				'file',
				file,
				report.mediaType === 'Screenshot' ? 'screenshot.png' : 'video.webm'
			);
		} else {
			console.error('File is not a Blob:', typeof report.mediaData);
			return null;
		}
		if (report.thumbnail) {
			const thumbnailBlob = base64ToBlob(report.thumbnail, 'image/jpeg');
			if (thumbnailBlob) {
				formData.append('thumbnail', thumbnailBlob, 'thumbnail.jpg');
			} else {
				console.error('Thumbnail is not a Blob:', typeof report.thumbnail);
				return null;
			}
		}

		const url = `${this.ENDPOINT}`;
		const headers = {
			Authorization: authHeader
		};

		const response = await fetch(url, {
			method: 'POST',
			headers: headers,
			body: formData
		});

		if (!response.ok) {
			console.error('Failed to send report:', response.statusText);
			return null;
		}

		const data: ReportResponse = await response.json();
		return data;
	}
}

export { ReportService };

