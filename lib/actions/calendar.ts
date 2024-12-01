// app/lib/actions/calendar.ts

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CalendarEventWithDetails } from "@/types/calendar";

export async function getCalendarEvents(
  startDate: Date,
  endDate: Date,
): Promise<CalendarEventWithDetails[]> {
  const supabase = createClientComponentClient();

  const { data: events, error } = await supabase
    .from("calendar_events")
    .select(`
      *,
      created_by_user:created_by(email, full_name),
      last_modified_by_user:last_modified_by(email, full_name),
      category
    `)
    .gte("start_time", startDate.toISOString())
    .lte("end_time", endDate.toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }

  // Assign 'Miscellaneous' to events without a category
  return (events || []).map((event) => ({
    ...event,
    category: event.category || "Miscellaneous",
  }));
}

export async function createCalendarEvent(
  title: string,
  description: string | null,
  startTime: Date,
  endTime: Date,
  eventType: "manual" | "garden_task" = "manual",
  userId: string,
  fullName?: string | null,
  referenceId?: string,
) {
  const supabase = createClientComponentClient();

  // Delete any existing events for this reference if it's a garden task
  if (eventType === "garden_task" && referenceId) {
    await supabase
      .from("calendar_events")
      .delete()
      .eq("reference_id", referenceId)
      .eq("event_type", "garden_task");
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      title,
      description,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      event_type: eventType,
      created_by: userId,
      full_name: fullName,
      reference_id: referenceId,
      category: eventType === "garden_task" ? "Garden Task" : "Miscellaneous",
    })
    .select()
    .single();

  if (error) {
    console.error("Calendar event creation error:", error);
    throw new Error(`Failed to create calendar event: ${error.message}`);
  }

  return data;
}

export async function createGardenTaskEvent(
  title: string,
  description: string,
  dueDate: string,
  scheduledTime: string | null,
  duration: string | null,
  userId: string,
  fullName: string | null,
  taskId: string,
) {
  // Create a Date object for the due date
  const date = new Date(dueDate);

  // If there's a scheduled time, parse and set it
  if (scheduledTime) {
    const [hours, minutes] = scheduledTime.split(":");
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  } else {
    // Default to 9 AM if no time specified
    date.setHours(9, 0);
  }

  // Calculate end time based on duration
  const durationMs = parseDuration(duration);

  // End time is start time plus duration
  const endTime = new Date(date.getTime() + durationMs);

  // Create single calendar event
  return createCalendarEvent(
    `Garden Task: ${title}`,
    description,
    date,
    endTime,
    "garden_task",
    userId,
    fullName,
    taskId,
  );
}

function parseDuration(durationStr: string | null): number {
  if (!durationStr) {
    return 60 * 60 * 1000; // Default to 1 hour in milliseconds
  }
  const duration = parseFloat(durationStr);
  if (isNaN(duration)) {
    return 60 * 60 * 1000; // Default to 1 hour
  }
  if (duration === 24) {
    return 24 * 60 * 60 * 1000; // All day
  }
  return duration * 60 * 60 * 1000; // Convert hours to milliseconds
}

export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<CalendarEventWithDetails>,
  userId: string,
) {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase
    .from("calendar_events")
    .update({ ...updates, last_modified_by: userId })
    .eq("id", eventId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update calendar event: ${error.message}`);
  }

  return data;
}

export async function deleteCalendarEvent(eventId: string) {
  const supabase = createClientComponentClient();

  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", eventId);

  if (error) {
    throw new Error(`Failed to delete calendar event: ${error.message}`);
  }
}
