export type GardenAreaStatus = 'active' | 'inactive'
export type GardenTaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type GardenTaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type PlantStatus = 'alive' | 'dormant' | 'dead' | 'removed'

export interface GardenArea {
  id: string
  name: string
  description: string | null
  status: GardenAreaStatus
  created_at: string
  updated_at: string
}

export interface GardenTask {
  id: string
  title: string
  description: string
  status: GardenTaskStatus
  priority: GardenTaskPriority
  area_id: string
  assigned_to: string | null
  due_date: string | null
  scheduled_time: string | null
  duration: string | null
  created_at: string
  updated_at: string
}

export interface GardenComment {
  id: string
  task_id: string
  user_id: string
  comment: string
  created_at: string
  user: {
    email: string
    full_name: string | null  // Removed the ? to match DevelopmentComment
  }
}

export interface GardenPlant {
  id: string
  name: string
  type: string
  area_id: string | null
  planting_date: string | null
  notes: string | null
  status: PlantStatus
  created_at: string
  updated_at: string
}

export interface GardenTaskWithDetails extends GardenTask {
  area: GardenArea
  assigned_to_user: {
    email: string
  } | null
  comments: GardenComment[]
}

export interface GardenAreaWithDetails extends GardenArea {
  tasks: GardenTask[]
  plants: GardenPlant[]
} 