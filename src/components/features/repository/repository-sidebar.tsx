"use client";

import { Settings, StarIcon } from "lucide-react";
import Link from "next/link";
import { LanguageStats, RepositoryStats } from "./types";
import { useEffect, useState } from "react";

interface RepositoryFile {
  path: string;
  content: string;
  action: string;
}

interface RepositorySidebarProps {
  description?: string | null;
  stats?: RepositoryStats;
  languages?: LanguageStats[];
  hasReleases?: boolean;
  hasPackages?: boolean;
  repositoryFiles?: RepositoryFile[];
}

const defaultStats: RepositoryStats = {
  stars: 0,
  watchers: 0,
  forks: 0,
};

const defaultLanguages: LanguageStats[] = [
  { name: "TypeScript", percentage: 95.2, color: "#3178c6" },
  { name: "CSS", percentage: 4.2, color: "#563d7c" },
  { name: "Other", percentage: 0.6, color: "#f1e05a" },
];

export default function RepositorySidebar({
  description,
  stats = defaultStats,
  languages = defaultLanguages,
  hasReleases = false,
  hasPackages = false,
  repositoryFiles = [],
}: RepositorySidebarProps) {
  const [dynamicLanguages, setDynamicLanguages] =
    useState<LanguageStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLanguageStats() {
      if (!repositoryFiles || repositoryFiles.length === 0) {
        setDynamicLanguages([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/languages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ repositoryFiles }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.languages && data.languages.length > 0) {
            setDynamicLanguages(data.languages);
          } else {
            setDynamicLanguages([]);
          }
        } else {
          console.warn("Failed to fetch language stats:", response.statusText);
          setDynamicLanguages([]);
        }
      } catch (error) {
        console.warn("Failed to calculate language stats:", error);
        setDynamicLanguages([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadLanguageStats();
  }, [repositoryFiles, languages]);
  return (
    <aside className="space-y-4">
      {/* About */}
      <div className="border-b pb-4 border-white/20">
        <div className="flex items-center gap-2 mb-3 justify-between">
          <h2 className="font-semibold">About</h2>
          <button className="text-white/60 hover:text-white">
            <Settings size={16} />
          </button>
        </div>
        <p className="text-sm text-white/60 mb-4 italic">
          {description || "No description, website, or topics provided."}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span>
              <svg
                aria-hidden="true"
                height="16"
                viewBox="0 0 16 16"
                version="1.1"
                width="16"
                data-view-component="true"
                fill="gray"
              >
                <path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z"></path>
              </svg>
            </span>
            <Link
              href="#"
              className="text-white/50 hover:text-[#58a6ff] text-sm"
            >
              Readme
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span>
              <svg
                aria-hidden="true"
                height="16"
                viewBox="0 0 16 16"
                version="1.1"
                width="16"
                data-view-component="true"
                fill="gray"
              >
                <path d="M6 2c.306 0 .582.187.696.471L10 10.731l1.304-3.26A.751.751 0 0 1 12 7h3.25a.75.75 0 0 1 0 1.5h-2.742l-1.812 4.528a.751.751 0 0 1-1.392 0L6 4.77 4.696 8.03A.75.75 0 0 1 4 8.5H.75a.75.75 0 0 1 0-1.5h2.742l1.812-4.529A.751.751 0 0 1 6 2Z"></path>
              </svg>
            </span>
            <Link
              href="#"
              className="text-white/50 hover:text-[#58a6ff] text-sm"
            >
              Activity
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span>
              <StarIcon size={16} color="gray" />
            </span>
            <span className="text-white/50 hover:text-[#58a6ff] text-sm">
              {stats.stars} stars
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="gray"
                display="inline-block"
                overflow="visible"
              >
                <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z"></path>
              </svg>
            </span>
            <span className="text-white/50 hover:text-[#58a6ff] text-sm">
              {stats.watchers} watching
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>
              <svg
                aria-hidden="true"
                height="16"
                viewBox="0 0 16 16"
                version="1.1"
                width="16"
                data-view-component="true"
                fill="gray"
              >
                <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
              </svg>
            </span>
            <span className="text-white/50 hover:text-[#58a6ff] text-sm">
              {stats.forks} forks
            </span>
          </div>
        </div>
      </div>

      {/* Releases */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[15px]">Releases</h3>
        </div>
        {hasReleases ? (
          <div>{/* Add actual releases content here when needed */}</div>
        ) : (
          <>
            <p className="text-sm text-white/60 mb-2">No releases published</p>
            <Link href="#" className="text-[#58a6ff] hover:underline text-sm">
              Create a new release
            </Link>
          </>
        )}
      </div>

      {/* Packages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Packages</h3>
        </div>
        {hasPackages ? (
          <div>{/* Add actual packages content here when needed */}</div>
        ) : (
          <>
            <p className="text-sm text-white/60 mb-2">No packages published</p>
            <Link href="#" className="text-[#58a6ff] hover:underline text-sm">
              Publish your first package
            </Link>
          </>
        )}
      </div>

      {/* Languages */}
      <div>
        <h3 className="font-semibold mb-3">Languages</h3>
        {isLoading ? (
          <div className="text-sm text-white/60">Analyzing languages...</div>
        ) : dynamicLanguages.length > 0 ? (
          <div className="space-y-2">
            <div className="h-2 w-full rounded overflow-hidden bg-white/10">
              <div className="h-full flex">
                {dynamicLanguages.map((lang, index) => (
                  <div
                    key={`${lang.name}-${index}`}
                    className="h-full"
                    style={{
                      backgroundColor: lang.color,
                      width: `${lang.percentage}%`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/60 flex-wrap">
              {dynamicLanguages.map((lang, index) => (
                <div
                  key={`${lang.name}-label-${index}`}
                  className="flex items-center gap-1"
                >
                  <div
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: lang.color }}
                  />
                  <span>
                    <span className="text-white">{lang.name} </span>
                    {lang.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-white/60">No languages detected</div>
        )}
      </div>
    </aside>
  );
}
