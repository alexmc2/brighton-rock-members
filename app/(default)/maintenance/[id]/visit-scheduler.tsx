'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MaintenanceRequestWithDetails } from '@/types/maintenance'

interface VisitSchedulerProps {
  request: MaintenanceRequestWithDetails
}

export default function VisitScheduler({ request }: VisitSchedulerProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      // Insert the visit
      const { error: insertError } = await supabase
        .from('maintenance_visits')
        .insert({
          request_id: request.id,
          scheduled_date: `${formData.get('scheduled_date')}T${formData.get('scheduled_time')}:00`,
          estimated_duration: `${formData.get('estimated_duration')} hours`,
          notes: formData.get('notes') || null
        })

      if (insertError) throw insertError

      // Only update status if it's pending
      if (request.status === 'pending') {
        const { error: updateError } = await supabase
          .from('maintenance_requests')
          .update({ status: 'scheduled' })
          .eq('id', request.id)

        if (updateError) throw updateError
      }

      form.reset()
      router.refresh()
    } catch (err) {
      console.error('Error scheduling visit:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="px-5 py-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Schedule Visit</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="scheduled_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Date
            </label>
            <input
              type="date"
              name="scheduled_date"
              id="scheduled_date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
            />
          </div>

          <div>
            <label htmlFor="scheduled_time" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Time
            </label>
            <input
              type="time"
              name="scheduled_time"
              id="scheduled_time"
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
            />
          </div>

          <div>
            <label htmlFor="estimated_duration" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Estimated Duration (hours)
            </label>
            <select
              name="estimated_duration"
              id="estimated_duration"
              required
              defaultValue="1"
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
              <option value="8">Full day (8 hours)</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
              placeholder="Any special instructions or notes for the visit"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-coop-600 px-3 py-2 text-sm font-semibold text-white hover:bg-coop-700 dark:bg-coop-500 dark:hover:bg-coop-600 focus:outline-none focus:ring-2 focus:ring-coop-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 