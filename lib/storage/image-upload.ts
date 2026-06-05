import type { SupabaseClient } from "@supabase/supabase-js"

export const IMAGE_BUCKETS = {
  avatars: "avatars",
  newsImages: "news-images",
  cmsImages: "cms-images",
} as const

export type ImageBucket = (typeof IMAGE_BUCKETS)[keyof typeof IMAGE_BUCKETS]

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])
const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120)
}

/** Browsers on Windows often leave `file.type` empty. */
export function inferImageContentType(file: File): string | null {
  if (file.type && ALLOWED_TYPES.has(file.type)) return file.type
  const ext = file.name.split(".").pop()?.toLowerCase()
  if (ext && ext in EXT_TO_MIME) return EXT_TO_MIME[ext]
  return null
}

function validateImageFile(file: File): string | null {
  if (!file.size) return "No file provided"
  if (file.size > MAX_BYTES) return "Image must be 5 MB or smaller"
  if (!inferImageContentType(file)) {
    return "Only JPEG, PNG, WebP, and GIF images are allowed"
  }
  return null
}

export async function uploadImageFile(
  supabase: SupabaseClient,
  bucket: ImageBucket,
  file: File,
  pathPrefix: string,
  options?: { objectPath?: string }
): Promise<{ url: string } | { error: string }> {
  const validationError = validateImageFile(file)
  if (validationError) return { error: validationError }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const path =
    options?.objectPath ??
    `${pathPrefix}/${Date.now()}-${sanitizeFileName(file.name)}`.replace(/\.[^./]+$/, "") + `.${ext}`

  const contentType = inferImageContentType(file) ?? file.type

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType,
  })

  if (uploadError) return { error: uploadError.message }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: data.publicUrl }
}

/** Prefer uploaded file; otherwise keep existing URL from the form. */
export async function resolveImageUrlFromForm(
  supabase: SupabaseClient,
  formData: FormData,
  options: {
    bucket: ImageBucket
    pathPrefix: string
    fileFieldName?: string
    urlFieldName?: string
  }
): Promise<{ url: string | null } | { error: string }> {
  const fileField = options.fileFieldName ?? "image_file"
  const urlField = options.urlFieldName ?? "image_url"
  const file = formData.get(fileField)

  if (file instanceof File && file.size > 0) {
    return uploadImageFile(supabase, options.bucket, file, options.pathPrefix)
  }

  const existing = formData.get(urlField)?.toString().trim()
  return { url: existing || null }
}
