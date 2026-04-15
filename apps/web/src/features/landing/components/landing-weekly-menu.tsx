import { CutleryIcon, MoonIcon } from "./landing-icons";
import { mealColumns, plannerDays } from "../landing-data";

export function LandingWeeklyMenuSection() {
  return (
    <section
      className="bg-[linear-gradient(180deg,rgba(239,231,217,0.42),rgba(255,248,239,0.95))] py-20 sm:py-24"
      id="planner"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl tracking-[-0.04em] sm:text-5xl">
            The Weekly Menu
          </h2>
          <p className="mt-4 text-base leading-7 text-hearth-muted sm:text-lg">
            A seamless orchestration of nutrition and pleasure. Drag, drop, and
            let the Hearth handle the rest.
          </p>
        </div>

        <div className="hearth-shadow mx-auto mt-12 max-w-[1280px] rounded-[2.2rem] bg-white/88 p-4 sm:p-5 lg:p-6">
          <div className="grid gap-3 md:grid-cols-7">
            {plannerDays.map((day) => (
              <div
                key={day.day}
                className={`rounded-[1.25rem] px-4 py-5 text-center ${
                  day.tone === "active"
                    ? "bg-hearth-blush/65 text-hearth-copper"
                    : day.tone === "muted"
                      ? "bg-hearth-container text-hearth-accent"
                      : "bg-hearth-surface/70 text-hearth-text"
                }`}
              >
                <p
                  className={`text-[0.68rem] uppercase tracking-[0.28em] ${
                    day.tone === "active" ? "text-hearth-copper" : "text-hearth-muted"
                  }`}
                >
                  {day.day}
                </p>
                <p className="mt-2 font-display text-2xl tracking-[-0.04em]">
                  {day.date}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {mealColumns.map((meal) => {
              const MealIcon = meal.icon;

              return (
                <div
                  key={meal.label}
                  className="rounded-[1.8rem] bg-hearth-surface/68 p-5 sm:p-6"
                >
                  <h3
                    className={`flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] ${meal.accent}`}
                  >
                    <MealIcon className="h-4 w-4" />
                    {meal.label}
                  </h3>

                  <a
                    className="mt-5 flex w-full items-center gap-4 rounded-[1.35rem] bg-white/90 p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:bg-white"
                    href="#collections"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-[1rem] bg-hearth-high">
                      <img
                        alt={meal.alt}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        src={meal.image}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-hearth-text">{meal.cardTitle}</p>
                      <p className="mt-1 text-sm text-hearth-muted">{meal.cardMeta}</p>
                    </div>
                  </a>
                </div>
              );
            })}

            <div className="rounded-[1.8rem] bg-hearth-surface/68 p-5 sm:p-6">
              <h3 className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-hearth-copper">
                <MoonIcon className="h-4 w-4" />
                Dinner
              </h3>

              <div className="relative mt-5 overflow-hidden rounded-[1.45rem] bg-copper-gradient p-6 text-white shadow-hearth">
                <div className="pointer-events-none absolute right-4 top-4 text-white/20">
                  <CutleryIcon className="h-12 w-12" />
                </div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/75">
                  Tonight&apos;s Special
                </p>
                <h4 className="mt-3 max-w-[14rem] text-2xl font-semibold leading-8">
                  Duck Confit with Cherry Gastrique
                </h4>
                <div className="mt-6 flex items-end justify-between gap-3">
                  <p className="text-sm text-white/90">Prep at 6:30 PM</p>
                  <a
                    className="rounded-full bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm transition hover:bg-white/30"
                    href="#promo"
                  >
                    Details
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
