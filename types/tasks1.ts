export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskCategory = 'general' | 'minuted'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  category: TaskCategory
  assigned_to: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TaskComment {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  created_by: string;
  user?: {
    full_name?: string | null;
    email: string;
  };
}

export interface TaskWithDetails extends Task {
  assigned_to_user: {
    email: string
    full_name?: string | null
  } | null
  comments: TaskComment[]
} 