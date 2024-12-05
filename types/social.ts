// types/social.ts

export type ParticipationStatus = "going" | "maybe" | "not_going";

export type SocialEventStatus = "upcoming" | "completed" | "cancelled";

export type SocialEventCategory =
  | "film_night"
  | "album_night"
  | "meal"
  | "fire"
  | "board_games"
  | "tv"
  | "book_club"
  | "christmas_dinner"
  | "bike_ride"
  | "party"
  | "hang_out"
  | "beach"
  | "writing_club";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

export interface SocialEvent {
  id: string;
  title: string;
  description: string;
  status: SocialEventStatus;
  category: SocialEventCategory;
  event_date: string | null;
  start_time: string | null;
  duration: string | null;
  location: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  open_to_everyone: boolean;
}

export interface SocialEventWithDetails extends SocialEvent {
  created_by_user: Pick<Profile, "email" | "full_name">;
  comments: SocialEventComment[];
  participants?: SocialEventParticipant[];
}

export interface SocialEventComment {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: Pick<Profile, "email" | "full_name">;
}

export interface SocialEventParticipant {
  event_id: string;
  user_id: string;
  status: ParticipationStatus;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
  };
}
