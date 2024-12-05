export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  event_type:
    | "maintenance_visit"
    | "garden_task"
    | "development_event"
    | "social_event"
    | "manual";
  reference_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  last_modified_by: string | null;
  category: string;
  subcategory?: string;
}

export interface CalendarEventWithDetails extends CalendarEvent {
  created_by_user: {
    email: string;
    full_name: string | null;
  };
  last_modified_by_user?: {
    email: string;
    full_name: string | null;
  };
}

export interface CalendarDay {
  date: Date;
  events: CalendarEventWithDetails[];
  isCurrentMonth: boolean;
  isToday: boolean;
}
