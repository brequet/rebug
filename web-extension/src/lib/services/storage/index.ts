export const screenshot = storage.defineItem<string>('local:screenshot');

export const capturedVideo = storage.defineItem<string>('local:capturedVideo');

export * from './indexedDBService';
