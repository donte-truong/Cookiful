import Link from "next/link";

import { BrandLogo } from "../../../components/brand/brand-logo";
import { homeFooterGroups } from "../home-data";
import { GlobeIcon, RssIcon } from "./home-icons";

export function HomeFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="px-4 pb-10 sm:px-6 lg:px-8" id="footer">
      <div className="mx-auto max-w-[1440px] rounded-[2rem] bg-hearth-high px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_auto] md:items-start">
          <div className="max-w-md">
            <Link
              aria-label="Home"
              className="inline-flex items-center text-hearth-text"
              href="/home"
            >
              <BrandLogo className="h-11 w-auto" />
            </Link>
            <p className="mt-4 text-sm leading-7 text-hearth-muted">
              Empowering the home chef with professional insight and sensory
              inspiration. Your journey to mastery begins at the hearth.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {homeFooterGroups.map((group) => (
              <div key={group.title}>
                <h4 className="text-xs font-bold uppercase tracking-[0.28em] text-hearth-copper">
                  {group.title}
                </h4>
                <nav className="mt-4 flex flex-col gap-3">
                  {group.links.map((link) => (
                    <a
                      key={link.label}
                      className="text-sm uppercase tracking-[0.22em] text-hearth-muted transition hover:text-hearth-copper"
                      href={link.href}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          <div className="flex flex-col justify-between gap-10 md:items-end">
            <div className="flex items-center gap-4 text-hearth-muted">
              <a
                aria-label="Language settings"
                className="transition hover:text-hearth-copper"
                href="#top"
              >
                <GlobeIcon className="h-5 w-5" />
              </a>
              <a
                aria-label="Editorial feed"
                className="transition hover:text-hearth-copper"
                href="#social-hearth"
              >
                <RssIcon className="h-5 w-5" />
              </a>
            </div>

            <p className="text-xs uppercase tracking-[0.28em] text-hearth-muted">
              &copy; {currentYear} All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
