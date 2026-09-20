import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Bell,
  Sparkles,
  Timer,
  Smartphone,
  Maximize2,
  Wifi,
  Battery,
  Signal,
  Download,
} from "lucide-react";
import { downloadAndroidProjectZip } from "../utils/androidProjectExport";

export const Header: React.FC = () => {
  const {
    profile,
    activeTab,
    setActiveTab,
    notifications,
    pomodoroState,
    settings,
    updateSettings,
  } = useApp();

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatPomodoroSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-indigo-500/10">
      {/* Android System Status Bar */}
      <div className="px-4 pt-1.5 pb-1 flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-tight select-none">
        <span>{currentTime || "09:41"}</span>
        <div className="flex items-center gap-2">
          <Signal className="w-3 h-3 text-slate-400" />
          <Wifi className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px]">98%</span>
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-2">
        {/* App Title & Student Info */}
        <div
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <img src="/icon.svg" alt="Okul Asistanı" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-slate-100 tracking-tight">Okul Asistanı</h1>
              <span className="text-[10px] font-medium px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                APK
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[130px] sm:max-w-none">
              {profile.name ? `${profile.name} • ${profile.grade}` : "Öğrenci Portalı"}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Active Pomodoro Widget Pill */}
          {pomodoroState.isRunning && (
            <button
              onClick={() => setActiveTab("pomodoro")}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-xs font-mono font-medium animate-pulse hover:bg-rose-500/30 transition"
              title="Pomodoro Çalışıyor"
            >
              <Timer className="w-3.5 h-3.5 animate-spin" />
              <span>{formatPomodoroSeconds(pomodoroState.timeLeft)}</span>
            </button>
          )}

          {/* Quick AI Consultant button */}
          <button
            onClick={() => setActiveTab("ai")}
            className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-medium ${
              activeTab === "ai"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30"
                : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
            }`}
            title="Yapay Zekâ Danışmanı"
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span className="hidden sm:inline">AI Danışman</span>
          </button>

          {/* Quick APK ZIP Download */}
          <button
            onClick={() => downloadAndroidProjectZip()}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition hidden sm:flex items-center gap-1 text-xs"
            title="Android APK Projesini İndir"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>APK İndir</span>
          </button>

          {/* Simulated Device Frame Toggle (for desktop browser view) */}
          <button
            onClick={() =>
              updateSettings({ simulatedPhoneFrame: !settings.simulatedPhoneFrame })
            }
            className={`p-2 rounded-xl border transition hidden md:flex items-center ${
              settings.simulatedPhoneFrame
                ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/40"
                : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/60"
            }`}
            title={settings.simulatedPhoneFrame ? "Geniş Ekrana Geç" : "Telefon Görünümüne Geç"}
          >
            {settings.simulatedPhoneFrame ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => setActiveTab("notifications")}
            className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
            title="Bildirimler"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
