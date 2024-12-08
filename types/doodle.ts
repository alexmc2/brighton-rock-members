// types/doodle.ts

export type DoodlePollResponse = 'yes' | 'maybe' | 'no';

export type DoodleEventType = 'social_event' | 'garden_task' | 'development_event';

export interface DoodlePollOption {
  id: string;
  poll_id: string;
  date: string;
  start_time: string | null;
  duration: string | null;
  created_at: string;
}

export interface DoodlePollUser {
  id: string;
  email: string;
  full_name: string | null;
}

export interface DoodlePollParticipant {
  id: string;
  poll_id: string;
  user_id: string;
  responses: Record<string, DoodlePollResponse>;
  created_at: string;
  updated_at: string;
  user: DoodlePollUser;
}

export interface DoodlePoll {
  id: string;
  title: string;
  description: string;
  event_type: DoodleEventType;
  category: string;
  location: string | null;
  created_by: string;
  created_by_user: DoodlePollUser;
  options: DoodlePollOption[];
  participants: DoodlePollParticipant[];
  created_at: string;
  updated_at: string;
  closed: boolean;
  event_id: string | null;
}

// Extended type that includes all relations
export interface DoodlePollWithDetails extends DoodlePoll {
  created_by_user: DoodlePollUser;
  options: DoodlePollOption[];
  participants: DoodlePollParticipant[];
}

// Helper types for converting poll responses to event participants
export type ParticipationStatus = {
  social_event: 'going' | 'maybe' | 'not_going';
  garden_task: 'going' | 'maybe' | 'not_going';
  development_event: 'going' | 'maybe' | 'not_going';
};

export type ParticipationMapper = {
  [K in DoodleEventType]: {
    table: string;
    statusField: string;
    statusValues: {
      yes: ParticipationStatus[K];
      maybe: ParticipationStatus[K];
      no: ParticipationStatus[K];
    };
  };
};

export const participationMapping: ParticipationMapper = {
  social_event: {
    table: 'social_event_participants',
    statusField: 'status',
    statusValues: {
      yes: 'going',
      maybe: 'maybe',
      no: 'not_going'
    }
  },
  garden_task: {
    table: 'garden_task_participants',
    statusField: 'status',
    statusValues: {
      yes: 'going',
      maybe: 'maybe',
      no: 'not_going'
    }
  },
  development_event: {
    table: 'event_participants',
    statusField: 'status',
    statusValues: {
      yes: 'going',
      maybe: 'maybe',
      no: 'not_going'
    }
  }
};