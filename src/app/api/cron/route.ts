import { db } from "@/db";
import { NextResponse } from "next/server";
import { differenceInMinutes, isFuture } from "date-fns";
import { sendNotification } from "@/actions/notification";

const REMAINING_MINUTES_TO_NOTIFY = 10;

export const dynamic = "force-dynamic";

export const GET = async () => {
  const items = await db.getAll();

  const toNotify = items
    .filter(
      (item) =>
        !item.notified &&
        isFuture(new Date(item.date)) &&
        differenceInMinutes(new Date(item.date), new Date()) <
          REMAINING_MINUTES_TO_NOTIFY,
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  toNotify.forEach((item) => {
    sendNotification({
      title: `Reminder ${item.title} at ${item.date}`,
      body: item.description,
    });
    db.update({ ...item, notified: true });
  });

  return NextResponse.json({
    success: true,
  });
};
