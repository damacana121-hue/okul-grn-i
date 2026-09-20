import React from "react";
import { useApp, NavTab } from "../context/AppContext";
import { Home, BookOpen, CheckSquare, Calendar, Settings } from "lucide-react";
import { motion } from "motion/react";

interface NavItem {
  key: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { key: "home", label: "Ana Sayfa", icon: Home },
  { key: "schedule", label: "Dersler", icon: BookOpen },
  { key: "homework", label: "Ödevler", icon: CheckSquare },
  { key: "exams", label: "Takvim", icon: Calendar },
  { key: "settings", label: "Ayarlar", icon: Settings },
];

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, homeworks } = useApp();

  const pendingHomeworkCount = homeworks.filter((h) => !h.isCompleted).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 safe-area-bottom pb-2 pt-1.5 px-3">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.key ||
            (item.key === "schedule" && (activeTab === "pomodoro" || activeTab === "study")) ||
            (item.key === "exams" && (activeTab === "grades" || activeTab === "bag"));

          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 group touch-manipulation"
            >
              {/* Active Pill Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-indigo-500/15 rounded-2xl border border-indigo-500/30"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? "text-indigo-400 scale-110"
                      : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"
                  }`}
                />
                {/* Homework pending badge */}
                {item.key === "homework" && pendingHomeworkCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-amber-500 text-slate-950 rounded-full text-[9px] font-bold flex items-center justify-center">
                    {pendingHomeworkCount}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? "text-indigo-300 font-semibold" : "text-slate-400 group-hover:text-slate-300"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
