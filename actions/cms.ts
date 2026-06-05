"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/session"
import { slugify } from "@/lib/dashboard/utils"
import { CMS_PUBLIC_PATHS, CMS_TAGS } from "@/lib/cms/types"
import type { CmsContentStatus } from "@/lib/cms/types"
import { IMAGE_BUCKETS, resolveImageUrlFromForm } from "@/lib/storage/image-upload"

function revalidateCmsPublic() {
  revalidateTag(CMS_TAGS.settings)
  revalidateTag(CMS_TAGS.services)
  revalidateTag(CMS_TAGS.portfolio)
  revalidateTag(CMS_TAGS.blog)
  revalidateTag(CMS_TAGS.team)
  revalidateTag(CMS_TAGS.logos)
  for (const path of CMS_PUBLIC_PATHS) {
    revalidatePath(path)
  }
  revalidatePath("/dashboard/cms")
}

async function logRevision(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entityType: string,
  entityId: string,
  action: string,
  snapshot: unknown,
  userId: string
) {
  await supabase.from("site_content_revisions").insert({
    entity_type: entityType,
    entity_id: entityId,
    action,
    snapshot: snapshot as Record<string, unknown>,
    changed_by: userId,
  })
}

export async function updateSiteSetting(key: string, value: Record<string, unknown>) {
  const profile = await requireRole("admin")
  const supabase = await createClient()

  const { error } = await supabase.from("site_settings").upsert({
    key,
    value,
    updated_by: profile.id,
  })

  if (error) return { error: error.message }

  await logRevision(supabase, "site_settings", key, "update", value, profile.id)
  revalidateCmsPublic()
  return { success: true }
}

export async function upsertService(formData: FormData) {
  const profile = await requireRole("admin")
  const supabase = await createClient()

  const id = formData.get("id")?.toString()
  const featuresRaw = formData.get("features")?.toString() ?? ""
  const features = featuresRaw.split("\n").map((f) => f.trim()).filter(Boolean)

  const payload = {
    title: formData.get("title")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    features,
    icon: formData.get("icon")?.toString() ?? "Code",
    color_gradient: formData.get("color_gradient")?.toString() ?? "from-blue-500 to-cyan-500",
    sort_order: Number(formData.get("sort_order") ?? 0),
    status: (formData.get("status")?.toString() ?? "published") as CmsContentStatus,
    is_featured: formData.get("is_featured") === "true",
  }

  if (!payload.title) return { error: "Title is required" }

  const { data, error } = id
    ? await supabase.from("site_services").update(payload).eq("id", id).select("id").single()
    : await supabase.from("site_services").insert(payload).select("id").single()

  if (error) return { error: error.message }

  await logRevision(supabase, "site_services", data.id, id ? "update" : "create", payload, profile.id)
  revalidateCmsPublic()
  return { success: true }
}

export async function deleteService(id: string) {
  const profile = await requireRole("admin")
  const supabase = await createClient()
  const { error } = await supabase.from("site_services").delete().eq("id", id)
  if (error) return { error: error.message }
  await logRevision(supabase, "site_services", id, "delete", null, profile.id)
  revalidateCmsPublic()
  return { success: true }
}

export async function upsertPortfolioItem(formData: FormData) {
  const profile = await requireRole("admin")
  const supabase = await createClient()

  const imageResult = await resolveImageUrlFromForm(supabase, formData, {
    bucket: IMAGE_BUCKETS.cmsImages,
    pathPrefix: `portfolio/${profile.id}`,
  })
  if ("error" in imageResult) return { error: imageResult.error }

  const id = formData.get("id")?.toString()
  const techRaw = formData.get("technologies")?.toString() ?? ""
  const technologies = techRaw.split("\n").map((t) => t.trim()).filter(Boolean)

  const payload = {
    title: formData.get("title")?.toString() ?? "",
    category: formData.get("category")?.toString() ?? "Web Development",
    description: formData.get("description")?.toString() ?? "",
    image_url: imageResult.url,
    technologies,
    project_url: formData.get("project_url")?.toString() || null,
    github_url: formData.get("github_url")?.toString() || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
    status: (formData.get("status")?.toString() ?? "published") as CmsContentStatus,
  }

  if (!payload.title) return { error: "Title is required" }

  const { data, error } = id
    ? await supabase.from("site_portfolio").update(payload).eq("id", id).select("id").single()
    : await supabase.from("site_portfolio").insert(payload).select("id").single()

  if (error) return { error: error.message }

  await logRevision(supabase, "site_portfolio", data.id, id ? "update" : "create", payload, profile.id)
  revalidateCmsPublic()
  return { success: true }
}

export async function deletePortfolioItem(id: string) {
  const profile = await requireRole("admin")
  const supabase = await createClient()
  const { error } = await supabase.from("site_portfolio").delete().eq("id", id)
  if (error) return { error: error.message }
  await logRevision(supabase, "site_portfolio", id, "delete", null, profile.id)
  revalidateCmsPublic()
  return { success: true }
}

