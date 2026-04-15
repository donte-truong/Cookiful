import {
  CalendarIcon,
  HeartIcon,
  PantryIcon,
  SparkIcon,
  TimerIcon
} from "./components/home-icons";

export type HomeNavItem = {
  href: string;
  label: string;
  active?: boolean;
};

export type HomeQuickAction = {
  href: string;
  label: string;
  icon: typeof PantryIcon;
};

export type HomeRecipe = {
  title: string;
  description: string;
  duration: string;
  tag: string;
  image: string;
  alt: string;
};

export type HomeEditorialMoment = {
  title: string;
  description: string;
  icon: typeof SparkIcon;
};

export type HomeSocialStory = {
  name: string;
  role: string;
  title: string;
  quote: string;
  stat: string;
  image: string;
  imageAlt: string;
  badgeIcon: typeof HeartIcon;
  avatarImage?: string;
  avatarBrandMark?: boolean;
  avatarLetter?: string;
};

export type HomeFooterGroup = {
  title: string;
  links: Array<{
    href: string;
    label: string;
  }>;
};

export const homeNavItems: HomeNavItem[] = [
  { href: "#kitchen-lab", label: "Kitchen Lab", active: true },
  { href: "#social-hearth", label: "The Hearth" },
  { href: "#curated-feed", label: "Journal" },
  { href: "#footer", label: "Boutique" }
];

export const homeQuickActions: HomeQuickAction[] = [
  { href: "#curated-feed", label: "Use what I have", icon: PantryIcon },
  { href: "#curated-feed", label: "Meal prep for week", icon: CalendarIcon },
  { href: "#curated-feed", label: "Quick dinner", icon: TimerIcon }
];

export const curatedRecipes: HomeRecipe[] = [
  {
    title: "Pan-Seared Diver Scallops",
    description:
      "Master the art of the golden crust with this simple yet sophisticated butter-basting technique.",
    duration: "20 MIN",
    tag: "KETO",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBXE3RZO9mzmHpoxztGrqQ2Q9nbfwxhT8ewb8OukKbXyl1albLn_I9gd0hPzLChCH-bSXzavOxgsNNvkxyPjsmIW99qoTxg_tHvLaklR7UxB7BdxlSRSevl8xWDHvWbkUqTAam0A8eC2cm5FlmblDtJhWvLyqL2Vcs8D_LSF4xgP1OQzUP5hO6fCXEp1zu3xYU6HQFeUwduLBbjhmgF-85i6UhxbsHvAXhyEo9teGoYBoDN6xxBhaQTdVwgQjzchh9hqQaZsz7qgV0e",
    alt: "Close-up of seared scallops with herb butter and microgreens on a white ceramic plate."
  },
  {
    title: "Wild Ramp & Basil Pesto",
    description:
      "Hand-crushed seasonal ramps paired with cold-pressed olive oil over artisan trofie pasta.",
    duration: "45 MIN",
    tag: "VEGAN",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuATXp7pMQOmKT6f8PJymrTjDzInho5GLxdgGWo8m9EkUujqpoXcrOlSdTgUv-wTplxuZpwlk5YrThqGbNl-G_9v7yXtFiNZ8GL0DKut2kfW3kHOMwHiBG7QLjlh72y6DAl5ixRQa-K5opYO4nc7z5qPUbn__a5kgrxu7OiHklMCA86lhj3J55gI5KHRxID1Zo31pU1gWb-WUpkuZd6VdDq7uYH7ZwUUmYgz9pd0IOUpGz5uDOYlHV_qJKOwyb6m143I0htWyvozsTDV",
    alt: "Fresh pesto pasta served in a rustic terracotta bowl."
  },
  {
    title: "Crispy Skin Pan-Seared Salmon",
    description:
      "Achieve restaurant-quality crisp skin with our precision heat management guide.",
    duration: "15 MIN",
    tag: "OMEGA-3",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDl3mtLeRb4X8Zt7R8RCS8VQWk9wpgge6gsRrDRnpMhosG_V_qNkjbRSpJ8BGcuOFgkYDBmQXts0kH8DAY9vxiuBGbQ_im7IgYwqTgpvVC2do1sRXwN-M70bg9N5RnoJqXRcNgIVp5-JViL3Jj0nfM_lFJ-m5ygtXYBhCUDrQX6xlqNFDQa9nR-h77RFiCRkXU1pvdHFaZZ_mw93vNEAbb6WUdHMiFDJA-4xjjRtqU2z37nv0J2zWXJc65nmsvUnvdJ5ecBMJrZ9Y-d",
    alt: "Crisp-skinned salmon fillet resting on bright greens."
  },
  {
    title: "Wild Mushroom & Thyme Risotto",
    description:
      "A slow-stirred classic using earthy forest mushrooms and aged Arborio rice.",
    duration: "35 MIN",
    tag: "VEGETARIAN",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCwpiY9n4PjuzTWHvkxeXfGrfv-JkYjukOOcl7UI8jiC_gNlZqszgVzOcQhX_92xmsToB9uPpTecF-WvouSRRoFimnQy8_iWpHsn5cpoR244EMjUR73ueJ_zAuQYK-vviFJ5bGzx9pQDH8XHGP4470Rb5vfAmkvDBLnZSPsqGQ6ZBbiQ34C5rvSw2SbszCiQOVri_Sc4s3i3EgIs80CMvEHOMXFFagTL2WAl_6fWpueRE4wXkEynFqA-vSfwPNXlydixYCAE1SLG1Np",
    alt: "Creamy mushroom risotto garnished with parsley and shaved parmesan."
  }
];

