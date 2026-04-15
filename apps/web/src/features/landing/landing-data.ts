import { MoonIcon, SparkIcon, SunIcon } from "./components/landing-icons";

export const navItems = [
  { href: "#collections", label: "Recipes", active: true },
  { href: "#sous-chef", label: "Techniques", active: false },
  { href: "#planner", label: "Editorial", active: false },
  { href: "#footer", label: "Boutique", active: false }
] as const;

export const collections = [
  {
    title: "Summer Harvest: Provence",
    description: "12 curated recipes for al fresco dining.",
    label: "Seasonal Focus",
    credit: "Featured collection",
    href: "#planner",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCXfJmfitlFf87ytn-XcqJgBckThp1RoNd8ev7BUZDVbbVvOlMFrBIaz1XBvrPQTIAbG1gG22RWW8X2wt2q7YoY0zwR1E2LxuJ3P9pIgPym2ZQnGCxaRJQnWZ2aj_Vh6dPxZi6Cw5BoVBgTgykHDqZeQ9yh_vlFJ5G-MKh42Ipj9QdB7Nm_ErLJUhhtfkBRlWUbaCUOt6UH9ljVto1fpWFPZTMr1yaB_LgHhVC_0dJp9N9oPiWkcunjpnVZQv4voCXmiyU7Y3X894Sc",
    alt: "A Mediterranean feast arranged across a dark wooden table with shared dishes and warm sunlight.",
    variant: "feature"
  },
  {
    title: "The Botanical Table",
    description: "by Elena Rostova",
    href: "#sous-chef",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBmid3Mbe0KeYiH2jEsyy3PjySykoTtALj2M5RbmxM__xL6MSbVbah9AY0uRQO3EIqxZ4k5169Ul8DtYuMbolh7aVCB3yq_ayPWcmp9W8PyT0pBiT5vKJtJ-qXNEgpezVM7wgym-l6Bpdt4mxrnRuIKNAxH61M9tEN6ichKFm-xjSXCM3z0BGwF-WBKyCQqZaWiIaAj3fzSKgdVEdDW4v09v2aXGpnMm3qFeeGED_pvqJgCAYXT2-APdNMvfS5uQii1T5o4oD6yJDzf",
    alt: "A fresh green salad with edible flowers and citrus vinaigrette in a ceramic bowl.",
    variant: "small"
  },
  {
    title: "Technique: Fire & Embers",
    description: "by Marcus Thorne",
    href: "#sous-chef",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC3dMTZRVeOWyDXbF5j_AB5KEuW4zrFMLwyOtAVSDgrAmzBABKgmAOru7Ka4EfjuYwYxGkGRdBo-yrGXH05UOkxk10AZdYzwBSjtYQHdSzYgTzVr6b_IaBBZ-s1XEw_VrQ6EueqBwDf8Es1WzpKiwl2sla76pBD9ztDX0p9G3LICX39cIXRhBMqJs5ZprjReRkqev-U68gCfcaFutQrL8vQzSnsoss-BSZ7U4mUM-xuiJpb5r7ThYS8KSkHOCYOI3UUEDvHGA08z1Bg",
    alt: "A chef plating a refined dish in a high-end kitchen.",
    variant: "small"
  },
  {
    title: "Patisserie Mastery",
    description: "Unlock the secrets of chocolate tempering.",
    href: "#planner",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDj4KxaCOycBvG5Qh_5bq6iEK4BMI2Oh0jIKaL-XYUlSlEAXbH2ZmhSgT3II59UacSxcq2ccQlsq6rdRgacyL0MhKHvGEE6SQ_5yl36NnP6ocMv512ro2oIUatnBTu942Qw2POwDmFyA408adv4-W1XWWVwoPyytSnoNjA-0wKu_uz_o2p0Xfe3zF1n3SmZ1Wq9zaHh9lXQgJ4jE0JL2Ux6VoNnwxWKHydSGWuq87uiyhHY5DH1TuAqaa42KRuVRTMpb3lzizSP0yTF",
    alt: "A plated chocolate dessert with hazelnut textures and warm highlights.",
    variant: "wide"
  }
] as const;

export const kitchenFeatures = [
  "Flavor profile mapping based on 200+ global cuisines.",
  "Automatic grocery ordering from boutique suppliers.",
  "Real-time technique coaching via voice interface."
] as const;

export const promoFeatures = [
  "Curated editorial plans that adapt to your pantry and schedule.",
  "Copper-precision guidance for technique, timing, and plating.",
  "Seasonal menus, shopping lists, and tasting notes in one flow."
] as const;

export const plannerDays = [
  { day: "Mon", date: "12", tone: "muted" },
  { day: "Tue", date: "13", tone: "default" },
  { day: "Wed", date: "14", tone: "default" },
  { day: "Thu", date: "15", tone: "active" },
  { day: "Fri", date: "16", tone: "default" },
  { day: "Sat", date: "17", tone: "default" },
  { day: "Sun", date: "18", tone: "default" }
] as const;

export const mealColumns = [
  {
    label: "Breakfast",
    icon: SunIcon,
    accent: "text-hearth-accent",
    cardTitle: "Avocado & Poached Heirloom",
    cardMeta: "15 mins • 340 kcal",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqoRBGuALF7tJi8O4sb0AT1arUnzAC_f89bKt8q-Fi1gzI3CxMvExv4c669bzVXLcocOHmCVLZ-UOQc81zRDF-Gcj1uSQCH5OI4nBz7WxOeWlBaI0q02I2qW4lND4LxVdWQNbYLEhEm-aZPMEHpfBf3DucZh7C3RFMNbczSkGKa12wWD_Y_2ekidPNExFrzyt0zL4UfpffDMqq8QwHggAXM77XesIwVJs49Kr9y6dcr3SEarVay1PbFMeQpe9g_B5gizSJUWB52xix",
    alt: "Avocado toast with a poached egg served on rustic bread."
  },
  {
    label: "Lunch",
    icon: SparkIcon,
    accent: "text-hearth-accent",
    cardTitle: "The Roasted Hearth Bowl",
    cardMeta: "10 mins • 480 kcal",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCA683HJBHmdA9JFQeWhSr8A9nY7tKyI4xHdPnC44pqSS16TKd7mJIjOfHhTlQvdobgC0VXOBjLvMo3SddQCLFlMg_k1anAGahCUyMwMfLotxjtEnx-vXSv4w2pMueplZj3uevcBMSPuaATChlImD_23qd-0UDTVd9c9DU_oPsvyAjzWPouzXNFKBAWznQF8DBrSi0Z_G0Z_12wLs5pD9Biz5Q6gQtgjGuplquVMQrG6ERP1OhqJmkZVd110e0UnqFI0eOiZLLbxcDZ",
    alt: "A seasonal bowl with grains, vegetables, and tahini dressing."
  }
] as const;

export const footerLinks = [
  { label: "The Manifesto", href: "#collections" },
  { label: "Privacy", href: "#promo" },
  { label: "Contact", href: "mailto:hello@cookiful.com" },
  { label: "Press Kit", href: "#sous-chef" }
] as const;
