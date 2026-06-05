import { unstable_cache } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  DEFAULT_ABOUT,
  DEFAULT_BRANDING,
  DEFAULT_CONTACT,
  DEFAULT_HERO,
  DEFAULT_BLOG,
  DEFAULT_LOGOS,
  DEFAULT_PORTFOLIO,
  DEFAULT_SERVICES,
  DEFAULT_SERVICES_PAGE,
  DEFAULT_STATS,
  parseSetting,
} from "./fallbacks"
import { CMS_TAGS } from "./types"
import type {
  AboutContent,
  ContactContent,
  HeroContent,
  ServicesPageContent,
  SiteBlogPost,
  SiteBranding,
  SiteClientLogo,
  SitePortfolio,
  SiteService,
  SiteTeamMember,
  StatsContent,
} from "./types"

async function fetchSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle()
    if (!data?.value) return fallback
    return parseSetting(data.value, fallback)
  } catch {
    return fallback
  }
}

async function fetchServices(featuredOnly = false): Promise<SiteService[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("site_services").select("*").eq("status", "published").order("sort_order")
    if (featuredOnly) query = query.eq("is_featured", true)
    const { data } = await query
    if (!data?.length) return featuredOnly ? DEFAULT_SERVICES : DEFAULT_SERVICES
    return data.map(normalizeService)
  } catch {
    return DEFAULT_SERVICES
  }
}

async function fetchPortfolio(): Promise<SitePortfolio[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("site_portfolio")
      .select("*")
      .eq("status", "published")
      .order("sort_order")
    if (!data?.length) return DEFAULT_PORTFOLIO
    return data.map(normalizePortfolio)
  } catch {
    return DEFAULT_PORTFOLIO
  }
}

async function fetchBlogPosts(): Promise<SiteBlogPost[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("site_blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
    if (!data?.length) return DEFAULT_BLOG
    return data.map(normalizeBlogPost)
  } catch {
    return DEFAULT_BLOG
  }
}

async function fetchTeam(): Promise<SiteTeamMember[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("site_team_members")
      .select("*")
      .eq("status", "published")
      .order("sort_order")
    return (data ?? []).map(normalizeTeamMember)
  } catch {
    return []
  }
}

async function fetchLogos(): Promise<SiteClientLogo[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("site_client_logos")
      .select("*")
      .eq("status", "published")
      .order("sort_order")
    if (!data?.length) return DEFAULT_LOGOS
    return data as SiteClientLogo[]
  } catch {
    return DEFAULT_LOGOS
  }
}

function normalizeService(row: Record<string, unknown>): SiteService {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    icon: String(row.icon ?? "Code"),
    color_gradient: String(row.color_gradient ?? "from-blue-500 to-cyan-500"),
    sort_order: Number(row.sort_order ?? 0),
    status: row.status as SiteService["status"],
    is_featured: Boolean(row.is_featured),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  }
}

function normalizePortfolio(row: Record<string, unknown>): SitePortfolio {
  return {
    id: String(row.id),
    title: String(row.title),
    category: String(row.category),
    description: String(row.description),
    image_url: row.image_url ? String(row.image_url) : null,
    technologies: Array.isArray(row.technologies) ? (row.technologies as string[]) : [],
    project_url: row.project_url ? String(row.project_url) : null,
    github_url: row.github_url ? String(row.github_url) : null,
    sort_order: Number(row.sort_order ?? 0),
    status: row.status as SitePortfolio["status"],
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  }
}

function normalizeBlogPost(row: Record<string, unknown>): SiteBlogPost {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    content: String(row.content ?? ""),
    category: String(row.category ?? "General"),
    author_name: String(row.author_name ?? "APPRIC Team"),
    read_time: String(row.read_time ?? "5 min read"),
    image_url: row.image_url ? String(row.image_url) : null,
    status: row.status as SiteBlogPost["status"],
    published_at: row.published_at ? String(row.published_at) : null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  }
}

function normalizeTeamMember(row: Record<string, unknown>): SiteTeamMember {
  return {
    id: String(row.id),
    name: String(row.name),
    role: String(row.role),
    bio: String(row.bio ?? ""),
    image_url: row.image_url ? String(row.image_url) : null,
    sort_order: Number(row.sort_order ?? 0),
    status: row.status as SiteTeamMember["status"],
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  }
}

