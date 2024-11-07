import {onMounted, readonly, shallowRef} from 'vue';

export interface MainGridPersonalization {
  groupBy: string;
}

type PersonalizationPages = 'mainGrid';

type valueOf<T> = T[keyof T];

const DATABASE_NAME = 'tsMonitorDB';
const STORE_NAME = 'personalization';


export function usePersonalization<T extends Record<string, any>>(pageKey: PersonalizationPages) {
  let dbInstance: IDBDatabase | null = null;

  const personalization = shallowRef<T>();

  // Open the IndexedDB instance if not already opened
  async function openDB() {
    if (dbInstance) return;

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME); // Key-Value store, no keyPath required
        }
      };

      request.onsuccess = (event) => {
        dbInstance = (event.target as IDBRequest).result;
        dbInstance && resolve(dbInstance);
      };

      request.onerror = (event) => {
        reject('Failed to open IndexedDB');
      };
    });
  }

  async function setPersonalizationValue(key: keyof T, value: valueOf<T>) {
    await openDB();
    const transaction = dbInstance!.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put({...personalization.value, [key]: value}, pageKey); // Storing the object with key-value pair

    transaction.oncomplete = () => {
      fetchPersonalization(); // Reload items after adding/updating
    };

    transaction.onerror = (event) => {
      console.error('Error setting item:', event);
    };
  }

  async function setPersonalization(value: T) {
    await openDB();
    const transaction = dbInstance!.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(value, pageKey); // Storing the object with key-value pair

    transaction.oncomplete = () => {
      fetchPersonalization(); // Reload items after adding/updating
    };

    transaction.onerror = (event) => {
      console.error('Error setting item:', event);
    };
  }

  async function fetchPersonalization() {
    await openDB();
    const transaction = dbInstance!.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(pageKey);

    request.onsuccess = () => {
      personalization.value = request.result;
    };

    request.onerror = (event) => {
      console.error('Error fetching items:', event);
    };
  }

  async function deletePersonalization() {
    await openDB();
    const transaction = dbInstance!.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(pageKey);

    transaction.oncomplete = () => {
      fetchPersonalization(); // Reload items after deletion
    };

    transaction.onerror = (event) => {
      console.error('Error deleting item:', event);
    };
  }

  onMounted(async () => {
    await fetchPersonalization();
  });

  return {
    personalization: readonly(personalization),
    setPersonalization,
    setPersonalizationValue,
    fetchPersonalization,
    deletePersonalization
  };
}
