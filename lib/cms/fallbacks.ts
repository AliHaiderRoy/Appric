import type {
  AboutContent,
  ContactContent,
  HeroContent,
  ServicesPageContent,
  SiteBranding,
  SiteBlogPost,
  SiteClientLogo,
  SitePortfolio,
  SiteService,
  SiteTeamMember,
  StatsContent,
} from "./types"

export const DEFAULT_HERO: HeroContent = {
  badge: "Innovative Software Solutions",
  headline: "Building the Future with",
  headlineHighlight: "Cutting-Edge Technology",
  subheadline:
    "We deliver modern, secure, and scalable digital solutions. From web development to AI integration, we transform your vision into reality.",
  primaryCtaLabel: "Get Started",
  primaryCtaHref: "/contact",
  secondaryCtaLabel: "View Our Work",
  secondaryCtaHref: "/portfolio",
}

export const DEFAULT_STATS: StatsContent = {
  items: [
    { number: "100+", label: "Projects Delivered" },
    { number: "50+", label: "Happy Clients" },
    { number: "15+", label: "Team Members" },
    { number: "5+", label: "Years Experience" },
  ],
}

export const DEFAULT_CONTACT: ContactContent = {
  email: "appric172@gmail.com",
  phone: "05811558599",
  address: "In front of CMH Main Gate, City Gilgit, Pakistan",
  hours: "Mon - Fri: 9:00 AM - 6:00 PM",
  heading: "Get in Touch",
  subheading: "Have a project in mind? Let's discuss how we can help bring your vision to life.",
  mapUrl: "https://maps.app.goo.gl/BKo5ZswJ8rFC8hzD9?g_st=am",
  businessHours: {
    weekdays: "9:00 AM - 6:00 PM",
    saturday: "10:00 AM - 4:00 PM",
    sunday: "Closed",
  },
}

export const DEFAULT_ABOUT: AboutContent = {
  missionTitle: "Our Mission",
  missionText:
    "To empower businesses with innovative software solutions that drive growth, efficiency, and digital transformation.",
  visionTitle: "Our Vision",
  visionText:
    "To be the leading software house recognized for excellence, innovation, and client success across the globe.",
  values: [
    {
      icon: "TrendingUp",
      title: "Innovation",
      description: "We embrace cutting-edge technologies and creative solutions to stay ahead of the curve.",
    },
    {
      icon: "Award",
      title: "Quality",
      description: "We deliver excellence in every project with rigorous testing and attention to detail.",
    },
    {
      icon: "Shield",
      title: "Transparency",
      description: "Open communication and honest relationships are the foundation of our work.",
    },
    {
      icon: "Users",
      title: "Client Satisfaction",
      description: "Your success is our success. We are committed to exceeding expectations.",
    },
  ],
}

export const DEFAULT_BRANDING: SiteBranding = {
  companyName: "APPRIC",
  tagline: "Innovative Software Solutions",
  footerText:
    "Building the future with cutting-edge technology. Your trusted partner for digital transformation.",
}

export const DEFAULT_SERVICES_PAGE: ServicesPageContent = {
  heading: "Our Services",
  subheading:
    "Comprehensive software solutions tailored to your business needs. From concept to deployment, we deliver excellence at every stage.",
}

export const DEFAULT_SERVICES: SiteService[] = [
  {
    id: "fallback-1",
    title: "Web Development",
    description: "Modern, responsive websites built with Next.js, React, and cutting-edge technologies.",
    features: ["Next.js & React", "Responsive Design", "SEO Optimization", "Performance Tuning"],
    icon: "Code",
    color_gradient: "from-blue-500 to-cyan-500",
    sort_order: 1,
    status: "published",
    is_featured: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-2",
    title: "Mobile Development",
    description: "Native and cross-platform mobile applications that deliver seamless user experiences.",
    features: ["iOS & Android", "Cross-Platform", "Native Performance", "Push Notifications"],
    icon: "Smartphone",
    color_gradient: "from-cyan-500 to-teal-500",
    sort_order: 2,
    status: "published",
    is_featured: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-3",
    title: "UI/UX Design",
    description: "Beautiful, intuitive designs that engage users and drive conversions.",
    features: ["User Research", "Wireframing", "Prototyping", "Design Systems"],
    icon: "Palette",
    color_gradient: "from-teal-500 to-green-500",
    sort_order: 3,
    status: "published",
    is_featured: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-4",
    title: "AI & Automation",
    description: "Intelligent solutions powered by machine learning and artificial intelligence.",
    features: ["Machine Learning", "NLP Integration", "Process Automation", "Data Analysis"],
    icon: "Brain",
    color_gradient: "from-green-500 to-blue-500",
    sort_order: 4,
    status: "published",
    is_featured: true,
    created_at: "",
    updated_at: "",
  },
]

