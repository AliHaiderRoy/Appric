"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ImageUploadFieldProps {
  label?: string
  urlFieldName?: string
  fileFieldName?: string
  defaultUrl?: string | null
  urlPlaceholder?: string
}

export function ImageUploadField({
  label = "Image",
  urlFieldName = "image_url",
  fileFieldName = "image_file",
  defaultUrl,
  urlPlaceholder = "Or paste image URL",
}: ImageUploadFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="file" name={fileFieldName} accept="image/*" className="text-sm" />
      <Input
        name={urlFieldName}
        placeholder={urlPlaceholder}
        defaultValue={defaultUrl ?? ""}
      />
      {defaultUrl ? (
        <p className="text-xs text-muted-foreground truncate">Current: {defaultUrl}</p>
      ) : null}
    </div>
  )
}