export const editorialMoments: HomeEditorialMoment[] = [
  {
    title: "The Tuesday Braise",
    description: "Red Wine Slow-Roasted Chicken using your Cabernet remnants.",
    icon: SparkIcon
  },
  {
    title: "Wednesday Bistro Night",
    description: "Confit Duck Legs with the rosemary from your garden.",
    icon: CalendarIcon
  },
  {
    title: "The Thursday Crust",
    description: "Sourdough Focaccia using the starter we fed yesterday.",
    icon: PantryIcon
  }
];

export const socialStories: HomeSocialStory[] = [
  {
    name: "Julian Vane",
    role: "Fermentation Specialist",
    title: "Winter Kimchi Trials",
    quote:
      '"The cold-press technique really preserves the snap of the daikon..."',
    stat: "42 others added to Kitchen Lab",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC6BFbnUJoKjuX0pGPhJWnd-AQsKYn4ydF4SoUmcrS9pQKRPMCRJrMKDpeEUr_hapJeQR8v-T_PmOa1SQp8IvYXO6gAARjBsDLU_5ToLxRebWNjCG4LOPLpCwovSuWO4l5xWiz3MENt7hsRnaXjZyK58033Rh8WjtTF8vFPSGFqlYbmWgmDS-TjeWWjiXfXqw-vdDdVNQYML5elmSjRiYaXprIyexdOM1QeKdQ9vRlIDV_jSyHEv-i8s4k_i-9P0pV1flGBL8npSvOi",
    imageAlt:
      "Glass jars filled with colorful fermented vegetables like radishes and carrots.",
    badgeIcon: HeartIcon,
    avatarImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD04hyVVIhMjOTSBL1_SxO7pbtE1DWNfTYkaThM85VAlUhU4xgBledrfY8hV12AZCHLGGcRTpSqZRYTWrFm-yPVIoABaEqdiBT_eMhrybUMjs1WmHn8M_qHBu0wBPb7M57Nq2ilTlBIYpgaNHBUh9h_PhMjRNR6QHfX8waQ2N7IoO2DcClXrL_SxcpGTN4Bu5sGis98cEnqEn_ApVmzaNpvuKavx_owgxg5JpYrOHNBerakptJGhe2Go0XBbRyrD6s1a4qzKZgPMSeg"
  },
  {
    name: "Elena Rossi",
    role: "Pasta Artisan",
    title: "Semolina Secrets",
    quote: '"Finally nailed the hydration ratio for these Orecchiette!"',
    stat: "128 others bookmarked",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD6UA4YH4B8F5OvFXKJwxSoeGTwvsi2n6On4fByHT4mAxNUC_FHSE3afGUnT0fHr5FTpLnEHAxBTe6SBfhECp328Ld-0uq612xjV2QcINP6rx9psBuODnmrEXuc6f5nD0U2_aaafXA0EjshAaFmIWIDKkUqs8qCQ0KrN3m9q3zCMw1T0OMvOXkSILQdHimr9hPbLpZwsdUPW_zX1WMGLRg-7jTYKV5J4noN78GJcv0x4Lfb_PQ1EzAVz1HKr0pRe09jqMeN1FIYa0xD",
    imageAlt: "Hand-formed orecchiette pasta resting on a flour-dusted board.",
    badgeIcon: HeartIcon,
    avatarImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDl9vXzKV7_cvfcKKa2uisC0eg47MOpPPLEHSnYRLTUt4On9QrTCm_9hWC64APK1tFegaURRmKjpfpclRsdTzCEOdOv369Qiga439u3f-sUP5H6onE_upiWEDexo683YhZE3A6-5rmFw7SznrRHLkT-qUePcX4sZE5epImAmm4kt3YfsE5s5P_gS5CaeFL10W9DOhKuaFkKn0V9tzKRrUCC0MjsEurnwO52ZjKj9CLqBxYq-tqo4a8imMYpe3mE27307n6zV1rVi6r6"
  },
  {
    name: "Editorial Curator",
    role: "Taste AI",
    title: "Single-Origin Cacao Pairings",
    quote: '"Explore how smoked sea salt elevates Tanzanian 70% bars."',
    stat: "Perfect match for your flavor profile",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCV6FGglJOdFp2ZdH1_etvJrOboG_yD0wfGrg4wEZA_nYY6u8Po_CpOvEXqBSol_uNNVWFCIFCF58Q503EuHzmDLWTb_ZLqroqKoXk0tuF_eSfyXnqHUBUdZdVMnGFPNKVzK3C-zJ369EcoG2mm3soMuVJh8eyscNz9oCSrRuHprlftnA-YHe6FsDL9uxIP70t5SFXvy4KprINKhhQgI9YhMVuaalMWmJynJbCnvKZ16UhOv_jfQuoG_N0L4Jz5fEAVXOQFV2U1kO21",
    imageAlt: "Assorted dark chocolates and cocoa beans arranged on a dark slate.",
    badgeIcon: SparkIcon,
    avatarBrandMark: true,
    avatarLetter: "C"
  }
];

export const homeFooterGroups: HomeFooterGroup[] = [
  {
    title: "Explore",
    links: [
      { href: "#curated-feed", label: "Provenance" },
      { href: "#social-hearth", label: "Manifesto" }
    ]
  },
  {
    title: "Legal",
    links: [
      { href: "/login", label: "Privacy" },
      { href: "/login", label: "Terms" }
    ]
  }
];
