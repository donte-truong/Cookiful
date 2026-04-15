import { BrandMark } from "../../../components/brand/brand-mark";
import type { HomeSocialStory } from "../home-data";

type HomeSocialCardProps = {
  story: HomeSocialStory;
};

export function HomeSocialCard({ story }: HomeSocialCardProps) {
  const BadgeIcon = story.badgeIcon;

  return (
    <article className="rounded-[1.65rem] bg-hearth-surface/60 p-6 backdrop-blur-md transition duration-300 hover:bg-hearth-surface/90">
      <div className="flex items-center gap-3">
        {story.avatarImage ? (
          <img
            alt={`${story.name} avatar`}
            className="h-10 w-10 rounded-full object-cover grayscale"
            src={story.avatarImage}
          />
        ) : story.avatarBrandMark ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-hearth-copperSoft/14 p-2.5 ring-1 ring-hearth-copper/12">
            <BrandMark className="h-full w-full" />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-hearth-copperSoft text-base font-semibold text-white">
            {story.avatarLetter}
          </div>
        )}

        <div>
          <p className="text-sm font-bold text-hearth-text">{story.name}</p>
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-hearth-outline">
            {story.role}
          </p>
        </div>
      </div>

      <img
        alt={story.imageAlt}
        className="mt-6 h-40 w-full rounded-[1.1rem] object-cover"
        src={story.image}
      />

      <h3 className="mt-5 font-display text-[1.5rem] leading-tight tracking-[-0.03em] text-hearth-text">
        {story.title}
      </h3>
      <p className="mt-3 text-sm italic leading-7 text-hearth-muted">
        {story.quote}
      </p>

      <div className="mt-5 flex items-center gap-2 text-hearth-copper">
        <BadgeIcon className="h-4 w-4" />
        <span className="text-xs text-hearth-muted">{story.stat}</span>
      </div>
    </article>
  );
}
