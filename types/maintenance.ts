export type MaintenanceStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent'

export interface MaintenanceRequest {
  id: string
  title: string
  description: string
  status: MaintenanceStatus
  priority: MaintenancePriority
  house_id: string
  reported_by: string
  created_at: string
  updated_at: string
}

export interface MaintenanceVisit {
  id: string
  request_id: string
  scheduled_date: string
  estimated_duration: string
  access_person_id: string | null
  notes: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface MaintenanceComment {
  id: string
  request_id: string
  user_id: string
  comment: string
  created_at: string
  user: {
    email: string
    full_name?: string | null
  }
}

export interface MaintenanceRequestWithDetails extends MaintenanceRequest {
  house: {
    name: string
  }
  reported_by_user: {
    email: string
    full_name?: string | null
  }
  visits: MaintenanceVisit[]
  comments: MaintenanceComment[]
} 