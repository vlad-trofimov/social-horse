import { createClient } from '@/lib/supabase/server'
import { getPostWithComments } from '@/lib/queries/post'
import PostCard from '@/components/feed/PostCard'
import CommentList from '@/components/comments/CommentList'
import CommentForm from '@/components/comments/CommentForm'

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const post = await getPostWithComments(id, user!.id)

  if (!post) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">Post not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PostCard post={post} currentUserId={user!.id} />

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Comments ({post.comments.length})
        </h2>
        <CommentList comments={post.comments} currentUserId={user!.id} postId={post.id} />
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <CommentForm postId={post.id} />
        </div>
      </div>
    </div>
  )
}
