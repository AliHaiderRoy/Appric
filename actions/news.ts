"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireAuth, requireRole } from "@/lib/auth/session"
import { newsSchema } from "@/lib/validations/employee"
import { slugify } from "@/lib/dashboard/utils"
import { IMAGE_BUCKETS, resolveImageUrlFromForm } from "@/lib/storage/image-upload"

export async function getNewsPosts() {
  await requireAuth()
  const supabase = await createClient()

  const { data } = await supabase
    .from("office_news")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })

  return data ?? []
}

export async function getNewsBySlug(slug: string) {
  await requireAuth()
  const supabase = await createClient()

  const { data } = await supabase
    .from("office_news")
    .select("*")
    .eq("slug", slug)
    .single()

  return data
}

export async function createNewsPost(formData: FormData) {
  await requireRole("hr")
  const profile = await requireAuth()

  const supabase = await createClient()
  const coverResult = await resolveImageUrlFromForm(supabase, formData, {
    bucket: IMAGE_BUCKETS.newsImages,
    pathPrefix: `news/${profile.id}`,
    urlFieldName: "coverImageUrl",
  })
  if ("error" in coverResult) return { error: coverResult.error }

  const title = formData.get("title")?.toString() ?? ""
  const parsed = newsSchema.safeParse({
    title,
    slug: formData.get("slug")?.toString() || slugify(title),
    excerpt: formData.get("excerpt")?.toString() || null,
    content: formData.get("content")?.toString() ?? "",
    category: formData.get("category") || "general",
    coverImageUrl: coverResult.url,
    isPublished: formData.get("isPublished") === "true",
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }
  const { error } = await supabase.from("office_news").insert({
    title: parsed.data.title,
    slug: parsed.data.slug,
    excerpt: parsed.data.excerpt ?? null,
    content: parsed.data.content,
    category: parsed.data.category,
    cover_image_url: parsed.data.coverImageUrl ?? null,
    author_id: profile.id,
    is_published: parsed.data.isPublished,
    published_at: parsed.data.isPublished ? new Date().toISOString() : null,
  })

  if (error) return { error: error.message }

  revalidatePath("/dashboard/news")
  return { success: true }
}
