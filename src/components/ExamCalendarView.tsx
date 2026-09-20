import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Exam } from "../types";
import {
  getDaysLeft,
  formatDaysCountdown,
  formatTurkishDate,
} from "../utils/dateHelpers";
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  FileText,
  X,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const EXAM_TYPES = [
  "1. Yazılı",
  "2. Yazılı",
  "3. Yazılı",
  "Deneme Sınavı",
  "Sözlü Sınavı",
  "Proje Değerlendirme",
  "YKS / TYT Denemesi",
];

export const ExamCalendarView: React.FC = () => {
  const { exams, addExam, deleteExam, lessons, setActiveTab } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [lessonName, setLessonName] = useState(lessons[0]?.name || "Matematik");
  const [examType, setExamType] = useState("1. Yazılı");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("09:20");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonName) return;

    addExam({
      lessonName,
      examType,
      date,
      time,
      description: description.trim(),
    });

    setDescription("");
    setIsModalOpen(false);
  };

  const sortedExams = [...exams].sort((a, b) => a.date.localeCompare(b.date));
  const upcomingExams = sortedExams.filter((e) => getDaysLeft(e.date) >= 0);
  const pastExams = sortedExams.filter((e) => getDaysLeft(e.date) < 0);

  const uniqueLessons = Array.from(new Set(lessons.map((l) => l.name)));
  if (uniqueLessons.length === 0) uniqueLessons.push("Matematik", "Fizik", "Kimya", "Biyoloji", "Tarih");

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Sınav Takvimi</h2>
          <p className="text-xs text-slate-400">
            {upcomingExams.length} yaklaşan sınav planlanmış
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-semibold rounded-2xl shadow-lg shadow-rose-500/20 hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Sınav Ekle</span>
        </button>
      </div>

      {/* Featured Nearest Exam Banner */}
      {upcomingExams.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/60 via-purple-900/40 to-slate-900/80 border border-rose-500/30 rounded-3xl p-4 shadow-xl relative overflow-hidden backdrop-blur-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                EN YAKIN SINAV
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1">
                {upcomingExams[0].lessonName}
              </h3>
              <p className="text-xs text-slate-300">
                {upcomingExams[0].examType} • {formatTurkishDate(upcomingExams[0].date)} ({upcomingExams[0].time})
              </p>
            </div>

            {(() => {
              const countdown = formatDaysCountdown(getDaysLeft(upcomingExams[0].date));
              return (
                <div className={`px-3 py-1.5 rounded-2xl border font-bold text-sm ${countdown.badge}`}>
                  {countdown.text}
                </div>
              );
            })()}
          </div>

          <div className="mt-3 pt-3 border-t border-rose-500/15 flex items-center justify-between">
            <p className="text-xs text-slate-400 truncate max-w-[220px]">
              {upcomingExams[0].description || "Konuları gözden geçirmeyi unutma."}
            </p>
            <button
              onClick={() => setActiveTab("ai")}
              className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold border border-rose-500/30 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Çalışma Planı Al</span>
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Exams List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Yaklaşan Sınavlar ({upcomingExams.length})
        </h3>

        {upcomingExams.length === 0 ? (
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-8 text-center">
            <p className="text-sm font-semibold text-slate-300">Yaklaşan herhangi bir sınav yok.</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Yaklaşan sınavlarını ekleyerek gün sayımını takip edebilirsin.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
            >
              + Sınav Ekle
            </button>
          </div>
        ) : (
          upcomingExams.map((exam) => {
            const daysLeft = getDaysLeft(exam.date);
            const countdown = formatDaysCountdown(daysLeft);

            return (
              <div
                key={exam.id}
                className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-3xl p-4 transition-all duration-200 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white tracking-tight">
                        {exam.lessonName}
                      </h4>
                      <span className="text-xs px-2 py-0.5 bg-slate-700/60 text-slate-300 rounded-md font-medium">
                        {exam.examType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-300 pt-0.5">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatTurkishDate(exam.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.time}</span>
                      </div>
                    </div>

                    {exam.description && (
                      <p className="text-xs text-slate-400 mt-1.5 flex items-start gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span>{exam.description}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${countdown.badge}`}>
                      {countdown.text}
                    </span>

                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                      title="Sınavı sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Past Exams Collapsible */}
      {pastExams.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Tamamlanan / Geçmiş Sınavlar ({pastExams.length})
          </h3>
          {pastExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-400"
            >
              <div>
                <span className="font-semibold text-slate-300">{exam.lessonName}</span> ({exam.examType})
                <span className="text-slate-500 ml-2">• {formatTurkishDate(exam.date)}</span>
              </div>
              <button
                onClick={() => deleteExam(exam.id)}
                className="p-1 text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Exam Modal */}
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
                <h3 className="text-base font-bold text-white">Yeni Sınav Ekle</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ders Adı *</label>
                  <select
                    value={lessonName}
                    onChange={(e) => setLessonName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {uniqueLessons.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sınav Türü</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {EXAM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tarih *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Saat</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Konular / Açıklama
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Örn: 1. ve 2. ünite dahil, formüllere dikkat..."
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
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
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-rose-500/25"
                  >
                    Sınavı Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
