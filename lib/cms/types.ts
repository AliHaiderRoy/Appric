export type CmsContentStatus = "draft" | "published" | "archived"

export interface HeroContent {
  badge: string
  headline: string
  headlineHighlight: string
  subheadline: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
}

export interface StatItem {
  number: string
  label: string
}

export interface StatsContent {
  items: StatItem[]
}

export interface ContactContent {
  email: string
  phone: string
  address: string
  hours: string
  heading: string
  subheading: string
  mapUrl?: string
  businessHours?: {
    weekdays: string
    saturday: string
    sunday: string
  }
}

export interface AboutValue {
  icon: string
  title: string
  description: string
}

export interface AboutContent {
  missionTitle: string
  missionText: string
  visionTitle: string
  visionText: string
  values: AboutValue[]
}

export interface SiteBranding {
  companyName: string
  tagline: string
  footerText: string
}

export interface ServicesPageContent {
  heading: string
  subheading: string
}

export interface SiteService {
  id: string
  title: string
  description: string
  features: string[]
  icon: string
  color_gradient: string
  sort_order: number
  status: CmsContentStatus
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface SitePortfolio {
  id: string
  title: string
  category: string
  description: string
  image_url: string | null
  technologies: string[]
  project_url: string | null
  github_url: string | null
  sort_order: number
  status: CmsContentStatus
  created_at: string
  updated_at: string
}

export interface SiteBlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  category: string
  author_name: string
  read_time: string
  image_url: string | null
  status: CmsContentStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface SiteTeamMember {
  id: string
  name: string
  role: string
  bio: string
  image_url: string | null
  sort_order: number
  status: CmsContentStatus
  created_at: string
  updated_at: string
}

export interface SiteClientLogo {
  id: string
  name: string
  logo_url: string | null
  sort_order: number
  status: CmsContentStatus
  created_at: string
}

export interface SiteSettingRow {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export const CMS_TAGS = {
  settings: "cms-settings",
  services: "cms-services",
  portfolio: "cms-portfolio",
  blog: "cms-blog",
  team: "cms-team",
  logos: "cms-logos",
} as const

export const CMS_PUBLIC_PATHS = ["/", "/about", "/services", "/portfolio", "/blog", "/contact"] as const
