export const screenshotStorage = storage.defineItem<string>('local:screenshot');

export const videoStorage = storage.defineItem<string>('local:capturedVideo');

export * from './indexedDBService';

