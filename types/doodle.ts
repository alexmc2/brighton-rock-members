// types/doodle.ts

export type DoodlePollResponse = "yes" | "maybe" | "no";

export type DoodleEventType =
    | "social_event"
    | "development_event"
    | "General Meeting"
    | "Sub Meeting"
    | "Allocations"
    | "P4P Visit"
    | "Garden"
    | "AGM"
    | "EGM"
    | "General Maintenance"
    | "Training"
    | "Treasury"
    | "Miscellaneous";

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
    response_deadline: string | null;
}

// Extended type that includes all relations
export interface DoodlePollWithDetails extends DoodlePoll {
    created_by_user: DoodlePollUser;
    options: DoodlePollOption[];
    participants: DoodlePollParticipant[];
}

// Helper types for converting poll responses to event participants
export type ParticipationStatus = {
    [K in DoodleEventType]: "going" | "maybe" | "not_going";
};

export type ParticipationMapper = {
    [K in DoodleEventType]: {
        table: string;
        statusField: string;
        statusValues: {
            yes: "going";
            maybe: "maybe";
            no: "not_going";
        };
    };
};

export const participationMapping: ParticipationMapper = {
    social_event: {
        table: "social_event_participants",
        statusField: "status",
        statusValues: {
            yes: "going",
            maybe: "maybe",
            no: "not_going",
        },
    },
    development_event: {
        table: "event_participants",
        statusField: "status",
        statusValues: {
            yes: "going",
            maybe: "maybe",
            no: "not_going",
        },
    },
    "General Meeting": {
        table: "calendar_events",
        statusField: "status",
        statusValues: {
            yes: "going",
            maybe: "maybe",
            no: "not_going",
        },
    },
    "Sub Meeting": {
        table: "calendar_events",
        statusField: "status",
        statusValues: {
            yes: "going",
            maybe: "maybe",
            no: "not_going",
        },
    },
    "Allocations": {
        table: "calendar_events",
        statusField: "status",
        statusValues: {
            yes: "going",
            maybe: "maybe",
            no: "not_going",
        },
    },
    "P4P Visit": {
        table: "calendar_events",
        statusField: "status",
        statusValues: {
            yes: "going",
            maybe: "maybe",
            no: "not_going",
        },
    },
    "Garden": {
        table: "calendar_events",
        statusField: "status",
        statusValues: {
            yes: "going",
            maybe: "maybe",
            no: "not_going",
        },
    },
    "AGM": {
        table: "calendar_events",
        statusField: "status",
        statusValues: {
            yes: "going",
            maybe: "maybe",
            no: "not_going",
        },
    },
    "EGM": {
        table: "calendar_events",
        statusField: "status",
        statusValues: {
            yes: "going",
            maybe: "maybe",
            no: "not_going",
        },
    },
    "General Maintenance": {
        table: "calendar_events",
        statusField: "status",
        statusValues: {
            yes: "going",
            maybe: "maybe",
            no: "not_going",
        },
    },
    "Training": {
        table: "calendar_events",
        statusField: "status",
        statusValues: {
            yes: "going",
            maybe: "maybe",
            no: "not_going",
        },
    },
    "Treasury": {
        table: "calendar_events",
        statusField: "status",
        statusValues: {
            yes: "going",
            maybe: "maybe",
            no: "not_going",
        },
    },
    "Miscellaneous": {
        table: "calendar_events",
        statusField: "status",
        statusValues: {
            yes: "going",
            maybe: "maybe",
            no: "not_going",
        },
    },
};

// Helper function to convert event type to calendar category
export function eventTypeToCalendarCategory(eventType: DoodleEventType): string {
    const mapping: Record<DoodleEventType, string> = {
        social_event: "Co-op Social",
        development_event: "Development",
        "General Meeting": "General Meeting",
        "Sub Meeting": "Sub Meeting",
        "Allocations": "Allocations",
        "P4P Visit": "P4P Visit",
        "Garden": "Garden",
        "AGM": "AGM",
        "EGM": "EGM",
        "General Maintenance": "General Maintenance",
        "Training": "Training",
        "Treasury": "Treasury",
        "Miscellaneous": "Miscellaneous"
    };
    return mapping[eventType];
}
