import { notFound } from "next/navigation"
import { getNewsBySlug } from "@/actions/news"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/dashboard/utils"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getNewsBySlug(slug)

  if (!post) notFound()

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      {post.cover_image_url && (
        <div
          className="aspect-video rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${post.cover_image_url})` }}
        />
      )}
      <Card>
        <CardHeader>
          <Badge variant="outline">{post.category}</Badge>
          <CardTitle className="text-3xl">{post.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {post.published_at ? formatDate(post.published_at) : ""}
          </p>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {post.content}
          </div>
        </CardContent>
      </Card>
    </article>
  )
}
