const DB_NAME = 'RebugStorage';
const DB_VERSION = 1;
const VIDEO_STORE_NAME = 'videoRecordings';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
    if (dbPromise) {
        return dbPromise;
    }
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('IndexedDB error:', request.error);
            reject(`IndexedDB error: ${request.error}`);
            dbPromise = null; // Reset promise on error
        };

        request.onsuccess = (event) => {
            console.log('IndexedDB connection successful.');
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            console.log('Upgrading IndexedDB...');
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(VIDEO_STORE_NAME)) {
                console.log(`Creating ${VIDEO_STORE_NAME} object store.`);
                db.createObjectStore(VIDEO_STORE_NAME); // Using keyPath requires objects, direct key is simpler here
            }
            // Add other stores or indices if needed in future versions
        };
    });
    return dbPromise;
}

async function performStoreOperation(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest | Promise<any> // Allow promise for async ops inside
): Promise<any> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction(VIDEO_STORE_NAME, mode);
            const store = transaction.objectStore(VIDEO_STORE_NAME);
            const requestOrPromise = operation(store);

            // Handle both IDBRequest and Promises returned by the operation
            if (requestOrPromise instanceof IDBRequest) {
                requestOrPromise.onsuccess = () => resolve(requestOrPromise.result);
                requestOrPromise.onerror = () => reject(requestOrPromise.error);
            } else if (requestOrPromise instanceof Promise) {
                requestOrPromise.then(resolve).catch(reject);
            } else {
                // If operation doesn't return request/promise, assume sync success within transaction
                transaction.oncomplete = () => resolve(undefined);
                transaction.onerror = () => reject(transaction.error);
            }

            // Fallback transaction handlers if operation didn't define specific ones
            transaction.onerror = transaction.onerror || (() => {
                console.error(`IndexedDB transaction error (${mode}) on ${VIDEO_STORE_NAME}:`, transaction.error);
                reject(transaction.error)
            });
            transaction.onabort = transaction.onabort || (() => {
                console.warn(`IndexedDB transaction aborted (${mode}) on ${VIDEO_STORE_NAME}:`, transaction.error);
                reject(new Error("IndexedDB transaction aborted"));
            });

        } catch (error) {
            console.error("Error initiating IndexedDB transaction:", error);
            reject(error);
        }
    });
}


export const videoStorage = {
    async saveVideo(id: string, blob: Blob): Promise<void> {
        console.log(`IndexedDB: Saving video with ID: ${id}`);
        try {
            // Wrap the put operation to ensure it completes before resolving
            await performStoreOperation('readwrite', (store) => {
                return new Promise<void>((resolveOp, rejectOp) => {
                    const request = store.put(blob, id);
                    request.onsuccess = () => {
                        console.log(`IndexedDB: Successfully saved video blob with ID: ${id}`);
                        resolveOp();
                    };
                    request.onerror = () => {
                        console.error(`IndexedDB: Error saving video blob with ID: ${id}`, request.error);
                        rejectOp(request.error);
                    };
                });
            });
            console.log(`IndexedDB: Transaction commit for saveVideo ID: ${id}`);
        } catch (error) {
            console.error(`IndexedDB: Failed transaction for saveVideo ID: ${id}`, error);
            throw error; // Re-throw the error after logging
        }
    },

    async getVideo(id: string): Promise<Blob | null> {
        console.log(`IndexedDB: Getting video with ID: ${id}`);
        try {
            const result = await performStoreOperation('readonly', (store) => store.get(id));
            if (result instanceof Blob) {
                console.log(`IndexedDB: Successfully retrieved video blob with ID: ${id}`);
                return result;
            } else if (result === undefined) {
                console.warn(`IndexedDB: No video found with ID: ${id}`);
                return null;
            } else {
                console.error(`IndexedDB: Retrieved unexpected data type for ID: ${id}`, typeof result);
                return null;
            }
        } catch (error) {
            console.error(`IndexedDB: Failed to get video with ID: ${id}`, error);
            return null;
        }
    },

    async deleteVideo(id: string): Promise<void> {
        console.log(`IndexedDB: Deleting video with ID: ${id}`);
        try {
            // Wrap the delete operation to ensure it completes before resolving
            await performStoreOperation('readwrite', (store) => {
                return new Promise<void>((resolveOp, rejectOp) => {
                    const request = store.delete(id);
                    request.onsuccess = () => {
                        console.log(`IndexedDB: Successfully deleted video with ID: ${id}`);
                        resolveOp();
                    };
                    request.onerror = () => {
                        console.error(`IndexedDB: Error deleting video with ID: ${id}`, request.error);
                        rejectOp(request.error);
                    };
                });
            });
            console.log(`IndexedDB: Transaction commit for deleteVideo ID: ${id}`);
        } catch (error) {
            console.error(`IndexedDB: Failed transaction for deleteVideo ID: ${id}`, error);
            throw error; // Re-throw the error after logging
        }
    },
};
