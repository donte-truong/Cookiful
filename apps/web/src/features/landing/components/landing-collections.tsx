import { ArrowRightIcon } from "./landing-icons";
import { collections } from "../landing-data";

export function LandingCollectionsSection() {
  return (
    <section className="bg-hearth-low py-20 sm:py-24" id="collections">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-16">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl tracking-[-0.04em] sm:text-5xl">
              Curated Collections
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-hearth-muted sm:text-lg">
              Follow world-class chefs and seasonal tastemakers as they share
              their digital cookbooks.
            </p>
          </div>

          <a
            className="inline-flex items-center gap-2 self-start font-semibold text-hearth-copper transition hover:gap-3"
            href="#planner"
          >
            View All Stories
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-4 lg:grid-rows-[18rem_18rem]">
          {collections.map((collection) => (
            <a
              key={collection.title}
              className={`group hearth-shadow relative overflow-hidden rounded-[2rem] bg-white ${
                collection.variant === "feature"
                  ? "min-h-[25rem] lg:col-span-2 lg:row-span-2"
                  : collection.variant === "wide"
                    ? "min-h-[16rem] lg:col-span-2"
                    : "min-h-[18rem]"
              }`}
              href={collection.href}
            >
              <img
                alt={collection.alt}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
                src={collection.image}
              />

              {collection.variant === "feature" ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8">
                    <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-md">
                      {collection.label}
                    </span>
                    <h3 className="mt-5 font-display text-3xl tracking-[-0.03em] text-white sm:text-4xl">
                      {collection.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/85 sm:text-base">
                      {collection.description}
                    </p>
                  </div>
                </>
              ) : collection.variant === "wide" ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-hearth-copper/70 via-hearth-copper/25 to-transparent" />
                  <div className="absolute inset-y-0 left-0 flex max-w-[16rem] items-center px-7">
                    <div>
                      <h3 className="font-display text-3xl tracking-[-0.03em] text-white">
                        {collection.title}
                      </h3>
                      <p className="mt-2 text-sm text-white/80">
                        {collection.description}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 rounded-[1.2rem] bg-hearth-surface/90 p-4 backdrop-blur-md">
                    <p className="font-semibold text-hearth-copper">
                      {collection.title}
                    </p>
                    <p className="mt-1 text-sm text-hearth-muted">
                      {collection.description}
                    </p>
                  </div>
                </>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
