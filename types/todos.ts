// types/todo.ts

// Define possible statuses as used in your code
export type TodoStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "todo";

// Define todo priorities
export type TodoPriority = "low" | "medium" | "high" | "urgent";

// Define todo types/categories
export type TodoCategory = "general" | "minuted";

// Base user profile interface
interface UserProfile {
  email: string;
  full_name: string | null;
}

// Interface for Todo
export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;

  todo_type: TodoCategory;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  assigned_to: string | null;
  created_by_profile?: UserProfile | null;
  assigned_to_profile?: UserProfile | null;
  comments?: TodoComment[];
}

export interface TodoComment {
  id: string;
  todo_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  user: UserProfile;
}

// Extended Todo interface with detailed information from database
export interface TodoWithDetails
  extends
    Omit<Todo, "created_by_profile" | "assigned_to_profile" | "comments"> {
  created_by_user: UserProfile | null;
  assigned_to_user: UserProfile | null;
  comments: TodoComment[];
}

// Interface for database comment structure
export interface DatabaseTodoComment {
  id: string;
  todo_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}
