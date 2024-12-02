// types/development.ts

export type DevelopmentStatus =
  | 'active'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export type DevelopmentPriority = 'low' | 'medium' | 'high' | 'urgent';

export type DevelopmentCategory =
  | 'development_meeting'
  | 'outreach'
  | 'policy'
  | 'training'
  | 'research'
  | 'social'
  | 'general';

export type ParticipationStatus = 'going' | 'maybe' | 'not_going';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  house_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface DevelopmentComment {
  id: string;
  initiative_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: Pick<Profile, 'email' | 'full_name'>;
}

export interface EventParticipant {
  event_id: string;
  user_id: string;
  status: ParticipationStatus;
  created_at: string;
  updated_at: string;
  user: {
    email: string;
    full_name: string | null;
  };
}

export type InitiativeType = 'event' | 'project';

export interface DevelopmentInitiative {
  id: string;
  title: string;
  description: string;
  status: DevelopmentStatus;
  priority: DevelopmentPriority;
  category: DevelopmentCategory;
  initiative_type: InitiativeType;
  created_by: string;
  created_at: string;
  updated_at: string;
  event_date: string | null;
  start_time: string | null;
  duration: string | null;
  location: string | null;
  max_participants: number | null;
  // budget: number | null;
  open_to_everyone: boolean; // Added field
}

export interface DevelopmentInitiativeWithDetails extends DevelopmentInitiative {
  created_by_user: Pick<Profile, 'email' | 'full_name'>;
  comments: DevelopmentComment[];
  participants?: EventParticipant[];
}

export interface PartnerOrganisation {
  id: string;
  name: string;
  type: string;
  contact_email: string | null;
  website: string | null;
  notes: string | null;
  last_contact_date: string | null;
  next_meeting_date: string | null;
  created_at: string;
  updated_at: string;
}

export type PartnerType =
  | 'housing_coop'
  | 'network'
  | 'federation'
  | 'council'
  | 'charity'
  | 'other';

export interface InitiativeListProps {
  initiatives: DevelopmentInitiativeWithDetails[];
}

// Database types for type safety with Supabase
export type Tables = {
  profiles: Profile;
  development_initiatives: DevelopmentInitiative;
  development_comments: DevelopmentComment;
  event_participants: EventParticipant;
  partner_organisations: PartnerOrganisation;
};
