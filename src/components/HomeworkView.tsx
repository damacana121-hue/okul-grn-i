import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Homework } from "../types";
import {
  getDaysLeft,
  formatDaysCountdown,
  formatTurkishDate,
} from "../utils/dateHelpers";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  X,
  Sparkles,
  Filter,
  CheckSquare,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResearchAssistantView } from "./ResearchAssistantView";

export const HomeworkView: React.FC = () => {
  const { homeworks, addHomework, toggleHomework, deleteHomework, lessons, setActiveTab } =
    useApp();

  const [subTab, setSubTab] = useState<"list" | "research">("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  // Form states
  const [lessonName, setLessonName] = useState(lessons[0]?.name || "Matematik");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [priority, setPriority] = useState<Homework["priority"]>("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addHomework({
      lessonName,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      isCompleted: false,
    });

    setTitle("");
    setDescription("");
    setIsModalOpen(false);
  };

  // Status helper
  const getHomeworkStatus = (hw: Homework) => {
    if (hw.isCompleted) {
      return {
        label: "Tamamlandı",
        color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
        icon: "🟢",
      };
    }
    const daysLeft = getDaysLeft(hw.dueDate);
    if (daysLeft < 0) {
      return {
        label: "Gecikti",
        color: "text-rose-400 bg-rose-500/15 border-rose-500/30",
        icon: "🔴",
      };
    }
    if (daysLeft <= 2) {
      return {
        label: "Yaklaşıyor",
        color: "text-amber-400 bg-amber-500/15 border-amber-500/30",
        icon: "🟡",
      };
    }
    return {
      label: "Devam Ediyor",
      color: "text-indigo-300 bg-indigo-500/15 border-indigo-500/30",
      icon: "🔵",
    };
  };

  const filteredHomeworks = homeworks.filter((hw) => {
    if (filter === "pending") return !hw.isCompleted;
    if (filter === "completed") return hw.isCompleted;
    return true;
  });

  const uniqueLessons = Array.from(new Set(lessons.map((l) => l.name)));
  if (uniqueLessons.length === 0) uniqueLessons.push("Matematik", "Fizik", "Kimya", "Biyoloji", "Edebiyat");

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* Top Segmented Control */}
      <div className="flex p-1 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-md">
        <button
          onClick={() => setSubTab("list")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            subTab === "list"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Ödev Takibi ({homeworks.filter((h) => !h.isCompleted).length})</span>
        </button>

        <button
          onClick={() => setSubTab("research")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            subTab === "research"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
              : "text-slate-400 hover:text-purple-300"
          }`}
        >
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          <span>Akıllı Araştırma & Ödev Yeri</span>
        </button>
      </div>

      {subTab === "research" ? (
        <ResearchAssistantView onBackToHomeworks={() => setSubTab("list")} />
      ) : (
        <>
          {/* Header and Add Button */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Ödev Takibi</h2>
              <p className="text-xs text-slate-400">
                {homeworks.filter((h) => !h.isCompleted).length} bekleyen ödevin var
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-xs font-semibold rounded-2xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Ödev Ekle</span>
            </button>
          </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === "all"
              ? "bg-indigo-600 text-white shadow"
              : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60"
          }`}
        >
          Tümü ({homeworks.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === "pending"
              ? "bg-amber-600 text-white shadow"
              : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60"
          }`}
        >
          Bekleyen ({homeworks.filter((h) => !h.isCompleted).length})
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === "completed"
              ? "bg-emerald-600 text-white shadow"
              : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60"
          }`}
        >
          Tamamlanan ({homeworks.filter((h) => h.isCompleted).length})
        </button>
      </div>

      {/* Homework List */}
      <div className="space-y-3">
        {filteredHomeworks.length === 0 ? (
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-8 text-center">
            <p className="text-sm font-semibold text-slate-300">
              Bu filtrede gösterilecek ödev bulunamadı.
            </p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Yeni bir ödev ekleyebilirsin.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
            >
              + Ödev Ekle
            </button>
          </div>
        ) : (
          filteredHomeworks.map((hw) => {
            const status = getHomeworkStatus(hw);
            const daysLeft = getDaysLeft(hw.dueDate);
            const countdown = formatDaysCountdown(daysLeft);

            return (
              <div
                key={hw.id}
                className={`border rounded-3xl p-4 transition-all duration-200 relative overflow-hidden backdrop-blur-sm ${
                  hw.isCompleted
                    ? "bg-slate-900/60 border-slate-800 opacity-80"
                    : "bg-slate-800/80 border-slate-700/80 hover:border-slate-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Complete Checkbox */}
                  <button
                    onClick={() => toggleHomework(hw.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-400 transition"
                    title={hw.isCompleted ? "Tamamlanmadı yap" : "Tamamlandı olarak işaretle"}
                  >
                    {hw.isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-400 hover:scale-110 transition-transform" />
                    )}
                  </button>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md">
                          {hw.lessonName}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${status.color}`}
                        >
                          {status.icon} {status.label}
                        </span>
                      </div>

                      {/* Priority Tag */}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          hw.priority === "high"
                            ? "bg-rose-500/20 text-rose-300"
                            : hw.priority === "medium"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {hw.priority === "high"
                          ? "Yüksek Öncelik"
                          : hw.priority === "medium"
                          ? "Orta Öncelik"
                          : "Düşük Öncelik"}
                      </span>
                    </div>

                    <h4
                      className={`text-base font-bold mt-1.5 tracking-tight ${
                        hw.isCompleted ? "line-through text-slate-400" : "text-white"
                      }`}
                    >
                      {hw.title}
                    </h4>

                    {hw.description && (
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {hw.description}
                      </p>
                    )}

                    {/* Footer Info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-700/50 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Son: {formatTurkishDate(hw.dueDate)}</span>
                        {!hw.isCompleted && (
                          <span className={`font-semibold ml-1 ${countdown.color}`}>
                            ({countdown.text})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Ask AI about this homework */}
                        <button
                          onClick={() => {
                            setActiveTab("ai");
                          }}
                          className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-purple-200 px-2 py-1 bg-purple-500/15 rounded-lg border border-purple-500/25 transition"
                          title="Yapay Zekâya sor"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>AI Yardımı</span>
                        </button>

                        <button
                          onClick={() => deleteHomework(hw.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg transition"
                          title="Ödevi sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Homework Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Yeni Ödev Ekle</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ders Seçimi</label>
                  <select
                    value={lessonName}
                    onChange={(e) => setLessonName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {uniqueLessons.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ödev Başlığı *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: Sayfa 84-90 Alıştırmaları"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Açıklama / Notlar</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ödevle ilgili detaylar veya öğretmenin uyarısı..."
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Son Teslim Tarihi</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Öncelik</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-semibold transition"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-amber-500/25"
                  >
                    Ödevi Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
};
