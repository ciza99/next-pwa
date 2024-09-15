import { syncRemainders } from "@/actions/reminders";
import { remindersAtom } from "@/store/atoms";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

export const useSyncData = (props?: { disabled?: boolean }) => {
  const { disabled = false } = props ?? {};
  const reminders = useAtomValue(remindersAtom);

  useEffect(() => {
    if (disabled) return;

    const callback = async () => {
      await syncRemainders(reminders);
    };

    window.addEventListener("online", callback);
    window.addEventListener("beforeunload", callback);

    return () => {
      window.removeEventListener("online", callback);
      window.removeEventListener("beforeunload", callback);
    };
  }, [reminders, disabled]);
};
