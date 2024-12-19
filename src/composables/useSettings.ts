import {DATABASE_NAME, DB_VERSION, STORE_NAME, usePersonalization} from './usePersonalization.ts';

export const useSettings = () => {
  function clearDBStore(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DB_VERSION); // Open the database
      request.onsuccess = (event) => {
        const db = (event.target as IDBRequest).result;
        const transaction = db.transaction(STORE_NAME, 'readwrite'); // Open a transaction on the personalization store
        const store = transaction.objectStore(STORE_NAME);

        const clearRequest = store.clear(); // Clear the store
        clearRequest.onsuccess = () => {
          resolve(); // Resolve the promise once the store is cleared
        };
        clearRequest.onerror = (error: any) => {
          reject(error); // Reject the promise if an error occurs
        };
      };

      request.onerror = (error) => {
        reject(error); // Reject the promise if the database cannot be opened
      };
    });
  }

  const clearPersonalizationStore = async () => {
    try {
      await clearDBStore();
      window.location.reload();
    } catch (e) {
      console.error('Error clearing personalization:', e);
    }
  }


  return {
    clearPersonalizationStore
  }
};
