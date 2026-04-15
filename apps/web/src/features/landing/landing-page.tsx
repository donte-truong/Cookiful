import { LandingCollectionsSection } from "./components/landing-collections";
import { LandingFooter } from "./components/landing-footer";
import { LandingHeader } from "./components/landing-header";
import { LandingHeroSection } from "./components/landing-hero";
import { LandingPromoSection } from "./components/landing-promo";
import { LandingSousChefSection } from "./components/landing-sous-chef";
import { LandingWeeklyMenuSection } from "./components/landing-weekly-menu";
import { PlusIcon } from "./components/landing-icons";
import { SectionWaveDivider } from "./section-wave-divider";

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-hearth-surface text-hearth-text">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[32rem] bg-hearth-glow blur-3xl" />

      <LandingHeader />
      <LandingHeroSection />

      <SectionWaveDivider
        accentColor="rgba(255, 255, 255, 0.28)"
        bottomColor="#fbf3e4"
        topColor="#fff8ef"
      />
      <LandingCollectionsSection />

      <SectionWaveDivider
        accentColor="rgba(255, 255, 255, 0.26)"
        bottomColor="#fff8ef"
        topColor="#fbf3e4"
      />
      <LandingSousChefSection />

      <SectionWaveDivider
        accentColor="rgba(190, 86, 26, 0.12)"
        bottomColor="#fbf3e4"
        topColor="#fff8ef"
      />
      <LandingWeeklyMenuSection />

      <SectionWaveDivider
        accentColor="rgba(255, 255, 255, 0.36)"
        bottomColor="#f5edde"
        topColor="#fff8ef"
      />
      <LandingPromoSection />

      <SectionWaveDivider
        accentColor="rgba(255, 255, 255, 0.24)"
        bottomColor="#efe7d9"
        topColor="#f5edde"
      />
      <LandingFooter />

      <a
        aria-label="Jump to weekly menu"
        className="fixed bottom-6 right-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-copper-gradient text-white shadow-hearth transition duration-300 hover:scale-105"
        href="#planner"
      >
        <PlusIcon className="h-6 w-6" />
      </a>
    </main>
  );
}
