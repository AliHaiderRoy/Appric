import { CmsLiveRefresh } from "@/components/cms/cms-live-refresh"
import { BlogView } from "@/components/pages/blog-view"
import { getPublishedBlogPosts } from "@/lib/cms/queries"

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts()

  return (
    <>
      <CmsLiveRefresh />
      <BlogView posts={posts} />
    </>
  )
}
