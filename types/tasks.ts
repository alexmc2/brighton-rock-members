// types/task.ts

// Define possible statuses as used in your code
export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "todo";

// Define task priorities
export type TaskPriority = "low" | "medium" | "high" | "urgent";

// Define task types/categories
export type TaskCategory = "general" | "minuted";

// Base user profile interface
interface UserProfile {
  email: string;
  full_name: string | null;
}

// Interface for Task
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;

  task_type: TaskCategory;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  assigned_to: string | null;
  created_by_profile?: UserProfile | null;
  assigned_to_profile?: UserProfile | null;
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  user: UserProfile; // Made non-null to match DevelopmentComment
}

// Extended Task interface with detailed information from database
export interface TaskWithDetails
  extends
    Omit<Task, "created_by_profile" | "assigned_to_profile" | "comments"> {
  created_by_user: UserProfile | null;
  assigned_to_user: UserProfile | null;
  comments: TaskComment[];
}

// Interface for database comment structure
export interface DatabaseTaskComment {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}
