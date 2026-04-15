import type { Metadata } from "next";

import { HomePage } from "../../features/home";

export const metadata: Metadata = {
  title: "Kitchen Lab",
  description:
    "Explore the editorial kitchen lab with curated recipes, pantry prompts, and community inspiration."
};

export default function HomeRoute() {
  return <HomePage />;
}
