// types/comments.ts

interface BaseUser {
    email: string;
    full_name: string | null;
}

export interface BaseComment {
    id: string;
    created_at: string;
    user: BaseUser;
}

export interface DevelopmentCommentType extends BaseComment {
    initiative_id: string;
    user_id: string;
    content: string;
}

export interface GardenCommentType extends BaseComment {
    task_id: string;
    user_id: string;
    comment: string;
}

export interface MaintenanceCommentType extends BaseComment {
    request_id: string;
    user_id: string;
    comment: string;
}

export interface TaskCommentType extends BaseComment {
    task_id: string;
    created_by: string;
    content: string;
    updated_at: string;
}

export interface SocialEventCommentType extends BaseComment {
    event_id: string;
    user_id: string;
    content: string;
}

export type CommentResourceType =
    | {
        type: "development";
        field: "initiative_id";
        contentField: "content";
        userField: "user_id";
    }
    | {
        type: "garden";
        field: "task_id";
        contentField: "comment";
        userField: "user_id";
    }
    | {
        type: "maintenance";
        field: "request_id";
        contentField: "comment";
        userField: "user_id";
    }
    | {
        type: "task";
        field: "task_id";
        contentField: "content";
        userField: "created_by";
    }
    | {
        type: "todo";
        field: "todo_id";
        contentField: "content";
        userField: "created_by";
    }
    | {
        type: "social_event";
        field: "event_id";
        contentField: "content";
        userField: "user_id";
    };

export interface CommentSectionProps<T extends BaseComment> {
    comments: T[];
    resourceId: string;
    resourceType: CommentResourceType;
}
