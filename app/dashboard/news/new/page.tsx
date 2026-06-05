"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUploadField } from "@/components/dashboard/image-upload-field"
import { createNewsPost } from "@/actions/news"
import { slugify } from "@/lib/dashboard/utils"

export default function NewNewsPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    const title = formData.get("title")?.toString() ?? ""
    if (!formData.get("slug")) {
      formData.set("slug", slugify(title))
    }
    startTransition(async () => {
      const result = await createNewsPost(formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success("News post created")
        router.push("/dashboard/news")
      }
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New News Post</h1>
        <Button variant="ghost" asChild>
          <Link href="/dashboard/news">Cancel</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input id="excerpt" name="excerpt" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" rows={10} required />
            </div>
            <ImageUploadField
              label="Cover image"
              urlFieldName="coverImageUrl"
              urlPlaceholder="Or paste cover image URL (stored in Supabase news-images bucket)"
            />
            <div className="space-y-2">
              <Label>Category</Label>
              <Select name="category" defaultValue="general">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="achievement">Achievement</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch name="isPublished" value="true" />
              <Label>Publish immediately</Label>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Post
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
