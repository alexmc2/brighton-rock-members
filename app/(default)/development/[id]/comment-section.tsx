// app/(default)/development/[id]/comment-section.tsx

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DevelopmentInitiativeWithDetails } from '@/types/development';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentSectionProps {
  initiative: DevelopmentInitiativeWithDetails;
}

export default function CommentSection({ initiative }: CommentSectionProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
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

  // Add new comment
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const content = formData.get('content') as string;

      // Insert the comment with the correct user_id
      const { error: insertError } = await supabase
        .from('development_comments')
        .insert({
          initiative_id: initiative.id,
          content,
          user_id: currentUserId, // Ensure user_id is set correctly
        });

      if (insertError) throw insertError;

      form.reset();
      router.refresh();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to add comment. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit existing comment
  const handleEdit = async (
    commentId: string,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const content = formData.get('content') as string;

      const { error: updateError } = await supabase
        .from('development_comments')
        .update({ content })
        .eq('id', commentId)
        .eq('user_id', currentUserId); // Ensure only the owner can edit

      if (updateError) throw updateError;

      setEditingCommentId(null);
      router.refresh();
    } catch (err) {
      console.error('Error updating comment:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update comment. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete comment
  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?'))
      return;

    try {
      const { error: deleteError } = await supabase
        .from('development_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUserId); // Ensure only the owner can delete

      if (deleteError) throw deleteError;

      router.refresh();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete comment. Please try again.'
      );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="px-5 py-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Comments
        </h2>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/50 p-4 mb-4">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4 mb-6">
          {initiative.comments.map((comment) => (
            <div
              key={comment.id}
              className="flex space-x-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-coop-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {comment.user.full_name?.charAt(0).toUpperCase() ||
                      comment.user.email.charAt(0).toUpperCase() ||
                      '?'}
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                {editingCommentId === comment.id ? (
                  <form
                    onSubmit={(e) => handleEdit(comment.id, e)}
                    className="space-y-2"
                  >
                    <Textarea
                      name="content"
                      defaultValue={comment.content}
                      required
                      rows={2}
                      className="block w-full"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditingCommentId(null)}
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
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {comment.user.full_name || comment.user.email}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {format(
                          new Date(comment.created_at),
                          'MMM d, yyyy h:mm a'
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">
                      {comment.content}
                    </div>
                    {currentUserId === comment.user_id && (
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => setEditingCommentId(comment.id)}
                          className="text-sm font-medium text-coop-600 hover:text-coop-700 dark:text-coop-400 dark:hover:text-coop-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
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
          {initiative.comments.length === 0 && (
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
            <Textarea
              name="content"
              id="content"
              rows={3}
              required
              className="mt-1 block w-full"
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
