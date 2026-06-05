"use client"

import { useState, useTransition } from "react"
import { Loader2, Trash2, Plus, Globe, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ImageUploadField } from "@/components/dashboard/image-upload-field"
import { CMS_ICON_OPTIONS } from "@/lib/cms/icons"
import {
  updateSiteSetting,
  upsertService,
  deleteService,
  upsertPortfolioItem,
  deletePortfolioItem,
  upsertBlogPost,
  deleteBlogPost,
  upsertTeamMember,
  deleteTeamMember,
  upsertClientLogo,
  deleteClientLogo,
} from "@/actions/cms"
import type {
  AboutContent,
  ContactContent,
  HeroContent,
  SiteBlogPost,
  SiteBranding,
  SiteClientLogo,
  SitePortfolio,
  SiteService,
  SiteTeamMember,
  ServicesPageContent,
  StatsContent,
} from "@/lib/cms/types"

interface CmsClientProps {
  data: {
    hero: HeroContent
    stats: StatsContent
    contact: ContactContent
    about: AboutContent
    branding: SiteBranding
    servicesPage: ServicesPageContent
    services: SiteService[]
    portfolio: SitePortfolio[]
    blogPosts: SiteBlogPost[]
    team: SiteTeamMember[]
    logos: SiteClientLogo[]
  }
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "published" ? "default" : status === "draft" ? "secondary" : "outline"
  return <Badge variant={variant}>{status}</Badge>
}

