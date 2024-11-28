'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MaintenanceRequestWithDetails, MaintenancePriority, MaintenanceStatus } from '@/types/maintenance'
import Link from 'next/link'
import { format } from 'date-fns'

export default function EditMaintenanceRequest({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [request, setRequest] = useState<MaintenanceRequestWithDetails | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<MaintenancePriority>('medium')
  const [status, setStatus] = useState<MaintenanceStatus>('pending')
  const [houses, setHouses] = useState<{ id: string, name: string }[]>([])
  const [houseId, setHouseId] = useState('')
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch request
        const { data: request, error: requestError } = await supabase
          .from('maintenance_requests')
          .select(`
            *,
            house:houses!maintenance_requests_house_id_fkey(id, name),
            reported_by_user:profiles!maintenance_requests_reported_by_fkey(email),
            visits:maintenance_visits(
              id,
              scheduled_date,
              estimated_duration,
              notes,
              completed_at
            )
          `)
          .eq('id', params.id)
          .single()

        if (requestError) throw requestError
        if (!request) throw new Error('Request not found')

        // Fetch houses
        const { data: houses, error: housesError } = await supabase
          .from('houses')
          .select('id, name')
          .order('name')

        if (housesError) throw housesError

        setRequest(request)
        setTitle(request.title)
        setDescription(request.description)
        setPriority(request.priority)
        setStatus(request.status)
        setHouseId(request.house_id)
        setHouses(houses || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load request')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('maintenance_requests')
        .update({
          title,
          description,
          priority,
          status,
          house_id: houseId
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      router.push(`/maintenance/${params.id}`)
    } catch (err) {
      console.error('Error updating request:', err)
      setError('Failed to update request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this maintenance request? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      // First delete all visits
      const { error: visitsError } = await supabase
        .from('maintenance_visits')
        .delete()
        .eq('request_id', params.id)

      if (visitsError) throw visitsError

      // Then delete all comments
      const { error: commentsError } = await supabase
        .from('maintenance_comments')
        .delete()
        .eq('request_id', params.id)

      if (commentsError) throw commentsError

      // Finally delete the request
      const { error: deleteError } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', params.id)

      if (deleteError) throw deleteError

      router.push('/maintenance')
    } catch (err) {
      console.error('Error deleting request:', err)
      setError('Failed to delete request')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <Link
            href={`/maintenance/${params.id}`}
            className="text-sm font-medium text-coop-600 hover:text-coop-700"
          >
            ← Back to Property Visit
          </Link>
          <h1 className="text-2xl font-bold mt-2">Edit Property Visit</h1>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? 'Deleting...' : 'Delete Request'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
            />
          </div>

          <div>
            <label htmlFor="house_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              House
            </label>
            <select
              id="house_id"
              value={houseId}
              onChange={(e) => setHouseId(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
            >
              {houses.map((house) => (
                <option key={house.id} value={house.id}>
                  {house.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
              required
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
              required
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
            >
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {request?.visits && request.visits.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Scheduled Visits</h3>
              <div className="space-y-2">
                {request.visits.map((visit) => (
                  <div 
                    key={visit.id}
                    className="flex items-start p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                  >
                    <div className="grow">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        {format(new Date(visit.scheduled_date), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Estimated Duration: {visit.estimated_duration}
                      </div>
                      {visit.notes && (
                        <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                          Notes: {visit.notes}
                        </div>
                      )}
                    </div>
                    {visit.completed_at && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Completed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Link
              href={`/maintenance/${params.id}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-coop-600 px-3 py-2 text-sm font-semibold text-white hover:bg-coop-700 focus:outline-none focus:ring-2 focus:ring-coop-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 