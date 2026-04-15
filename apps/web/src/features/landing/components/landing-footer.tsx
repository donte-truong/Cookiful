import { BrandLogo } from "../../../components/brand/brand-logo";
import { footerLinks } from "../landing-data";

export function LandingFooter() {
  return (
    <footer className="bg-hearth-high py-12" id="footer">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-16">
        <a aria-label="Home" className="shrink-0" href="#top">
          <BrandLogo className="h-10 w-auto" />
        </a>

        <nav className="flex flex-wrap gap-x-6 gap-y-3">
          {footerLinks.map((item) => (
            <a
              key={item.label}
              className="text-[0.72rem] uppercase tracking-[0.26em] text-hearth-muted hover:text-hearth-copper"
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <p className="text-[0.72rem] uppercase tracking-[0.22em] text-hearth-muted">
          © 2026 The Culinary Editorial. Crafted for the Sensory Sommelier.
        </p>
      </div>
    </footer>
  );
}
