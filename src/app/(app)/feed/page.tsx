import { createClient } from '@/lib/supabase/server'
import CreatePostForm from '@/components/feed/CreatePostForm'
import FeedContainer from '@/components/feed/FeedContainer'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <CreatePostForm />
      <div className="mt-6">
        <FeedContainer userId={user!.id} />
      </div>
    </div>
  )
}
