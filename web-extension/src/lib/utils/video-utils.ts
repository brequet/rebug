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
