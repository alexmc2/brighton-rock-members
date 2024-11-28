'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { MaintenanceRequestWithDetails } from '@/types/maintenance'

interface CommentSectionProps {
  request: MaintenanceRequestWithDetails
}

export default function CommentSection({ request }: CommentSectionProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    const commentText = formData.get('comment')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to comment')
        return
      }

      // First ensure user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        // Create profile if it doesn't exist
        const { error: insertProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null
          })

        if (insertProfileError) {
          console.error('Error creating profile:', insertProfileError)
          setError('Failed to create user profile')
          return
        }
      }

      // Then add the comment
      const { error: insertError } = await supabase
        .from('maintenance_comments')
        .insert({
          request_id: request.id,
          user_id: user.id,
          comment: commentText
        })

      if (insertError) {
        console.error('Error adding comment:', insertError)
        setError('Failed to add comment. Please try again.')
        return
      }

      form.reset()
      router.refresh()
    } catch (err) {
      console.error('Error adding comment:', err)
      setError('Failed to add comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentUpdate = async (commentId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    const commentText = formData.get('comment')

    try {
      // First check if we can update this comment
      const { data: comment, error: checkError } = await supabase
        .from('maintenance_comments')
        .select('user_id')
        .eq('id', commentId)
        .single()

      if (checkError || !comment || comment.user_id !== currentUserId) {
        setError('You do not have permission to edit this comment')
        return
      }

      const { error: updateError } = await supabase
        .from('maintenance_comments')
        .update({ comment: commentText })
        .eq('id', commentId)
        .eq('user_id', currentUserId)

      if (updateError) {
        console.error('Error updating comment:', updateError)
        setError('Failed to update comment. Please try again.')
        return
      }

      setEditingComment(null)
      router.refresh()
    } catch (err) {
      console.error('Error updating comment:', err)
      setError('Failed to update comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }

    setError(null)
    try {
      // First check if we can delete this comment
      const { data: comment, error: checkError } = await supabase
        .from('maintenance_comments')
        .select('user_id')
        .eq('id', commentId)
        .single()

      if (checkError || !comment || comment.user_id !== currentUserId) {
        setError('You do not have permission to delete this comment')
        return
      }

      const { error: deleteError } = await supabase
        .from('maintenance_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUserId)

      if (deleteError) {
        console.error('Error deleting comment:', deleteError)
        setError('Failed to delete comment. Please try again.')
        return
      }

      router.refresh()
    } catch (err) {
      console.error('Error deleting comment:', err)
      setError('Failed to delete comment. Please try again.')
    }
  }

  const sortedComments = [...request.comments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="px-5 py-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Comments</h2>

        {/* Comment List */}
        <div className="space-y-4 mb-6">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/50 p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {sortedComments.map((comment) => (
            <div 
              key={comment.id}
              className="flex space-x-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-coop-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {comment.user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                {editingComment === comment.id ? (
                  <form onSubmit={(e) => handleCommentUpdate(comment.id, e)} className="space-y-2">
                    <textarea
                      name="comment"
                      defaultValue={comment.comment}
                      required
                      rows={2}
                      className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingComment(null)}
                        className="text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="text-sm font-medium text-coop-600 hover:text-coop-700 dark:text-coop-400 dark:hover:text-coop-300"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {comment.user.email}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {comment.comment}
                    </div>
                    {currentUserId === comment.user_id && (
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => setEditingComment(comment.id)}
                          className="text-sm font-medium text-coop-600 hover:text-coop-700 dark:text-coop-400 dark:hover:text-coop-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleCommentDelete(comment.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          {request.comments.length === 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No comments yet
            </div>
          )}
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="comment" className="sr-only">
              Add a comment
            </label>
            <textarea
              name="comment"
              id="comment"
              rows={3}
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
              placeholder="Add a comment..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-coop-600 px-3 py-2 text-sm font-semibold text-white hover:bg-coop-700 dark:bg-coop-500 dark:hover:bg-coop-600 focus:outline-none focus:ring-2 focus:ring-coop-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 