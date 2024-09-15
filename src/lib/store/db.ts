export const REMINDER_OBJECT_STORE_NAME = "reminders";

export const initialize = async () => {
  const request = window.indexedDB.open("indexed-db");

  const resolvedDb = await new Promise<IDBDatabase>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore(REMINDER_OBJECT_STORE_NAME, {
        keyPath: "id",
      });
    };
  });

  return resolvedDb;
};

export const getDb = async () => {
  let db: IDBDatabase | null = null;

  if (!db) {
    db = await initialize();
  }

  return db;
};
