import { useForm } from "react-hook-form";
import { Form, FormMessage } from "./ui/form";
import { z } from "zod";
import { addHours, isFuture, isToday } from "date-fns";
import { Input } from "./ui/input";
import { useSetAtom } from "jotai";
import { Reminder, remindersAtom } from "@/store/atoms";
import { Button } from "./ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "./ui/dialog";
import { addReminder } from "@/actions/reminders";

type AddReminderFormValues = z.infer<typeof addReminderFormSchema>;
const addReminderFormSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  date: z.coerce.date().refine((date) => isToday(date) || isFuture(date), {
    message: "Date must be in the future",
  }),
});

export const AddReminderForm: React.FC<{
  onSubmit?: (data: AddReminderFormValues) => void;
}> = ({ onSubmit: onSubmitProp }) => {
  const setReminders = useSetAtom(remindersAtom);
  const form = useForm<AddReminderFormValues>({
    defaultValues: {
      date: new Date(),
      time: addHours(new Date(), 1).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      description: "",
      title: "",
    },
    resolver: zodResolver(addReminderFormSchema),
  });

  const onSubmit = (data: AddReminderFormValues) => {
    const reminder: Reminder = {
      id: data.id,
      title: data.title,
      description: data.description,
      date: new Date(`${data.date.toDateString()} ${data.time}`).toISOString(),
    };
    setReminders((prev) => [...prev, reminder]);
    addReminder(reminder);
    onSubmitProp?.(data);
  };

  const { errors } = form.formState;

  return (
    <Form {...form}>
      <DialogTitle>New Reminder</DialogTitle>
      <form
        className="flex flex-col gap-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Input placeholder="Gym" {...form.register("title")} />
        {errors.date && <FormMessage>{errors.title?.message}</FormMessage>}
        <Input
          placeholder="Push workout today at Next.move"
          {...form.register("description")}
        />
        {errors.date && (
          <FormMessage>{errors.description?.message}</FormMessage>
        )}
        <Input type="date" {...form.register("date")} />
        {errors.date && <FormMessage>{errors.date?.message}</FormMessage>}
        <Input
          defaultValue={form.getValues("time")}
          type="time"
          {...form.register("time")}
        />
        {errors.date && <FormMessage>{errors.time?.message}</FormMessage>}
        <Button type="submit">Add Reminder</Button>
      </form>
    </Form>
  );
};
