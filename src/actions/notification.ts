"use server";

import { db } from "@/db";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:cizekmichal99@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function subscribeUser(sub: webpush.PushSubscription) {
  await db.setSubscription(sub);
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true };
}

export async function unsubscribeUser() {
  await db.setSubscription(null);
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true };
}

export async function sendNotification({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const subscription = await db.getSubscription();
  if (!subscription) {
    throw new Error("Subscription not found");
  }

  try {
    webpush.setVapidDetails(
      `mailto:cizekmichal99@gmail.com`,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
    const response = await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title,
        body,
      }),
    );
    return {
      status: response.statusCode,
      headers: response.headers,
    };
  } catch (err) {
    if (err instanceof webpush.WebPushError) {
      return {
        status: err.statusCode,
        headers: err.headers,
      };
    }
    return { status: 500 };
  }
}
