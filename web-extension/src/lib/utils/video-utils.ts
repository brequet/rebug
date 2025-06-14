import fixWebmDuration from 'webm-duration-fix';

/**
 * Fixes the duration of a WEBM video Blob created by MediaRecorder.
 * MediaRecorder does not set the duration metadata, which makes the video
 * unseekable in most players. This function processes the Blob to add the
 * necessary metadata.
 *
 * @param blob The raw Blob from the MediaRecorder.
 * @returns A new Blob with corrected duration metadata.
 */
export async function fixVideoBlob(blob: Blob): Promise<Blob> {
    try {
        const fixedBlob = await fixWebmDuration(blob);
        return fixedBlob;
    } catch (error) {
        console.error('Failed to fix video duration:', error);
        // Return the original blob as a fallback
        return blob;
    }
}

export async function generateThumbnailFromVideoBlob(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const videoBlobUrl = URL.createObjectURL(blob);

        video.src = videoBlobUrl;
        video.crossOrigin = 'anonymous';
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            video.currentTime = 0; // Seek to the beginning
        };

        video.onseeked = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get 2D context from canvas.'));
                return;
            }
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg'); // Get thumbnail as Base64
            URL.revokeObjectURL(videoBlobUrl); // Clean up the temporary video URL
            resolve(dataUrl);
        };

        video.onerror = (e) => {
            URL.revokeObjectURL(videoBlobUrl);
            reject(new Error(`Error loading video for thumbnail generation: ${e}`));
        };
    });
}
