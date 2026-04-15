import { CheckIcon } from "./landing-icons";
import { promoFeatures } from "../landing-data";

export function LandingPromoSection() {
  return (
    <section className="relative bg-hearth-container py-20 sm:py-24" id="promo">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,219,204,0.36),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(190,86,26,0.1),transparent_18%),radial-gradient(circle_at_70%_85%,rgba(255,255,255,0.45),transparent_24%)]" />
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-center lg:px-16">
        <div className="relative max-w-2xl">
          <p className="mb-5 text-[0.7rem] uppercase tracking-[0.32em] text-hearth-accent/75 sm:text-xs">
            Membership
          </p>
          <h2 className="font-display text-[clamp(2.9rem,7vw,5rem)] leading-[0.95] tracking-[-0.05em]">
            Ready to Elevate Your Kitchen?
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-hearth-muted">
            Join a more editorial way to cook. Build menus, refine technique,
            and turn every week into a guided culinary ritual.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              className="inline-flex items-center justify-center rounded-2xl bg-copper-gradient px-8 py-4 text-center text-sm font-semibold text-white shadow-hearth transition duration-300 hover:-translate-y-0.5 hover:brightness-105 sm:text-base"
              href="#top"
            >
              Start a Tasting Profile
            </a>
            <a
              className="ghost-outline inline-flex items-center justify-center rounded-2xl bg-white/70 px-8 py-4 text-center text-sm font-semibold text-hearth-copper transition duration-300 hover:bg-white/90 sm:text-base"
              href="#planner"
            >
              Plan This Week
            </a>
          </div>
        </div>

        <div className="hearth-shadow relative overflow-hidden rounded-[2.4rem] bg-hearth-paper/90 p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(190,86,26,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,219,204,0.34),transparent_26%)]" />
          <div className="relative space-y-4">
            {promoFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-4 rounded-[1.35rem] bg-hearth-surface/85 p-4"
              >
                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-hearth-blush text-hearth-copper">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <p className="text-sm leading-7 text-hearth-text">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