export async function upsertBlogPost(formData: FormData) {
  const profile = await requireRole("admin")
  const supabase = await createClient()

  const imageResult = await resolveImageUrlFromForm(supabase, formData, {
    bucket: IMAGE_BUCKETS.cmsImages,
    pathPrefix: `blog/${profile.id}`,
  })
  if ("error" in imageResult) return { error: imageResult.error }

  const id = formData.get("id")?.toString()
  const title = formData.get("title")?.toString() ?? ""
  const status = (formData.get("status")?.toString() ?? "draft") as CmsContentStatus
  const slug = formData.get("slug")?.toString() || slugify(title)

  const payload = {
    title,
    slug,
    excerpt: formData.get("excerpt")?.toString() || null,
    content: formData.get("content")?.toString() ?? "",
    category: formData.get("category")?.toString() ?? "General",
    author_name: formData.get("author_name")?.toString() ?? "APPRIC Team",
    read_time: formData.get("read_time")?.toString() ?? "5 min read",
    image_url: imageResult.url,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  }

  if (!payload.title) return { error: "Title is required" }

  const { data, error } = id
    ? await supabase.from("site_blog_posts").update(payload).eq("id", id).select("id").single()
    : await supabase.from("site_blog_posts").insert(payload).select("id").single()

  if (error) return { error: error.message }

  await logRevision(supabase, "site_blog_posts", data.id, id ? "update" : "create", payload, profile.id)
  revalidateCmsPublic()
  return { success: true }
}

export async function deleteBlogPost(id: string) {
  const profile = await requireRole("admin")
  const supabase = await createClient()
  const { error } = await supabase.from("site_blog_posts").delete().eq("id", id)
  if (error) return { error: error.message }
  await logRevision(supabase, "site_blog_posts", id, "delete", null, profile.id)
  revalidateCmsPublic()
  return { success: true }
}

export async function upsertTeamMember(formData: FormData) {
  const profile = await requireRole("admin")
  const supabase = await createClient()

  const imageResult = await resolveImageUrlFromForm(supabase, formData, {
    bucket: IMAGE_BUCKETS.cmsImages,
    pathPrefix: `team/${profile.id}`,
  })
  if ("error" in imageResult) return { error: imageResult.error }

  const id = formData.get("id")?.toString()
  const payload = {
    name: formData.get("name")?.toString() ?? "",
    role: formData.get("role")?.toString() ?? "",
    bio: formData.get("bio")?.toString() ?? "",
    image_url: imageResult.url,
    sort_order: Number(formData.get("sort_order") ?? 0),
    status: (formData.get("status")?.toString() ?? "published") as CmsContentStatus,
  }

  if (!payload.name) return { error: "Name is required" }

  const { data, error } = id
    ? await supabase.from("site_team_members").update(payload).eq("id", id).select("id").single()
    : await supabase.from("site_team_members").insert(payload).select("id").single()

  if (error) return { error: error.message }

  await logRevision(supabase, "site_team_members", data.id, id ? "update" : "create", payload, profile.id)
  revalidateCmsPublic()
  return { success: true }
}

export async function deleteTeamMember(id: string) {
  const profile = await requireRole("admin")
  const supabase = await createClient()
  const { error } = await supabase.from("site_team_members").delete().eq("id", id)
  if (error) return { error: error.message }
  await logRevision(supabase, "site_team_members", id, "delete", null, profile.id)
  revalidateCmsPublic()
  return { success: true }
}

export async function upsertClientLogo(formData: FormData) {
  const profile = await requireRole("admin")
  const supabase = await createClient()

  const imageResult = await resolveImageUrlFromForm(supabase, formData, {
    bucket: IMAGE_BUCKETS.cmsImages,
    pathPrefix: `logos/${profile.id}`,
    urlFieldName: "logo_url",
  })
  if ("error" in imageResult) return { error: imageResult.error }

  const id = formData.get("id")?.toString()
  const payload = {
    name: formData.get("name")?.toString() ?? "",
    logo_url: imageResult.url,
    sort_order: Number(formData.get("sort_order") ?? 0),
    status: (formData.get("status")?.toString() ?? "published") as CmsContentStatus,
  }

  if (!payload.name) return { error: "Name is required" }

  const { data, error } = id
    ? await supabase.from("site_client_logos").update(payload).eq("id", id).select("id").single()
    : await supabase.from("site_client_logos").insert(payload).select("id").single()

  if (error) return { error: error.message }

  await logRevision(supabase, "site_client_logos", data.id, id ? "update" : "create", payload, profile.id)
  revalidateCmsPublic()
  return { success: true }
}

export async function deleteClientLogo(id: string) {
  const profile = await requireRole("admin")
  const supabase = await createClient()
  const { error } = await supabase.from("site_client_logos").delete().eq("id", id)
  if (error) return { error: error.message }
  await logRevision(supabase, "site_client_logos", id, "delete", null, profile.id)
  revalidateCmsPublic()
  return { success: true }
}
