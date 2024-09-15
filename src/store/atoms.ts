import { atomWithIndexedDbPersistence } from "@/lib/store/atoms";
import { REMINDER_OBJECT_STORE_NAME } from "@/lib/store/db";

export type Reminder = {
  id: string;
  title: string;
  date: string;
  description: string;
  notified?: boolean;
};

export const remindersAtom = atomWithIndexedDbPersistence<Reminder>(
  REMINDER_OBJECT_STORE_NAME,
  [],
);
