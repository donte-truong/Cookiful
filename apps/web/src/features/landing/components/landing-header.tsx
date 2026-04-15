import Link from "next/link";

import { BrandLogo } from "../../../components/brand/brand-logo";
import { navItems } from "../landing-data";
import { SearchIcon } from "./landing-icons";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50">
      <div className="glass-panel hearth-shadow">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-16">
          <a aria-label="Home" className="shrink-0" href="#top">
            <BrandLogo className="h-10 w-auto sm:h-11" />
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                className={`relative font-display text-base tracking-tight ${
                  item.active
                    ? "text-hearth-copper after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-hearth-copper"
                    : "text-hearth-muted hover:text-hearth-copper"
                }`}
                href={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <a
              aria-label="Search collections"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-hearth-text transition hover:bg-white/60 hover:text-hearth-copper"
              href="#collections"
            >
              <SearchIcon className="h-5 w-5" />
            </a>
            <Link
              className="rounded-full bg-copper-gradient px-5 py-2 text-sm font-semibold text-white shadow-hearth transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
              href="/login"
            >
              Sign In
            </Link>
          </div>
        </div>

        <nav className="mx-auto flex w-full max-w-[1440px] gap-5 overflow-x-auto px-5 pb-4 text-sm md:hidden sm:px-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              className={`whitespace-nowrap font-display ${
                item.active ? "text-hearth-copper" : "text-hearth-muted"
              }`}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