export function CmsClient({ data }: CmsClientProps) {
  const [isPending, startTransition] = useTransition()
  const [hero, setHero] = useState(data.hero)
  const [stats, setStats] = useState(data.stats)
  const [contact, setContact] = useState(data.contact)
  const [branding, setBranding] = useState(data.branding)

  const saveSetting = (key: string, value: Record<string, unknown>, label: string) => {
    startTransition(async () => {
      const result = await updateSiteSetting(key, value)
      if (result.error) toast.error(result.error)
      else toast.success(`${label} saved — website updated live`)
    })
  }

  const handleDelete = (fn: (id: string) => Promise<{ error?: string; success?: boolean }>, id: string, label: string) => {
    if (!confirm(`Delete this ${label}?`)) return
    startTransition(async () => {
      const result = await fn(id)
      if (result.error) toast.error(result.error)
      else toast.success(`${label} deleted`)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Website CMS
          </h1>
          <p className="text-muted-foreground">
            Manage public website content. Changes publish instantly with real-time sync.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 text-green-500" />
          Live updates enabled
        </div>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="hero">Hero & Stats</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="logos">Client Logos</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Hero</CardTitle>
              <CardDescription>Main headline and call-to-action on the homepage</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 max-w-2xl">
              {(
                [
                  ["badge", "Badge text"],
                  ["headline", "Headline"],
                  ["headlineHighlight", "Highlighted text"],
                  ["subheadline", "Subheadline"],
                  ["primaryCtaLabel", "Primary button label"],
                  ["primaryCtaHref", "Primary button link"],
                  ["secondaryCtaLabel", "Secondary button label"],
                  ["secondaryCtaHref", "Secondary button link"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    value={hero[key]}
                    onChange={(e) => setHero({ ...hero, [key]: e.target.value })}
                  />
                </div>
              ))}
              <Button disabled={isPending} onClick={() => saveSetting("hero", hero as unknown as Record<string, unknown>, "Hero")}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Hero
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Homepage Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              {stats.items.map((item, i) => (
                <div key={i} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Number</Label>
                    <Input
                      value={item.number}
                      onChange={(e) => {
                        const items = [...stats.items]
                        items[i] = { ...items[i], number: e.target.value }
                        setStats({ items })
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={item.label}
                      onChange={(e) => {
                        const items = [...stats.items]
                        items[i] = { ...items[i], label: e.target.value }
                        setStats({ items })
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button disabled={isPending} onClick={() => saveSetting("stats", stats as unknown as Record<string, unknown>, "Stats")}>
                Save Statistics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Site Branding</CardTitle>
              <CardDescription>Company name and taglines used across the website</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 max-w-2xl">
              {(
                [
                  ["companyName", "Company name"],
                  ["tagline", "Tagline"],
                  ["footerText", "Footer description"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  {key === "footerText" ? (
                    <Textarea
                      value={branding[key]}
                      onChange={(e) => setBranding({ ...branding, [key]: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={branding[key]}
                      onChange={(e) => setBranding({ ...branding, [key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
              <Button
                disabled={isPending}
                onClick={() => saveSetting("site_branding", branding as unknown as Record<string, unknown>, "Branding")}
              >
                Save Branding
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <ContentList
            title="Services"
            description="Manage services shown on /services and homepage preview"
            items={data.services}
            renderItem={(s) => (
              <ServiceForm key={s.id} service={s} isPending={isPending} onDelete={() => handleDelete(deleteService, s.id, "service")} />
            )}
            newForm={<ServiceForm isPending={isPending} />}
          />
        </TabsContent>

        <TabsContent value="portfolio">
          <ContentList
            title="Portfolio"
            description="Showcase projects on /portfolio"
            items={data.portfolio}
            renderItem={(p) => (
              <PortfolioForm key={p.id} item={p} isPending={isPending} onDelete={() => handleDelete(deletePortfolioItem, p.id, "project")} />
            )}
            newForm={<PortfolioForm isPending={isPending} />}
          />
        </TabsContent>

        <TabsContent value="blog">
          <ContentList
            title="Blog Posts"
            description="Public blog articles on /blog"
            items={data.blogPosts}
            renderItem={(b) => (
              <BlogForm key={b.id} post={b} isPending={isPending} onDelete={() => handleDelete(deleteBlogPost, b.id, "post")} />
            )}
            newForm={<BlogForm isPending={isPending} />}
          />
        </TabsContent>

        <TabsContent value="team">
          <ContentList
            title="Team Members"
            description="Team section on /about"
            items={data.team}
            renderItem={(m) => (
              <TeamForm key={m.id} member={m} isPending={isPending} onDelete={() => handleDelete(deleteTeamMember, m.id, "member")} />
            )}
            newForm={<TeamForm isPending={isPending} />}
          />
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 max-w-2xl">
              {(
                [
                  ["heading", "Page heading"],
                  ["subheading", "Page subheading"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["address", "Address"],
                  ["mapUrl", "Google Maps link"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    value={contact[key] ?? ""}
                    onChange={(e) => setContact({ ...contact, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label>Business hours — Mon–Fri</Label>
                <Input
                  value={contact.businessHours?.weekdays ?? contact.hours}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      hours: e.target.value,
                      businessHours: {
                        weekdays: e.target.value,
                        saturday: contact.businessHours?.saturday ?? "10:00 AM - 4:00 PM",
                        sunday: contact.businessHours?.sunday ?? "Closed",
                      },
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Saturday</Label>
                  <Input
                    value={contact.businessHours?.saturday ?? ""}
                    onChange={(e) =>
                      setContact({
                        ...contact,
                        businessHours: {
                          weekdays: contact.businessHours?.weekdays ?? contact.hours,
                          saturday: e.target.value,
                          sunday: contact.businessHours?.sunday ?? "Closed",
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sunday</Label>
                  <Input
                    value={contact.businessHours?.sunday ?? ""}
                    onChange={(e) =>
                      setContact({
                        ...contact,
                        businessHours: {
                          weekdays: contact.businessHours?.weekdays ?? contact.hours,
                          saturday: contact.businessHours?.saturday ?? "10:00 AM - 4:00 PM",
                          sunday: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <Button
                disabled={isPending}
                onClick={() => saveSetting("contact", contact as unknown as Record<string, unknown>, "Contact")}
              >
                Save Contact Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logos">
          <ContentList
            title="Client Logos"
            description="Trusted-by section on homepage"
            items={data.logos}
            renderItem={(l) => (
              <LogoForm key={l.id} logo={l} isPending={isPending} onDelete={() => handleDelete(deleteClientLogo, l.id, "logo")} />
            )}
            newForm={<LogoForm isPending={isPending} />}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ContentList<T extends { id: string }>({
  title,
  description,
  items,
  renderItem,
  newForm,
}: {
  title: string
  description: string
  items: T[]
  renderItem: (item: T) => React.ReactNode
  newForm: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {items.map(renderItem)}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add New
          </CardTitle>
        </CardHeader>
        <CardContent>{newForm}</CardContent>
      </Card>
    </div>
  )
}

function ServiceForm({
  service,
  isPending,
  onDelete,
}: {
  service?: SiteService
  isPending: boolean
  onDelete?: () => void
}) {
  const [, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await upsertService(fd)
      if (result.error) toast.error(result.error)
      else toast.success(service ? "Service updated" : "Service created")
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{service?.title ?? "New Service"}</CardTitle>
          {service && <StatusBadge status={service.status} />}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3">
          {service && <input type="hidden" name="id" value={service.id} />}
          <Input name="title" placeholder="Title" defaultValue={service?.title} required />
          <Textarea name="description" placeholder="Description" defaultValue={service?.description} rows={2} required />
          <Textarea name="features" placeholder="Features (one per line)" defaultValue={service?.features.join("\n")} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Icon</Label>
              <select
                name="icon"
                defaultValue={service?.icon ?? "Code"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CMS_ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Color gradient</Label>
              <Input name="color_gradient" defaultValue={service?.color_gradient ?? "from-blue-500 to-cyan-500"} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Sort order</Label>
              <Input name="sort_order" type="number" defaultValue={service?.sort_order ?? 0} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                name="status"
                defaultValue={service?.status ?? "published"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                name="is_featured"
                value="true"
                defaultChecked={service?.is_featured ?? false}
                className="h-4 w-4"
              />
              <Label>Featured on home</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {service ? "Update" : "Create"}
            </Button>
            {onDelete && (
              <Button type="button" size="sm" variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function PortfolioForm({ item, isPending, onDelete }: { item?: SitePortfolio; isPending: boolean; onDelete?: () => void }) {
  const [, startTransition] = useTransition()
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await upsertPortfolioItem(new FormData(e.currentTarget))
      if (result.error) toast.error(result.error)
      else toast.success(item ? "Project updated" : "Project created")
    })
  }
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{item?.title ?? "New Project"}</CardTitle>
          {item && <StatusBadge status={item.status} />}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3">
          {item && <input type="hidden" name="id" value={item.id} />}
          <Input name="title" placeholder="Title" defaultValue={item?.title} required />
          <Input name="category" placeholder="Category" defaultValue={item?.category ?? "Web Development"} />
          <Textarea name="description" placeholder="Description" defaultValue={item?.description} rows={2} />
          <ImageUploadField label="Project image" defaultUrl={item?.image_url} />
          <Textarea name="technologies" placeholder="Technologies (one per line)" defaultValue={item?.technologies.join("\n")} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Input name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} />
            <select
              name="status"
              defaultValue={item?.status ?? "published"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>{item ? "Update" : "Create"}</Button>
            {onDelete && <Button type="button" size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function BlogForm({ post, isPending, onDelete }: { post?: SiteBlogPost; isPending: boolean; onDelete?: () => void }) {
  const [, startTransition] = useTransition()
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await upsertBlogPost(new FormData(e.currentTarget))
      if (result.error) toast.error(result.error)
      else toast.success(post ? "Post updated" : "Post created")
    })
  }
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{post?.title ?? "New Blog Post"}</CardTitle>
          {post && <StatusBadge status={post.status} />}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3">
          {post && <input type="hidden" name="id" value={post.id} />}
          <Input name="title" placeholder="Title" defaultValue={post?.title} required />
          <Input name="slug" placeholder="Slug (auto-generated if empty)" defaultValue={post?.slug ?? ""} />
          <Textarea name="excerpt" placeholder="Excerpt" defaultValue={post?.excerpt ?? ""} rows={2} />
          <Textarea name="content" placeholder="Full content" defaultValue={post?.content} rows={4} />
          <div className="grid grid-cols-2 gap-3">
            <Input name="category" placeholder="Category" defaultValue={post?.category ?? "General"} />
            <Input name="author_name" placeholder="Author" defaultValue={post?.author_name ?? "APPRIC Team"} />
          </div>
          <ImageUploadField label="Cover image" defaultUrl={post?.image_url} />
          <select
            name="status"
            defaultValue={post?.status ?? "draft"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>{post ? "Update" : "Create"}</Button>
            {onDelete && <Button type="button" size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function TeamForm({ member, isPending, onDelete }: { member?: SiteTeamMember; isPending: boolean; onDelete?: () => void }) {
  const [, startTransition] = useTransition()
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await upsertTeamMember(new FormData(e.currentTarget))
      if (result.error) toast.error(result.error)
      else toast.success(member ? "Member updated" : "Member added")
    })
  }
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{member?.name ?? "New Team Member"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3">
          {member && <input type="hidden" name="id" value={member.id} />}
          <Input name="name" placeholder="Name" defaultValue={member?.name} required />
          <Input name="role" placeholder="Role" defaultValue={member?.role} required />
          <Textarea name="bio" placeholder="Bio" defaultValue={member?.bio} rows={2} />
          <ImageUploadField label="Photo" defaultUrl={member?.image_url} />
          <Input name="sort_order" type="number" defaultValue={member?.sort_order ?? 0} />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>{member ? "Update" : "Create"}</Button>
            {onDelete && <Button type="button" size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function LogoForm({ logo, isPending, onDelete }: { logo?: SiteClientLogo; isPending: boolean; onDelete?: () => void }) {
  const [, startTransition] = useTransition()
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await upsertClientLogo(new FormData(e.currentTarget))
      if (result.error) toast.error(result.error)
      else toast.success(logo ? "Logo updated" : "Logo added")
    })
  }
  return (
    <form onSubmit={handleSubmit} className="grid gap-3 max-w-md">
      {logo && <input type="hidden" name="id" value={logo.id} />}
      <Input name="name" placeholder="Company name" defaultValue={logo?.name} required />
      <ImageUploadField
        label="Logo image"
        urlFieldName="logo_url"
        defaultUrl={logo?.logo_url}
        urlPlaceholder="Or paste logo URL"
      />
      <Input name="sort_order" type="number" defaultValue={logo?.sort_order ?? 0} className="w-24" />
      <Button type="submit" size="sm" disabled={isPending}>{logo ? "Update" : "Add"}</Button>
      {onDelete && <Button type="button" size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>}
    </form>
  )
}