export const DEFAULT_PORTFOLIO: SitePortfolio[] = [
  {
    id: "fallback-portfolio-1",
    title: "E-Commerce Platform",
    category: "Web Development",
    description: "Modern online shopping platform with real-time inventory and secure payment processing.",
    image_url: "/modern-ecommerce-platform.jpg",
    technologies: ["Next.js", "MongoDB", "Stripe", "Tailwind CSS"],
    project_url: null,
    github_url: null,
    sort_order: 1,
    status: "published",
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-portfolio-2",
    title: "Fitness Tracking App",
    category: "Mobile Apps",
    description: "Cross-platform mobile app for tracking workouts, nutrition, and health metrics.",
    image_url: "/fitness-mobile-app-interface.png",
    technologies: ["React Native", "Node.js", "MongoDB", "Firebase"],
    project_url: null,
    github_url: null,
    sort_order: 2,
    status: "published",
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-portfolio-3",
    title: "SaaS Dashboard",
    category: "UI/UX Design",
    description: "Clean, intuitive dashboard design for a B2B analytics platform.",
    image_url: "/saas-analytics-dashboard.png",
    technologies: ["Figma", "React", "D3.js", "Material UI"],
    project_url: null,
    github_url: null,
    sort_order: 3,
    status: "published",
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-portfolio-4",
    title: "AI Chatbot Platform",
    category: "AI Solutions",
    description: "Intelligent chatbot system with natural language processing and sentiment analysis.",
    image_url: "/ai-chatbot-interface.png",
    technologies: ["Python", "TensorFlow", "React", "WebSocket"],
    project_url: null,
    github_url: null,
    sort_order: 4,
    status: "published",
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-portfolio-5",
    title: "Real Estate Portal",
    category: "Web Development",
    description: "Property listing platform with advanced search filters and virtual tours.",
    image_url: "/real-estate-website-hero.png",
    technologies: ["Next.js", "PostgreSQL", "Google Maps API", "AWS"],
    project_url: null,
    github_url: null,
    sort_order: 5,
    status: "published",
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-portfolio-6",
    title: "Healthcare App",
    category: "Mobile Apps",
    description: "Telemedicine platform connecting patients with healthcare providers.",
    image_url: "/healthcare-mobile-app.png",
    technologies: ["React Native", "Node.js", "PostgreSQL", "Twilio"],
    project_url: null,
    github_url: null,
    sort_order: 6,
    status: "published",
    created_at: "",
    updated_at: "",
  },
]

export const DEFAULT_BLOG: SiteBlogPost[] = [
  {
    id: "fallback-blog-1",
    title: "The Future of Web Development: Next.js 15 and Beyond",
    slug: "nextjs-15-future",
    excerpt: "Exploring the latest features in Next.js 15 and what they mean for modern web applications.",
    content:
      "Next.js continues to evolve with server components, improved caching, and better developer experience. In this post we explore what is new and how teams can adopt these features in production.",
    category: "Web Development",
    author_name: "Alex Chen",
    read_time: "8 min read",
    image_url: "/nextjs-code-editor.jpg",
    status: "published",
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-blog-2",
    title: "Building Cross-Platform Apps with React Native",
    slug: "react-native-cross-platform",
    excerpt: "A comprehensive guide to creating seamless mobile experiences using React Native.",
    content:
      "React Native enables teams to ship iOS and Android apps from a single codebase. We cover architecture, performance, and deployment best practices.",
    category: "Mobile",
    author_name: "Sarah Johnson",
    read_time: "10 min read",
    image_url: "/mobile-app-development.jpg",
    status: "published",
    published_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-blog-3",
    title: "AI Integration in Modern Applications",
    slug: "ai-integration-modern-apps",
    excerpt: "How to leverage artificial intelligence to create smarter, more intuitive applications.",
    content:
      "From LLM APIs to custom models, AI is reshaping product development. Learn practical integration patterns for enterprise applications.",
    category: "AI & ML",
    author_name: "Michael Brown",
    read_time: "12 min read",
    image_url: "/ai-neural-network.jpg",
    status: "published",
    published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-blog-4",
    title: "Design Systems: Creating Consistent UI at Scale",
    slug: "design-systems-at-scale",
    excerpt: "Building and maintaining design systems that scale with your organization.",
    content:
      "Design tokens, component libraries, and documentation are the pillars of a successful design system. Here is how we approach it at APPRIC.",
    category: "Design",
    author_name: "Emily Davis",
    read_time: "7 min read",
    image_url: "/design-system-components.jpg",
    status: "published",
    published_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: "",
    updated_at: "",
  },
]
export const DEFAULT_TEAM: SiteTeamMember[] = []
export const DEFAULT_LOGOS: SiteClientLogo[] = [
  { id: "1", name: "Acme Corp", logo_url: null, sort_order: 1, status: "published", created_at: "" },
  { id: "2", name: "TechStart", logo_url: null, sort_order: 2, status: "published", created_at: "" },
  { id: "3", name: "InnovateLabs", logo_url: null, sort_order: 3, status: "published", created_at: "" },
  { id: "4", name: "DataFlow", logo_url: null, sort_order: 4, status: "published", created_at: "" },
]

export function parseSetting<T>(value: unknown, fallback: T): T {
  if (!value || typeof value !== "object") return fallback
  return { ...fallback, ...(value as Partial<T>) }
}
