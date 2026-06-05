"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { updateProfile, uploadAvatar } from "@/actions/employees"
import { getRoleLabel, getRoleBadgeVariant } from "@/lib/auth/roles"
import type { Profile } from "@/types/database.types"
import { formatDate } from "@/lib/dashboard/utils"
import { dispatchAvatarUpdated } from "@/lib/events"

interface ProfileClientProps {
  profile: Profile
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAvatarPending, startAvatarTransition] = useTransition()
  const [isProfilePending, startProfileTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const initials = (profile.full_name ?? profile.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const displayAvatar = previewUrl ?? avatarUrl ?? undefined

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setSelectedFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleAvatarSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const file = selectedFile ?? fileRef.current?.files?.[0]
    if (!file) {
      toast.error("Please choose an image first")
      return
    }

    const formData = new FormData()
    formData.set("avatar", file)

    startAvatarTransition(async () => {
      const result = await uploadAvatar(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }

      const url = result.url ?? null
      setAvatarUrl(url)
      setSelectedFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      if (fileRef.current) fileRef.current.value = ""

      dispatchAvatarUpdated(url)
      toast.success("Avatar uploaded successfully")
      router.refresh()
    })
  }

  const handleUpdate = (formData: FormData) => {
    startProfileTransition(async () => {
      const result = await updateProfile(formData)
      if (result.error) toast.error(result.error)
      else toast.success("Profile updated")
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={displayAvatar} alt={profile.full_name ?? ""} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{profile.full_name}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <Badge variant={getRoleBadgeVariant(profile.role)} className="mt-1">
              {getRoleLabel(profile.role)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Avatar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a profile photo (JPEG, PNG, WebP, or GIF, max 5 MB). Stored in Supabase
            Storage and shown in the dashboard and public site header.
          </p>
          <form onSubmit={handleAvatarSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="avatar">Profile photo</Label>
              <Input
                ref={fileRef}
                id="avatar"
                type="file"
                name="avatar"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="text-sm"
                onChange={handleFileChange}
                disabled={isAvatarPending}
              />
            </div>
            <Button type="submit" size="sm" disabled={isAvatarPending || !selectedFile}>
              {isAvatarPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isAvatarPending ? "Uploading…" : "Upload avatar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" defaultValue={profile.full_name ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" name="designation" defaultValue={profile.designation ?? ""} />
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <p>Employee ID: {profile.employee_id ?? "—"}</p>
              <p>Department ID: {profile.department_id ?? "—"}</p>
              <p>Join Date: {profile.join_date ? formatDate(profile.join_date) : "—"}</p>
            </div>
            <Button type="submit" disabled={isProfilePending}>
              {isProfilePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
