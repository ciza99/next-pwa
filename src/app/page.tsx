"use client";

import { AddReminderForm } from "@/components/AddReminderForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSyncData } from "@/hooks/useSyncData";
import { remindersAtom } from "@/store/atoms";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { deleteReminder } from "@/actions/reminders";
import { GearIcon } from "@radix-ui/react-icons";

export default function Home() {
  const [reminders, setReminders] = useAtom(remindersAtom);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["reminders"],
    queryFn: () =>
      fetch("/api/reminders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()),
  });

  useEffect(() => {
    if (!data) return;

    setReminders(data.items);
  }, [data, setReminders]);

  useSyncData();

  if (isLoading) {
    return <p className="text-center pt-4">Loading...</p>;
  }

  return (
    <main className="h-full flex flex-col items-center p-4">
      <div className="max-w-screen-sm w-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reminders</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <GearIcon />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Push Notification Settings</DialogTitle>
              <PushNotificationManager />
            </DialogContent>
          </Dialog>
        </div>
        {!reminders.length && <p>No reminders</p>}
        {!!reminders.length && (
          <ul className="flex flex-col w-full gap-2 divide-y divide-border">
            {reminders
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
              )
              .map((reminder) => (
                <li
                  key={reminder.id}
                  className="flex py-2 min-w-[min(100%,14rem)] flex-col gap-1"
                >
                  <h2 className="text-lg font-semibold">{reminder.title}</h2>
                  <p className="text-xs text-secondary-foreground">
                    {format(new Date(reminder.date), "MMM dd, yyyy hh:mm a")}
                  </p>
                  <p className="text-secondary-foreground">
                    {reminder.description}
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      deleteReminder(reminder.id);
                      setReminders((prev) =>
                        prev.filter((r) => r.id !== reminder.id),
                      );
                    }}
                  >
                    Remove
                  </Button>
                </li>
              ))}
          </ul>
        )}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">New Reminder</Button>
          </DialogTrigger>
          <DialogContent>
            <AddReminderForm onSubmit={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
