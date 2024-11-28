'use client'

import { useState } from 'react'
import { MaintenanceRequestWithDetails, MaintenanceStatus } from '@/types/maintenance'
import { format } from 'date-fns'
import Link from 'next/link'

interface MaintenanceListProps {
  requests: MaintenanceRequestWithDetails[]
}

export default function MaintenanceList({ requests }: MaintenanceListProps) {
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all')

  const filteredRequests = requests.filter(request => 
    statusFilter === 'all' || request.status === statusFilter
  )

  const getStatusColor = (status: MaintenanceStatus) => {
    const colors = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200',
      scheduled: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
      in_progress: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200',
      completed: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
      cancelled: 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200'
    }
    return colors[status]
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-coop-600 dark:bg-coop-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          All
        </button>
        {['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as MaintenanceStatus)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-coop-600 dark:bg-coop-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative">
        <div className="overflow-x-auto">
          <table className="table-auto w-full divide-y divide-slate-200 dark:divide-slate-700">
            {/* Table header */}
            <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20">
              <tr>
                <th className="px-4 py-3">
                  <div className="font-semibold text-left">Title</div>
                </th>
                <th className="px-4 py-3">
                  <div className="font-semibold text-left">House</div>
                </th>
                <th className="px-4 py-3">
                  <div className="font-semibold text-left">Status</div>
                </th>
                <th className="px-4 py-3">
                  <div className="font-semibold text-left">Reported By</div>
                </th>
                <th className="px-4 py-3">
                  <div className="font-semibold text-left">Date</div>
                </th>
                <th className="px-4 py-3">
                  <div className="font-semibold text-left">Next P4P Visit</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredRequests.map((request) => {
                const nextVisit = request.visits
                  .filter(v => !v.completed_at && new Date(v.scheduled_date) > new Date())
                  .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())[0]

                return (
                  <tr key={request.id}>
                    <td className="px-4 py-3">
                      <Link 
                        href={`/maintenance/${request.id}`}
                        className="text-coop-600 hover:text-coop-700 dark:text-coop-400 dark:hover:text-coop-300 font-medium"
                      >
                        {request.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 dark:text-slate-100">
                        {request.house.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 dark:text-slate-100">
                        {request.reported_by_user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 dark:text-slate-100">
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 dark:text-slate-100">
                        {nextVisit 
                          ? format(new Date(nextVisit.scheduled_date), 'MMM d, yyyy h:mm a')
                          : '-'
                        }
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No maintenance requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 