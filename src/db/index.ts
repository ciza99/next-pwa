import { Reminder } from "@/store/atoms";
import { readFileSync } from "fs";
import { PushSubscription } from "web-push";
import { JSONFileSyncPreset } from "lowdb/node";

const DB_FILE = "db.json";

type Data = {
  reminders: Reminder[];
  subscription: PushSubscription | null;
};

const initialData: Data = {
  reminders: [],
  subscription: null,
};

const dbFactory = () => {
  const data = readFileSync(DB_FILE, "utf-8");
  const dataJson = JSON.parse(data) as Data | undefined;
  const db = JSONFileSyncPreset(DB_FILE, dataJson ?? initialData);

  return {
    getAll: async () => {
      db.read();
      return Promise.resolve(db.data.reminders);
    },
    add: async (item: Reminder) => {
      db.update((data) => data.reminders.push(item));
      return Promise.resolve();
    },
    update: async (item: Reminder) => {
      if (!item.id) return;
      db.update((data) => {
        const index = data.reminders.findIndex((i) => i.id === item.id);
        if (index === -1) return data;
        data.reminders[index] = item;
      });
    },
    delete: async (id: string) => {
      db.update((data) => {
        data.reminders = data.reminders.filter((item) => item.id !== id);
      });
      return Promise.resolve();
    },
    sync: async (items: Reminder[]) => {
      db.update((data) => (data.reminders = items));
      return Promise.resolve();
    },
    // Push subscription
    setSubscription: async (sub: Data["subscription"]) => {
      db.update((data) => (data.subscription = sub));
      return Promise.resolve();
    },
    getSubscription: async () => {
      db.read();
      return Promise.resolve(db.data.subscription);
    },
  };
};

export const db = dbFactory();
