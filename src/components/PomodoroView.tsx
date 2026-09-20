import React from "react";
import { useApp } from "../context/AppContext";
import { playChimeSound, triggerHaptic } from "../utils/audio";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Vibrate,
  Award,
  BookOpen,
} from "lucide-react";

export const PomodoroView: React.FC = () => {
  const {
    pomodoroState,
    setPomodoroState,
    settings,
    updateSettings,
    lessons,
    studyGoals,
  } = useApp();

  const { timeLeft, isRunning, mode, activeSubject, completedCycles } = pomodoroState;

  // Derive total time for current mode
  const getTotalModeSeconds = () => {
    if (mode === "work") return (settings.pomodoroWork || 25) * 60;
    if (mode === "shortBreak") return (settings.pomodoroShortBreak || 5) * 60;
    return (settings.pomodoroLongBreak || 15) * 60;
  };

  const totalSeconds = getTotalModeSeconds();
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));

  // Circular SVG progress math
  const radius = 105;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const toggleTimer = () => {
    triggerHaptic(20);
    setPomodoroState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const resetTimer = () => {
    triggerHaptic(25);
    setPomodoroState((prev) => ({
      ...prev,
      isRunning: false,
      timeLeft: getTotalModeSeconds(),
    }));
  };

  const skipMode = () => {
    triggerHaptic(20);
    const nextMode = mode === "work" ? "shortBreak" : "work";
    setPomodoroState((prev) => ({
      ...prev,
      isRunning: false,
      mode: nextMode,
      timeLeft:
        nextMode === "work"
          ? (settings.pomodoroWork || 25) * 60
          : (settings.pomodoroShortBreak || 5) * 60,
    }));
  };

  const setSpecificMode = (targetMode: "work" | "shortBreak" | "longBreak") => {
    triggerHaptic(15);
    let seconds = (settings.pomodoroWork || 25) * 60;
    if (targetMode === "shortBreak") seconds = (settings.pomodoroShortBreak || 5) * 60;
    if (targetMode === "longBreak") seconds = (settings.pomodoroLongBreak || 15) * 60;

    setPomodoroState((prev) => ({
      ...prev,
      mode: targetMode,
      timeLeft: seconds,
      isRunning: false,
    }));
  };

  // Subjects available for selection
  const availableSubjects = Array.from(
    new Set([
      ...studyGoals.map((g) => g.lessonName),
      ...lessons.map((l) => l.name),
      "Genel Çalışma",
      "Kitap Okuma",
      "Soru Çözümü",
    ])
  );

  return (
    <div className="space-y-4 pb-20 pt-1 flex flex-col items-center max-w-md mx-auto">
      {/* Mode Selector Tabs */}
      <div className="flex items-center p-1.5 bg-slate-800/90 border border-slate-700/80 rounded-2xl w-full">
        <button
          onClick={() => setSpecificMode("work")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            mode === "work"
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Çalışma (25 dk)
        </button>
        <button
          onClick={() => setSpecificMode("shortBreak")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            mode === "shortBreak"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Kısa Mola (5 dk)
        </button>
        <button
          onClick={() => setSpecificMode("longBreak")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            mode === "longBreak"
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Uzun Mola (15 dk)
        </button>
      </div>

      {/* Subject Picker Dropdown */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <BookOpen className="w-4 h-4 text-rose-400" />
          <span className="font-semibold">Çalışılan Ders:</span>
        </div>
        <select
          value={activeSubject}
          onChange={(e) =>
            setPomodoroState((prev) => ({ ...prev, activeSubject: e.target.value }))
          }
          className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-rose-500"
        >
          {availableSubjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Circular Timer Visual */}
      <div className="relative my-4 flex items-center justify-center">
        <svg className="w-64 h-64 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            className={`transition-all duration-500 ${
              mode === "work"
                ? "stroke-rose-500"
                : mode === "shortBreak"
                ? "stroke-emerald-400"
                : "stroke-indigo-400"
            }`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Countdown Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-white drop-shadow-md">
            {formattedTime}
          </span>
          <span
            className={`text-xs font-bold uppercase tracking-wider mt-1 px-2.5 py-0.5 rounded-full ${
              mode === "work"
                ? "bg-rose-500/20 text-rose-300"
                : mode === "shortBreak"
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-indigo-500/20 text-indigo-300"
            }`}
          >
            {mode === "work" ? "Odaklanma Vakti" : "Dinlenme Vakti"}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 font-medium">{activeSubject}</span>
        </div>
      </div>

      {/* Controls: Play/Pause, Reset, Skip */}
      <div className="flex items-center gap-4 my-2">
        <button
          onClick={resetTimer}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition active:scale-95"
          title="Sıfırla"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTimer}
          className={`p-5 rounded-3xl text-white shadow-xl transition-all duration-200 transform active:scale-95 ${
            isRunning
              ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
              : mode === "work"
              ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
              : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
          }`}
          title={isRunning ? "Duraklat" : "Başlat"}
        >
          {isRunning ? (
            <Pause className="w-7 h-7 fill-white" />
          ) : (
            <Play className="w-7 h-7 fill-white ml-0.5" />
          )}
        </button>

        <button
          onClick={skipMode}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition active:scale-95"
          title="Sonraki Aşamaya Geç"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Stats and Toggles */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4">
        {/* Completed Cycles */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Tamamlanan</span>
            <span className="text-base font-bold text-white">{completedCycles} Pomodoro</span>
          </div>
        </div>

        {/* Audio & Haptic Feedback Switchers */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex items-center justify-around">
          <button
            onClick={() => {
              const next = !settings.soundEnabled;
              updateSettings({ soundEnabled: next });
              if (next) playChimeSound("complete");
            }}
            className={`p-2 rounded-xl border transition ${
              settings.soundEnabled
                ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/40"
                : "bg-slate-700/40 text-slate-500 border-slate-700"
            }`}
            title={settings.soundEnabled ? "Ses Açık" : "Ses Kapalı"}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              const next = !settings.hapticEnabled;
              updateSettings({ hapticEnabled: next });
              if (next) triggerHaptic(30);
            }}
            className={`p-2 rounded-xl border transition ${
              settings.hapticEnabled
                ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/40"
                : "bg-slate-700/40 text-slate-500 border-slate-700"
            }`}
            title={settings.hapticEnabled ? "Titreşim Açık" : "Titreşim Kapalı"}
          >
            <Vibrate className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
