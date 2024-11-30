// File: app/(default)/tasks/[id]/comment-section.tsx

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TaskWithDetails, TaskComment } from '@/types/tasks';
import { Button } from '@/components/ui/button';

interface CommentSectionProps {
  task: TaskWithDetails;
}

export default function CommentSection({ task }: CommentSectionProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getCurrentUser() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) {
        console.error('Error fetching user:', authError);
        return;
      }
      setCurrentUserId(user?.id || null);
    }
    getCurrentUser();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const commentText = formData.get('content') as string;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to comment');
        return;
      }

      // Add the comment
      const { error: insertError } = await supabase
        .from('task_comments')
        .insert({
          task_id: task.id,
          created_by: user.id,
          content: commentText,
        });

      if (insertError) {
        console.error('Error adding comment:', insertError);
        setError('Failed to add comment. Please try again.');
        return;
      }

      form.reset();
      router.refresh();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentUpdate = async (
    commentId: string,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const commentText = formData.get('content') as string;

    try {
      // Update the comment
      const { error: updateError } = await supabase
        .from('task_comments')
        .update({ content: commentText })
        .eq('id', commentId)
        .eq('created_by', currentUserId);

      if (updateError) {
        console.error('Error updating comment:', updateError);
        setError('Failed to update comment. Please try again.');
        return;
      }

      setEditingComment(null);
      router.refresh();
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId)
        .eq('created_by', currentUserId);

      if (deleteError) {
        console.error('Error deleting comment:', deleteError);
        setError('Failed to delete comment. Please try again.');
        return;
      }

      router.refresh();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="px-5 py-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Comments
        </h2>

        {/* Comment List */}
        <div className="space-y-4 mb-6">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/50 p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {task.comments.map((comment: TaskComment) => (
            <div
              key={comment.id}
              className="flex space-x-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-coop-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {comment.user?.full_name?.charAt(0).toUpperCase() ||
                      comment.user?.email?.charAt(0).toUpperCase() ||
                      '?'}
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                {editingComment === comment.id ? (
                  <form
                    onSubmit={(e) => handleCommentUpdate(comment.id, e)}
                    className="space-y-2"
                  >
                    <textarea
                      name="content"
                      defaultValue={comment.content}
                      required
                      rows={2}
                      className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditingComment(null)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        Save
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {comment.user?.full_name ||
                          comment.user?.email ||
                          'Unknown User'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {format(
                          new Date(comment.created_at),
                          'MMM d, yyyy h:mm a'
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {comment.content}
                    </div>
                    {currentUserId === comment.created_by && (
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
          {task.comments.length === 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No comments yet
            </div>
          )}
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="content" className="sr-only">
              Add a comment
            </label>
            <textarea
              name="content"
              id="content"
              rows={3}
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
              placeholder="Add a comment..."
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Comment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
