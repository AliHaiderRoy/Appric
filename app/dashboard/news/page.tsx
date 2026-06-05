import Link from "next/link"
import { Plus } from "lucide-react"
import { getProfile } from "@/lib/auth/session"
import { getNewsPosts } from "@/actions/news"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { hasMinimumRole } from "@/lib/auth/roles"
import { formatDate } from "@/lib/dashboard/utils"

export default async function NewsPage() {
  const profile = await getProfile()
  if (!profile) return null

  const posts = await getNewsPosts()
  const canManage = hasMinimumRole(profile.role, "hr")
  const visible = canManage ? posts : posts.filter((p) => p.is_published)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Office News</h1>
          <p className="text-muted-foreground">Internal updates, events, and achievements</p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/dashboard/news/new">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((post) => (
          <Link key={post.id} href={`/dashboard/news/${post.slug}`}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              {post.cover_image_url && (
                <div
                  className="h-40 rounded-t-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${post.cover_image_url})` }}
                />
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{post.category}</Badge>
                  {!post.is_published && <Badge variant="secondary">Draft</Badge>}
                </div>
                <CardTitle className="text-lg">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {post.published_at ? formatDate(post.published_at) : "Draft"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {!visible.length && <p className="text-muted-foreground">No news posts yet</p>}
      </div>
    </div>
  )
}
