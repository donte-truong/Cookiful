import Link from "next/link";

import { BrandLogo } from "../../../components/brand/brand-logo";
import { homeNavItems } from "../home-data";
import { ProfileIcon, ShoppingBagIcon } from "./home-icons";

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 bg-hearth-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <Link
          aria-label="Home"
          className="inline-flex items-center text-hearth-text transition"
          href="/home"
        >
          <BrandLogo className="h-9 w-auto sm:h-10" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {homeNavItems.map((item) => (
            <a
              key={item.label}
              className={`relative font-display text-sm tracking-tight transition ${
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

        <div className="flex items-center gap-2 text-hearth-copper sm:gap-4">
          <Link
            aria-label="Groceries"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/70"
            href="/groceries"
          >
            <ShoppingBagIcon className="h-[1.125rem] w-[1.125rem]" />
          </Link>
          <Link
            aria-label="Profile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/70"
            href="/profile"
          >
            <ProfileIcon className="h-[1.125rem] w-[1.125rem]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
