type RepoCardProps = {
  name: string;
  description?: string;
  language?: string;
  stars?: string | number;
  rightAction?: React.ReactNode;
  compact?: boolean;
};

import { getLanguageColor } from "@/lib/languageColors";

export default function RepoCard({
  name,
  description,
  language,
  stars,
  rightAction,
  compact = false,
}: RepoCardProps) {
  const color = getLanguageColor(language) ?? "#6e7681"; // fallback neutral

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className={compact ? "font-medium text-sm" : "text-sm font-medium"}>
          {name}
        </div>
        {description ? (
          <p className="mt-1 text-xs text-white/70">{description}</p>
        ) : null}
        <div className="mt-2 text-xs text-white/60 inline-flex items-center">
          {language ? (
            <>
              <span
                className="inline-block w-2.5 h-2.5 rounded-full mr-2"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <span>{language}</span>
            </>
          ) : null}
          {stars ? (
            <>
              {language ? <span className="mx-1.5">·</span> : null}
              <span>{String(stars)}</span>
            </>
          ) : null}
        </div>
      </div>
      {rightAction ? rightAction : null}
    </div>
  );
}

