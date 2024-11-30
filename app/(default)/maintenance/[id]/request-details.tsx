// app/(default)/maintenance/[id]/request-details.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format } from 'date-fns'
import { MaintenanceRequestWithDetails } from '@/types/maintenance'

interface RequestDetailsProps {
  request: MaintenanceRequestWithDetails
}

export default function RequestDetails({ request }: RequestDetailsProps) {
  const router = useRouter()
  const [editingVisit, setEditingVisit] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()
  const now = new Date()
  
  // Separate visits into upcoming and past
  const upcomingVisits = request.visits
    .filter(v => !v.completed_at && new Date(v.scheduled_date) > now)
    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())

  const pastVisits = request.visits
    .filter(v => v.completed_at || new Date(v.scheduled_date) <= now)
    .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime())

  const handleVisitUpdate = async (visitId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const { error: updateError } = await supabase
        .from('maintenance_visits')
        .update({
          scheduled_date: `${formData.get('scheduled_date')}T${formData.get('scheduled_time')}:00`,
          estimated_duration: `${formData.get('estimated_duration')} hours`,
          notes: formData.get('notes') || null
        })
        .eq('id', visitId)

      if (updateError) throw updateError

      setEditingVisit(null)
      router.refresh()
    } catch (err) {
      console.error('Error updating visit:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVisitDelete = async (visitId: string) => {
    if (!window.confirm('Are you sure you want to delete this visit?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('maintenance_visits')
        .delete()
        .eq('id', visitId)

      if (error) throw error

      router.refresh()
    } catch (err) {
      console.error('Error deleting visit:', err)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="px-5 py-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Request Details</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Description</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{request.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">House</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{request.house.name}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Reported By</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {request.reported_by_user.full_name || request.reported_by_user.email}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Date Reported</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Visit History</h3>
            <div className="space-y-3">
              {upcomingVisits.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Upcoming Visits</h4>
                  {upcomingVisits.map((visit) => (
                    <div 
                      key={visit.id}
                      className="flex items-start p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg mb-2"
                    >
                      {editingVisit === visit.id ? (
                        <form onSubmit={(e) => handleVisitUpdate(visit.id, e)} className="w-full space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                              <input
                                type="date"
                                name="scheduled_date"
                                defaultValue={visit.scheduled_date.split('T')[0]}
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Time</label>
                              <input
                                type="time"
                                name="scheduled_time"
                                defaultValue={visit.scheduled_date.split('T')[1].substring(0, 5)}
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Duration</label>
                            <select
                              name="estimated_duration"
                              defaultValue={visit.estimated_duration.split(' ')[0]}
                              required
                              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
                            >
                              <option value="1">1 hour</option>
                              <option value="2">2 hours</option>
                              <option value="3">3 hours</option>
                              <option value="4">4 hours</option>
                              <option value="8">Full day (8 hours)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
                            <textarea
                              name="notes"
                              defaultValue={visit.notes || ''}
                              rows={2}
                              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setEditingVisit(null)}
                              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="px-3 py-2 text-sm font-medium text-white bg-coop-600 hover:bg-coop-700 dark:bg-coop-500 dark:hover:bg-coop-600 rounded-lg"
                            >
                              Save Changes
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
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
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingVisit(visit.id)}
                              className="text-sm font-medium text-coop-600 hover:text-coop-700 dark:text-coop-400 dark:hover:text-coop-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleVisitDelete(visit.id)}
                              className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {pastVisits.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Past Visits</h4>
                  {pastVisits.map((visit) => (
                    <div 
                      key={visit.id}
                      className="flex items-start p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg mb-2"
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
                        <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
                          Completed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {request.visits.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">No visits scheduled yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 