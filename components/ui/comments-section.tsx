// components/ui/comment-section.tsx

'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  BaseComment,
  CommentSectionProps,
  CommentResourceType,
} from '@/types/comments';

const COMMENTS_PER_PAGE = 5;

const getTableName = (type: CommentResourceType['type']) => {
  const tables = {
    development: 'development_comments',
    garden: 'garden_comments',
    maintenance: 'maintenance_comments',
    task: 'task_comments',
    todo: 'todo_comments'
  };
  return tables[type];
};

export default function CommentSection<T extends BaseComment>({
  comments,
  resourceId,
  resourceType,
}: CommentSectionProps<T>) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const supabase = createClientComponentClient();

  // Sort comments by date (newest first)
  const sortedComments = [...comments].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Calculate pagination
  const totalComments = sortedComments.length;
  const totalPages = Math.ceil(totalComments / COMMENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * COMMENTS_PER_PAGE;
  const endIndex = Math.min(startIndex + COMMENTS_PER_PAGE, totalComments);
  const paginatedComments = sortedComments.slice(startIndex, endIndex);

  // Helper function to get comment content safely
  const getCommentContent = (comment: T) => {
    return (comment as any)[resourceType.contentField] || '';
  };

  // Helper function to get user ID safely
  const getCommentUserId = (comment: T) => {
    return (comment as any)[resourceType.userField] || '';
  };

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

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const content = formData.get('content') as string;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to comment');
        return;
      }

      const tableName = getTableName(resourceType.type);
      const insertData = {
        [resourceType.field]: resourceId,
        [resourceType.userField]: user.id,
        [resourceType.contentField]: content,
      };

      const { error: insertError } = await supabase
        .from(tableName)
        .insert(insertData);

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

  const handleCommentUpdate = async (
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

      const tableName = getTableName(resourceType.type);
      const updateData = {
        [resourceType.contentField]: content,
      };

      const { error: updateError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', commentId)
        .eq(resourceType.userField, currentUserId);

      if (updateError) throw updateError;

      setEditingComment(null);
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

  const handleCommentDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?'))
      return;

    setError(null);
    try {
      const tableName = getTableName(resourceType.type);
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', commentId)
        .eq(resourceType.userField, currentUserId);

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
          Comments and Updates
        </h2>

        {/* Comment List */}
        <div className="space-y-4 mb-6">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/50 p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {paginatedComments.map((comment) => (
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
                    <Textarea
                      name="content"
                      defaultValue={getCommentContent(comment)}
                      required
                      rows={2}
                      className="block w-full"
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
                        {comment.user?.full_name || comment.user?.email}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {format(
                          new Date(comment.created_at),
                          'MMM d, yyyy h:mm a'
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {getCommentContent(comment)}
                    </div>
                    {currentUserId === getCommentUserId(comment) && (
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
          {comments.length === 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No comments yet
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing {startIndex + 1} to {endIndex} of {totalComments} comments
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

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
