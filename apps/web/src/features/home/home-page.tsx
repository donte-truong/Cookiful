import { HomeCuratedSection } from "./components/home-curated-section";
import { HomeFooter } from "./components/home-footer";
import { HomeHeader } from "./components/home-header";
import { HomeHeroSection } from "./components/home-hero";
import { HomeSocialSection } from "./components/home-social-section";

export function HomePage() {
  return (
    <main
      className="min-h-screen overflow-x-hidden bg-hearth-surface text-hearth-text"
      id="top"
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[30rem] bg-hearth-glow blur-3xl" />
      <div className="pointer-events-none fixed inset-x-0 top-[28rem] -z-10 h-[20rem] bg-[radial-gradient(circle_at_center,rgba(190,86,26,0.08),transparent_55%)] blur-3xl" />

      <HomeHeader />

      <div className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
        <HomeHeroSection />
        <HomeCuratedSection />
        <HomeSocialSection />
      </div>

      <HomeFooter />
    </main>
  );
}
