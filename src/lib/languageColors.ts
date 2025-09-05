import colors from "../../colors.json";

type LanguageMeta = {
  color: string | null;
  url?: string | null;
};

const languageColors = colors as Record<string, LanguageMeta>;

export function getLanguageColor(language?: string | null): string | undefined {
  if (!language) return undefined;
  const meta = languageColors[language];
  const color = meta?.color ?? undefined;
  return color ?? undefined;
}

