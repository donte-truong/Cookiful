import { CheckIcon, CutleryIcon, SparkIcon, TimerIcon } from "./landing-icons";
import { kitchenFeatures } from "../landing-data";

export function LandingSousChefSection() {
  return (
    <section className="relative py-20 sm:py-24" id="sous-chef">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(circle_at_15%_20%,rgba(255,219,204,0.35),transparent_24%),radial-gradient(circle_at_85%_15%,rgba(190,86,26,0.08),transparent_20%)]" />
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:items-center lg:px-16">
        <div className="rounded-[2.7rem] bg-[linear-gradient(135deg,rgba(224,192,178,0.55),rgba(255,248,239,0.1))] p-[1px]">
          <div className="editorial-panel relative overflow-hidden rounded-[calc(2.7rem-1px)] p-7 sm:p-10">
            <div className="grain-overlay absolute inset-0 opacity-70" />
            <div className="relative">
              <div className="mb-8 flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-copper-gradient text-white shadow-hearth">
                  <SparkIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-[1.8rem] tracking-[-0.03em] text-hearth-text">
                    The AI Sous-Chef
                  </h3>
                  <p className="mt-1 text-[0.7rem] uppercase tracking-[0.28em] text-hearth-accent/80">
                    Intelligent Kitchen Pairing
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-hearth-container/85 p-6 shadow-hearth">
                <p className="text-sm italic leading-6 text-hearth-muted">
                  &quot;I have four duck breasts and some wild cherries. What&apos;s
                  the best technique?&quot;
                </p>
                <div className="mt-4 flex items-start gap-4">
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-hearth-blush text-hearth-copper">
                    <SparkIcon className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-7 text-hearth-text sm:text-base">
                    Recommended: Honey-Glazed Searing with a reduction of Cherry
                    Gastrique. Should I adjust your meal prep calendar for
                    Tuesday?
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.25rem] bg-white/75 p-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-hearth-high text-hearth-outline">
                      <TimerIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[0.62rem] uppercase tracking-[0.24em] text-hearth-muted/80">
                        Cook Time
                      </p>
                      <p className="mt-1 text-sm font-semibold text-hearth-text">
                        45 Mins
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.25rem] bg-white/75 p-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-hearth-high text-hearth-outline">
                      <CutleryIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[0.62rem] uppercase tracking-[0.24em] text-hearth-muted/80">
                        Complexity
                      </p>
                      <p className="mt-1 text-sm font-semibold text-hearth-text">
                        Intermediate
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[36rem]">
          <h2 className="font-display text-[clamp(2.8rem,7vw,4.6rem)] leading-[0.95] tracking-[-0.05em]">
            Your Kitchen,{" "}
            <span className="italic text-hearth-copper">Digitally Orchestrated.</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-hearth-muted">
            Our AI doesn&apos;t just give you recipes; it understands the
            chemistry of flavor and the logistics of your life. It learns your
            palate, manages your pantry, and scales with your ambition.
          </p>

          <ul className="mt-10 space-y-5">
            {kitchenFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-4 text-base leading-7"
              >
                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-hearth-blush text-hearth-copper">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