export const getHeroContent = unstable_cache(
  () => fetchSetting<HeroContent>("hero", DEFAULT_HERO),
  ["cms-hero"],
  { tags: [CMS_TAGS.settings], revalidate: 30 }
)

export const getStatsContent = unstable_cache(
  () => fetchSetting<StatsContent>("stats", DEFAULT_STATS),
  ["cms-stats"],
  { tags: [CMS_TAGS.settings], revalidate: 30 }
)

export const getContactContent = unstable_cache(
  () => fetchSetting<ContactContent>("contact", DEFAULT_CONTACT),
  ["cms-contact"],
  { tags: [CMS_TAGS.settings], revalidate: 30 }
)

export const getAboutContent = unstable_cache(
  () => fetchSetting<AboutContent>("about", DEFAULT_ABOUT),
  ["cms-about"],
  { tags: [CMS_TAGS.settings], revalidate: 30 }
)

export const getBrandingContent = unstable_cache(
  () => fetchSetting<SiteBranding>("site_branding", DEFAULT_BRANDING),
  ["cms-branding"],
  { tags: [CMS_TAGS.settings], revalidate: 30 }
)

export const getServicesPageContent = unstable_cache(
  () => fetchSetting<ServicesPageContent>("services_page", DEFAULT_SERVICES_PAGE),
  ["cms-services-page"],
  { tags: [CMS_TAGS.settings], revalidate: 30 }
)

export const getPublishedServices = unstable_cache(
  () => fetchServices(false),
  ["cms-services-all"],
  { tags: [CMS_TAGS.services], revalidate: 30 }
)

export const getFeaturedServices = unstable_cache(
  () => fetchServices(true),
  ["cms-services-featured"],
  { tags: [CMS_TAGS.services], revalidate: 30 }
)

export const getPublishedPortfolio = unstable_cache(
  fetchPortfolio,
  ["cms-portfolio"],
  { tags: [CMS_TAGS.portfolio], revalidate: 30 }
)

export const getPublishedBlogPosts = unstable_cache(
  fetchBlogPosts,
  ["cms-blog"],
  { tags: [CMS_TAGS.blog], revalidate: 30 }
)

export const getPublishedTeam = unstable_cache(
  fetchTeam,
  ["cms-team"],
  { tags: [CMS_TAGS.team], revalidate: 30 }
)

export const getPublishedLogos = unstable_cache(
  fetchLogos,
  ["cms-logos"],
  { tags: [CMS_TAGS.logos], revalidate: 30 }
)

// Admin: fetch all content including drafts (no cache)
export async function getAdminCmsData() {
  const supabase = await createClient()

  const [settingsRes, servicesRes, portfolioRes, blogRes, teamRes, logosRes] = await Promise.all([
    supabase.from("site_settings").select("*").order("key"),
    supabase.from("site_services").select("*").order("sort_order"),
    supabase.from("site_portfolio").select("*").order("sort_order"),
    supabase.from("site_blog_posts").select("*").order("created_at", { ascending: false }),
    supabase.from("site_team_members").select("*").order("sort_order"),
    supabase.from("site_client_logos").select("*").order("sort_order"),
  ])

  const settingsMap: Record<string, Record<string, unknown>> = {}
  for (const row of settingsRes.data ?? []) {
    settingsMap[row.key] = row.value as Record<string, unknown>
  }

  return {
    hero: parseSetting(settingsMap.hero, DEFAULT_HERO),
    stats: parseSetting(settingsMap.stats, DEFAULT_STATS),
    contact: parseSetting(settingsMap.contact, DEFAULT_CONTACT),
    about: parseSetting(settingsMap.about, DEFAULT_ABOUT),
    branding: parseSetting(settingsMap.site_branding, DEFAULT_BRANDING),
    servicesPage: parseSetting(settingsMap.services_page, DEFAULT_SERVICES_PAGE),
    services: (servicesRes.data ?? []).map(normalizeService),
    portfolio: (portfolioRes.data ?? []).map(normalizePortfolio),
    blogPosts: (blogRes.data ?? []).map(normalizeBlogPost),
    team: (teamRes.data ?? []).map(normalizeTeamMember),
    logos: (logosRes.data ?? []) as SiteClientLogo[],
  }
}
