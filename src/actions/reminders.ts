"use server";

import { db } from "@/db";
import { Reminder } from "@/store/atoms";

export const syncRemainders = async (data: Reminder[]) => {
  db.sync(data);
};

export const addReminder = async (item: Reminder) => {
  db.add(item);
};

export const deleteReminder = async (id: string) => {
  db.delete(id);
};
