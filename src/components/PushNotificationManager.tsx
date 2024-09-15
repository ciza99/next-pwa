"use client";

import {
  sendNotification,
  subscribeUser,
  unsubscribeUser,
} from "@/actions/notification";
import type { MouseEventHandler } from "react";
import { useEffect, useState } from "react";
import webpush from "web-push";
import { Button } from "./ui/button";

const base64ToUint8Array = (base64: string) => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(b64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const PushNotificationManager = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.serwist !== undefined
    ) {
      // run only in browser
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (
            sub &&
            !(
              sub.expirationTime &&
              Date.now() > sub.expirationTime - 5 * 60 * 1000
            )
          ) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
        setRegistration(reg);
      });
    }
  }, []);

  const subscribeButtonOnClick: MouseEventHandler<HTMLButtonElement> = async (
    event,
  ) => {
    if (!registration) {
      console.error("No SW registration available.");
      return;
    }
    event.preventDefault();
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
    });
    setSubscription(sub);
    await subscribeUser(sub as never as webpush.PushSubscription);
    setIsSubscribed(true);
    alert("Web push subscribed!");
  };

  const unsubscribeButtonOnClick: MouseEventHandler<HTMLButtonElement> = async (
    event,
  ) => {
    if (!subscription) {
      console.error("Web push not subscribed");
      return;
    }
    event.preventDefault();
    await subscription.unsubscribe();
    // TODO: you should call your API to delete or invalidate subscription data on the server
    setSubscription(null);
    await unsubscribeUser();
    setIsSubscribed(false);
  };

  const sendNotificationButtonOnClick: MouseEventHandler<
    HTMLButtonElement
  > = async (event) => {
    event.preventDefault();

    if (!subscription) {
      alert("Web push not subscribed");
      return;
    }

    sendNotification({
      title: "Hello",
      body: "This is a test notification",
    });
  };

  return (
    <div className="border-border p-2 flex items-center gap-2">
      <Button
        type="button"
        onClick={subscribeButtonOnClick}
        disabled={isSubscribed}
      >
        Subscribe
      </Button>
      <Button
        type="button"
        onClick={unsubscribeButtonOnClick}
        disabled={!isSubscribed}
      >
        Unsubscribe
      </Button>
      <Button
        type="button"
        onClick={sendNotificationButtonOnClick}
        disabled={!isSubscribed}
      >
        Send Notification
      </Button>
    </div>
  );
};
