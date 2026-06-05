import {
  Award,
  Brain,
  Cloud,
  Code,
  Database,
  Palette,
  Shield,
  Smartphone,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Smartphone,
  Palette,
  Brain,
  Database,
  Cloud,
  Shield,
  Zap,
  TrendingUp,
  Award,
  Users,
}

export function getCmsIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Code
}

export const CMS_ICON_OPTIONS = Object.keys(ICON_MAP)
