import { NavigationTab } from "./types";

interface NavigationTabsProps {
  tabs: NavigationTab[];
}

export default function NavigationTabs({ tabs }: NavigationTabsProps) {
  return (
    <div className="border-b border-white/20 bg-[#010409]">
      <div className="w-full px-4 py-0 sm:px-6 lg:px-4">
        <nav className="flex gap-8 text-sm mx-auto">
          {tabs.map((tab) => (
            <div
              key={tab.label}
              className={`flex items-center gap-2 py-4 border-b-2 whitespace-nowrap ${
                tab.active
                  ? "text-white border-[#fd7e14]"
                  : "text-white/70 border-transparent hover:text-white hover:border-white/20"
              }`}
            >
              <span className="text-xs opacity-70">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== null && tab.count !== undefined && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs min-w-[16px] text-center">
                  {tab.count}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}