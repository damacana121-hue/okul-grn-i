import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { StudyPlanTemplate } from "../types";
import {
  PRESET_STUDY_TEMPLATES,
  getCustomStudyTemplates,
  saveCustomStudyTemplate,
  deleteCustomStudyTemplate,
} from "../data/studyTemplates";
import { formatMinutesToTimeString } from "../utils/dateHelpers";
import {
  Flame,
  Plus,
  Trash2,
  TrendingUp,
  Clock,
  BookOpen,
  Play,
  CheckCircle2,
  Sparkles,
  Layers,
  Calendar,
  Zap,
  Target,
  Check,
  X,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

export const StudyPlanView: React.FC = () => {
  const {
    studyGoals,
    updateStudyGoal,
    addStudyGoal,
    deleteStudyGoal,
    applyStudyPlanTemplate,
    studyLogs,
    logStudyTime,
    setActiveTab,
    setPomodoroState,
    lessons,
  } = useApp();

  const [newGoalSubject, setNewGoalSubject] = useState("");
  const [newGoalMinutes, setNewGoalMinutes] = useState(45);
  const [quickLogSubject, setQuickLogSubject] = useState(
    studyGoals[0]?.lessonName || lessons[0]?.name || "Matematik"
  );
  const [quickLogMinutes, setQuickLogMinutes] = useState(30);

  // Templates state
  const [customTemplates, setCustomTemplates] = useState<StudyPlanTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("final-week-intensive");
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  // Custom template form state
  const [customTitle, setCustomTitle] = useState("");
  const [customPeriod, setCustomPeriod] = useState("Final Haftası");
  const [customDescription, setCustomDescription] = useState("");
  const [customPomodoro, setCustomPomodoro] = useState("30 dk ders + 5 dk mola");
  const [customItems, setCustomItems] = useState<{ lessonName: string; targetMinutes: number }[]>([
    { lessonName: "Matematik", targetMinutes: 50 },
    { lessonName: "Fizik", targetMinutes: 45 },
  ]);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setCustomTemplates(getCustomStudyTemplates());
  }, []);

  const allTemplates: StudyPlanTemplate[] = [...customTemplates, ...PRESET_STUDY_TEMPLATES];
  const selectedTemplate =
    allTemplates.find((t) => t.id === selectedTemplateId) || allTemplates[0];

  // Calculate today's studied minutes per subject
  const todayLogs = studyLogs.filter((l) => l.date === todayStr);
  const totalTodayMinutes = todayLogs.reduce((acc, curr) => acc + curr.minutes, 0);

  const totalGoalMinutes = studyGoals.reduce((acc, g) => acc + g.targetMinutes, 0) || 60;
  const overallPercent = Math.min(100, Math.round((totalTodayMinutes / totalGoalMinutes) * 100));

  // Weekly study data for the Bar Chart
  const getLast7DaysData = () => {
    const days = [];
    const dayLabels = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cts"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = dayLabels[d.getDay()];

      const minutes = studyLogs
        .filter((l) => l.date === dateStr)
        .reduce((sum, curr) => sum + curr.minutes, 0);

      days.push({
        date: dateStr,
        day: dayName,
        minutes,
        isToday: i === 0,
      });
    }
    return days;
  };

  const chartData = getLast7DaysData();
  const totalWeeklyMinutes = chartData.reduce((acc, d) => acc + d.minutes, 0);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalSubject.trim()) return;
    addStudyGoal(newGoalSubject.trim(), Number(newGoalMinutes) || 30);
    setNewGoalSubject("");
  };

  const handleQuickLog = (e: React.FormEvent) => {
    e.preventDefault();
    logStudyTime(quickLogSubject, Number(quickLogMinutes) || 15);
  };

  const startPomodoroForSubject = (subject: string, minutes: number) => {
    setPomodoroState((prev) => ({
      ...prev,
      activeSubject: subject,
      timeLeft: minutes * 60,
      isRunning: true,
      mode: "work",
    }));
    setActiveTab("pomodoro");
  };

  const handleApplyTemplate = (replace: boolean) => {
    if (!selectedTemplate) return;
    applyStudyPlanTemplate(selectedTemplate.items, replace, selectedTemplate.title);
    setAppliedFeedback(replace ? "Şablon hedeflerinize yüklendi! 🎯" : "Hedeflerinize eklendi! ✨");
    setTimeout(() => setAppliedFeedback(null), 3000);
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomStudyTemplate(id);
    const updated = getCustomStudyTemplates();
    setCustomTemplates(updated);
    if (selectedTemplateId === id) {
      setSelectedTemplateId("tpl_final_week");
    }
  };

  const handleAddCustomItem = () => {
    setCustomItems([...customItems, { lessonName: "Yeni Ders", targetMinutes: 40 }]);
  };

  const handleRemoveCustomItem = (idx: number) => {
    setCustomItems(customItems.filter((_, i) => i !== idx));
  };

  const handleSaveCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || customItems.length === 0) return;

    const totalDurationMinutes = customItems.reduce((acc, c) => acc + c.targetMinutes, 0);
    const newTpl: StudyPlanTemplate = {
      id: "custom_tpl_" + Date.now(),
      title: customTitle.trim(),
      description: customDescription.trim() || "Öğrenciye özel hazırlanmış çalışma planı.",
      badge: customPeriod,
      icon: "Target",
      totalDurationMinutes,
      pomodoroAdvice: customPomodoro.trim() || "25 dk ders + 5 dk mola",
      isCustom: true,
      items: customItems.map((item) => ({
        lessonName: item.lessonName.trim(),
        targetMinutes: Number(item.targetMinutes) || 30,
      })),
    };

    saveCustomStudyTemplate(newTpl);
    const updated = getCustomStudyTemplates();
    setCustomTemplates(updated);
    setSelectedTemplateId(newTpl.id);
    setIsCustomModalOpen(false);

    // Reset form
    setCustomTitle("");
    setCustomDescription("");
  };

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* 1. Header Streak & Goal Summary */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-indigo-950/60 to-slate-900/80 border border-emerald-500/30 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              GÜNLÜK ÇALIŞMA PLANI
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                {formatMinutesToTimeString(totalTodayMinutes)}
              </h2>
              <span className="text-xs text-slate-400">
                / {formatMinutesToTimeString(totalGoalMinutes)} hedef
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Hedefin %{overallPercent} kadarı tamamlandı
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-300 font-extrabold text-sm">
              <Flame className="w-5 h-5 fill-amber-400 text-amber-400 animate-bounce" />
              <span>3 Gün Seri</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Seriyi bozma! 🔥</span>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mt-4">
          <div
            className="bg-gradient-to-r from-emerald-400 to-teal-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Sınav Dönemine Özel Hazır Çalışma Şablonları */}
      <div className="bg-slate-800/80 border border-purple-500/30 rounded-3xl p-4 sm:p-5 backdrop-blur-sm space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-extrabold text-white tracking-tight">
                Sınav Dönemi ve Çalışma Şablonları
              </h3>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Final haftası, günlük tekrar veya hafta sonu kampları için uzman planlar
            </p>
          </div>

          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Özel Şablon Oluştur</span>
          </button>
        </div>

        {/* Template Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {allTemplates.map((tpl) => {
            const isSelected = tpl.id === selectedTemplateId;
            return (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-2 border ${
                  isSelected
                    ? "bg-purple-600/30 text-purple-200 border-purple-500 shadow-md shadow-purple-500/20"
                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-700/60"
                }`}
              >
                <span>{tpl.badge === "Final Haftası" || tpl.badge === "Sınav Dönemi" ? "🎯" : tpl.badge === "Günlük Tekrar" || tpl.badge === "Hafta İçi Rutini" ? "📖" : tpl.badge === "Hafta Sonu" ? "🚀" : "⚡"}</span>
                <span>{tpl.title}</span>
                {tpl.isCustom && (
                  <span
                    onClick={(e) => handleDeleteCustom(tpl.id, e)}
                    className="p-0.5 text-slate-400 hover:text-rose-400 rounded transition"
                    title="Şablonu Sil"
                  >
                    <Trash2 className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Template Detail Card */}
        {selectedTemplate && (
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md text-[10px] font-bold uppercase">
                    {selectedTemplate.badge}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Toplam {formatMinutesToTimeString(selectedTemplate.totalDurationMinutes)}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-white mt-1">
                  {selectedTemplate.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedTemplate.description}
                </p>
              </div>

              {/* Pomodoro Advice */}
              {selectedTemplate.pomodoroAdvice && (
                <div className="px-3 py-1.5 bg-rose-500/15 border border-rose-500/25 rounded-xl text-rose-300 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>{selectedTemplate.pomodoroAdvice}</span>
                </div>
              )}
            </div>

            {/* Included Lesson Breakdown */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                Şablondaki Dersler ve Hedef Süreler:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedTemplate.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-2.5 py-1 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="font-semibold">{item.lessonName}</span>
                    <span className="text-slate-400 text-[11px]">({item.targetMinutes} dk)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-400">
                {appliedFeedback ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {appliedFeedback}
                  </span>
                ) : (
                  <span>Bu şablonu aktif günlük hedeflerine aktarabilirsin.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
                  title="Mevcut hedeflerini koruyarak üzerine ekler"
                >
                  + Hedeflerime Ekle
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyTemplate(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/25 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Bu Şablonu Uygula (Yenile)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Weekly Bar Chart */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Haftalık Çalışma Grafiği (Son 7 Gün)
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-300">
            Toplam: {formatMinutesToTimeString(totalWeeklyMinutes)}
          </span>
        </div>

        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="day"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: any) => `${val} dk`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "1rem",
                  fontSize: "12px",
                  color: "#f8fafc",
                }}
                formatter={(val: any) => [`${val} dakika`, "Çalışma Süresi"]}
                labelFormatter={(label: any) => `${label} günü`}
              />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isToday ? "#10b981" : "#6366f1"}
                    opacity={entry.minutes > 0 ? 1 : 0.25}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Daily Goals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Aktif Günlük Çalışma Hedeflerin ({studyGoals.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Toplam: {formatMinutesToTimeString(totalGoalMinutes)}
          </span>
        </div>

        <div className="space-y-2.5">
          {studyGoals.length === 0 ? (
            <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-3xl p-6 text-center">
              <p className="text-xs text-slate-400">Henüz aktif bir çalışma hedefi eklemedin.</p>
              <button
                onClick={() => handleApplyTemplate(true)}
                className="mt-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition"
              >
                Yukarıdaki "{selectedTemplate?.title}" şablonunu uygula 🚀
              </button>
            </div>
          ) : (
            studyGoals.map((goal) => {
              const subjectLogs = todayLogs.filter((l) => l.lessonName === goal.lessonName);
              const studied = subjectLogs.reduce((acc, curr) => acc + curr.minutes, 0);
              const percent = Math.min(100, Math.round((studied / goal.targetMinutes) * 100));
              const isCompleted = studied >= goal.targetMinutes;

              return (
                <div
                  key={goal.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-500" />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-white">{goal.lessonName}</h4>
                        <p className="text-xs text-slate-400">
                          {studied} dk / {goal.targetMinutes} dk hedef
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Launch Pomodoro with this subject */}
                      <button
                        onClick={() => startPomodoroForSubject(goal.lessonName, 25)}
                        className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                        title="Pomodoro ile Başla"
                      >
                        <Play className="w-3 h-3 fill-rose-300" />
                        <span>Pomodoro</span>
                      </button>

                      <button
                        onClick={() => deleteStudyGoal(goal.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                        title="Hedefi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full bg-slate-700/60 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted ? "bg-emerald-400" : "bg-indigo-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Goal Form */}
        <form
          onSubmit={handleAddGoal}
          className="bg-slate-900/60 border border-slate-700/60 rounded-3xl p-3.5 flex items-center gap-2"
        >
          <input
            type="text"
            required
            value={newGoalSubject}
            onChange={(e) => setNewGoalSubject(e.target.value)}
            placeholder="Ders adı (örn: Biyoloji)"
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <input
            type="number"
            min="5"
            max="300"
            value={newGoalMinutes}
            onChange={(e) => setNewGoalMinutes(Number(e.target.value))}
            className="w-16 px-2 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 text-center font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <span className="text-xs text-slate-400">dk</span>
          <button
            type="submit"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ekle</span>
          </button>
        </form>
      </div>

      {/* 5. Quick Manual Study Log */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 backdrop-blur-sm">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Hızlı Çalışma Süresi Kaydet
        </h4>
        <form onSubmit={handleQuickLog} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={quickLogSubject}
            onChange={(e) => setQuickLogSubject(e.target.value)}
            placeholder="Ders adı"
            className="flex-1 min-w-[120px] px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <input
            type="number"
            min="5"
            max="300"
            value={quickLogMinutes}
            onChange={(e) => setQuickLogMinutes(Number(e.target.value))}
            className="w-16 px-2 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 text-center font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <span className="text-xs text-slate-400">dakika çalıştım</span>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
          >
            Kaydet
          </button>
        </form>
      </div>

      {/* Custom Template Modal */}
      <AnimatePresence>
        {isCustomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Yeni Çalışma Planı Şablonu
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sınav dönemine veya hedeflerine göre kendi şablonunu oluştur
                  </p>
                </div>
                <button
                  onClick={() => setIsCustomModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCustomTemplate} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Şablon Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Örn: 1. Dönem Final Haftası Sözel Kampı"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Dönem / Kategori Rozeti
                    </label>
                    <select
                      value={customPeriod}
                      onChange={(e) => setCustomPeriod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="Final Haftası">Final Haftası</option>
                      <option value="Vize / 1. Yazılı">Vize / 1. Yazılı</option>
                      <option value="Günlük Tekrar">Günlük Tekrar</option>
                      <option value="Hafta Sonu">Hafta Sonu</option>
                      <option value="LGS / YKS">LGS / YKS Kampı</option>
                      <option value="Özel">Özel Plan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Pomodoro Önerisi
                    </label>
                    <input
                      type="text"
                      value={customPomodoro}
                      onChange={(e) => setCustomPomodoro(e.target.value)}
                      placeholder="Örn: 40 dk ders + 10 dk mola"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Açıklama / Strateji
                  </label>
                  <textarea
                    rows={2}
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Bu planda ağırlıklı soru çözümü ve konu tekrarları hedeflenir..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Dynamic Lesson Items */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Dersler ve Hedef Süreler ({customItems.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCustomItem}
                      className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Ders Ekle</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={item.lessonName}
                          onChange={(e) => {
                            const next = [...customItems];
                            next[idx].lessonName = e.target.value;
                            setCustomItems(next);
                          }}
                          placeholder="Ders adı"
                          className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <input
                          type="number"
                          min="5"
                          max="300"
                          value={item.targetMinutes}
                          onChange={(e) => {
                            const next = [...customItems];
                            next[idx].targetMinutes = Number(e.target.value);
                            setCustomItems(next);
                          }}
                          className="w-20 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs text-center font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <span className="text-xs text-slate-400">dk</span>
                        {customItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomItem(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/25"
                  >
                    Şablonu Kaydet
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
