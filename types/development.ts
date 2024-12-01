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

export interface DevelopmentComment {
  id: string;
  initiative_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    email: string;
    full_name: string | null;
  };
}

export interface EventParticipant {
  event_id: string;
  user_id: string;
  status: ParticipationStatus;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    full_name: string | null;
  };
}

export interface DevelopmentInitiative {
  id: string;
  title: string;
  description: string;
  status: DevelopmentStatus;
  priority: DevelopmentPriority;
  category: DevelopmentCategory;
  created_by: string;
  created_at: string;
  updated_at: string;
  event_date: string | null;
  start_time: string | null; // Added start_time field
  duration: string | null; // Added duration field
  location: string | null;
  max_participants: number | null;
  budget: number | null;
}

export interface DevelopmentInitiativeWithDetails
  extends DevelopmentInitiative {
  created_by_user: {
    email: string;
    full_name: string | null;
  };
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
