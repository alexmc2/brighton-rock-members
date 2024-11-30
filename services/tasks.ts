import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { TaskWithDetails, TaskComment, DatabaseTaskComment } from '@/types/tasks'

interface Profile {
  id: string
  email: string
  full_name: string | null
}

export async function getTask(id: string) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // First get the task with basic comment data
    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        comments:task_comments(
          id,
          task_id,
          content,
          created_at,
          updated_at,
          created_by
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching Task:', error)
      return null
    }

    // Then fetch user data for each comment and assigned user
    if (task) {
      const userIds = new Set<string>()
      
      // Add assigned user if exists
      if (task.assigned_to) {
        userIds.add(task.assigned_to)
      }
      
      // Add comment users
      if (task.comments) {
        task.comments.forEach((comment: DatabaseTaskComment) => {
          if (comment.created_by) {
            userIds.add(comment.created_by)
          }
        })
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', Array.from(userIds))

      if (!profilesError && profiles) {
        // Create a map of user_id to profile data
        const userMap = profiles.reduce<Record<string, Profile>>((acc, profile) => {
          acc[profile.id] = profile
          return acc
        }, {})

        // Attach user data to each comment
        if (task.comments) {
          task.comments = task.comments.map((comment: DatabaseTaskComment): TaskComment => ({
            ...comment,
            user: comment.created_by ? {
              email: userMap[comment.created_by].email,
              full_name: userMap[comment.created_by].full_name
            } : null
          }))
        }

        // Attach assigned user data
        if (task.assigned_to && userMap[task.assigned_to]) {
          task.assigned_to_user = {
            email: userMap[task.assigned_to].email,
            full_name: userMap[task.assigned_to].full_name
          }
        } else {
          task.assigned_to_user = null
        }
      }
    }

    return task as TaskWithDetails
  } catch (err) {
    console.error('Error fetching Task:', err)
    return null
  }
}

export async function getTasks(category: string = 'general') {
  try {
    const supabase = createServerComponentClient({ cookies })

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        comments:task_comments(count)
      `)
      .eq('task_type', category)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching Tasks:', error)
      return []
    }

    // Fetch user data for assigned users
    const userIds = tasks
      .map(task => task.assigned_to)
      .filter((id): id is string => id !== null)

    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds)

      if (!profilesError && profiles) {
        // Create a map of user_id to profile data
        const userMap = profiles.reduce<Record<string, Profile>>((acc, profile) => {
          acc[profile.id] = profile
          return acc
        }, {})

        // Attach user data to each task
        tasks.forEach(task => {
          if (task.assigned_to && userMap[task.assigned_to]) {
            task.assigned_to_user = {
              email: userMap[task.assigned_to].email,
              full_name: userMap[task.assigned_to].full_name
            }
          } else {
            task.assigned_to_user = null
          }
        })
      }
    }

    return tasks as TaskWithDetails[]
  } catch (err) {
    console.error('Error fetching Tasks:', err)
    return []
  }
} 