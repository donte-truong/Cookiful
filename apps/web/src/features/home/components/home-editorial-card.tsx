import { editorialMoments } from "../home-data";

export function HomeEditorialCard() {
  return (
    <aside className="rounded-[2rem] bg-copper-gradient p-[1px] shadow-hearth">
      <div className="rounded-[calc(2rem-1px)] bg-hearth-paper px-6 py-7 sm:px-8 sm:py-9">
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.32em] text-hearth-copper">
          Editorial Recommendation
        </span>
        <h3 className="mt-4 font-display text-[clamp(1.7rem,3vw,2.15rem)] leading-tight tracking-[-0.04em] text-hearth-text">
          Pantry-Inspired: Three Days in Provence
        </h3>

        <div className="mt-8 space-y-6">
          {editorialMoments.map((moment) => {
            const Icon = moment.icon;

            return (
              <div key={moment.title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-hearth-high text-hearth-copper">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-hearth-text">
                    {moment.title}
                  </h4>
                  <p className="mt-1 text-sm leading-6 text-hearth-muted">
                    {moment.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="mt-10 w-full rounded-[1.25rem] bg-copper-gradient px-5 py-4 text-sm font-bold text-white shadow-hearth transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
          type="button"
        >
          View Shopping List
        </button>
      </div>
    </aside>
  );
}
