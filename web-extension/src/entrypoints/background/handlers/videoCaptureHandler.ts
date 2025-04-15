import { receiveStreamId } from "$lib/services/messaging";
import { MessageProcessingResponse } from "$lib/types/messages";


export async function handleStartCapture(): Promise<MessageProcessingResponse> {
    console.log('Starting video capture...');

    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if (!activeTab?.id) {
            throw new Error('No active tab found');
        }

        return new Promise((resolve, reject) => {
            const desktopMediaRequestId = browser.desktopCapture.chooseDesktopMedia(
                ['screen', 'window', 'tab'],
                activeTab,
                async (streamId, options) => {
                    if (!streamId) {
                        reject({ success: false, error: 'Permission denied' });
                        return;
                    }

                    await receiveStreamId(streamId)

                    resolve({
                        success: true,
                        data: {
                            streamId,
                            canRequestAudioTrack: options?.canRequestAudioTrack
                        }
                    });
                }
            );

            if (!desktopMediaRequestId) {
                reject({ success: false, error: 'Failed to initiate desktop media request' });
            }
        });
    } catch (error) {
        const errorMessage = (error as Error).message || 'Unknown error';
        console.error('Error starting video capture:', errorMessage);

        return { success: false, error: errorMessage };
    }
}


export async function handleStopCapture(): Promise<MessageProcessingResponse> {
    console.log('Stopping video capture...');

    try {
        throw new Error('Video capture is not implemented yet.');
    } catch (error) {
        const errorMessage = (error as Error).message || 'Unknown error';
        console.error('Error stopping video capture:', errorMessage);

        return { success: false, error: errorMessage };
    }
}


