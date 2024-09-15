import { atom } from "jotai";
import { getDb } from "./db";

export const atomWithIndexedDbPersistence = <TValue extends { id?: string }>(
  objectStoreKey: string,
  initialValue: TValue[],
) => {
  const baseAtom = atom(initialValue);
  baseAtom.onMount = (setValue) => {
    (async () => {
      const db = await getDb();
      const tsx = db.transaction(objectStoreKey, "readonly");
      const store = tsx.objectStore(objectStoreKey);

      const remindersRequest = store.getAll();
      const items = await new Promise<TValue[]>((resolve) => {
        remindersRequest.onsuccess = () => resolve(remindersRequest.result);
        remindersRequest.onerror = () => resolve(initialValue);
      });

      setValue(items);
    })();
  };
  const derivedAtom = atom<
    TValue[],
    [arg: TValue[] | ((prev: TValue[]) => TValue[])],
    unknown
  >(
    (get) => get(baseAtom),
    async (get, set, update) => {
      const newItems: TValue[] =
        typeof update === "function" ? update(get(baseAtom)) : update;
      set(baseAtom, newItems);

      const db = await getDb();
      const tsx = db.transaction(objectStoreKey, "readwrite");
      const store = tsx.objectStore(objectStoreKey);

      const remindersRequest = store.getAll();
      const previousItems = await new Promise<TValue[]>((resolve) => {
        remindersRequest.onsuccess = () => resolve(remindersRequest.result);
        remindersRequest.onerror = () => resolve(initialValue);
      });

      const toDelete = previousItems.filter(
        (item) => !newItems.some((i) => i.id === item.id),
      );
      const toAdd = newItems.filter(
        (item) => !previousItems.some((i) => i.id === item.id),
      );

      toDelete.forEach((item) => {
        if (!item.id) return;
        store.delete(item.id);
      });

      toAdd.forEach((item) => {
        if (!item.id) return;
        store.add(item);
      });
    },
  );
  return derivedAtom;
};
