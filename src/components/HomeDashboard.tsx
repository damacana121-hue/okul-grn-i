import React from "react";
import { useApp } from "../context/AppContext";
import {
  Sparkles,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  Briefcase,
  Timer,
  ChevronRight,
  Calculator,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Flame,
} from "lucide-react";
import {
  getCurrentDayOfWeek,
  getTomorrowDayOfWeek,
  DAY_NAMES,
  getDaysLeft,
  formatDaysCountdown,
  parseTimeToMinutes,
  formatTurkishDate,
  formatMinutesToTimeString,
} from "../utils/dateHelpers";
import { motion } from "motion/react";

export const HomeDashboard: React.FC = () => {
  const {
    profile,
    lessons,
    exams,
    homeworks,
    bagItems,
    studyGoals,
    studyLogs,
    setActiveTab,
  } = useApp();

  const currentDay = getCurrentDayOfWeek();
  const tomorrowDay = getTomorrowDayOfWeek();

  // Filter lessons for today
  const todayLessons = lessons
    .filter((l) => l.day === currentDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Determine current lesson ("Şimdi") & next lesson ("Sonraki")
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let activeLesson = todayLessons.find((l) => {
    const s = parseTimeToMinutes(l.startTime);
    const e = parseTimeToMinutes(l.endTime);
    return currentMinutes >= s && currentMinutes <= e;
  });

  // Next lesson
  let nextLesson = todayLessons.find((l) => {
    const s = parseTimeToMinutes(l.startTime);
    return s > currentMinutes;
  });

  // If no active lesson currently running, pick the nearest upcoming or first of the day
  if (!activeLesson && nextLesson) {
    // There is an upcoming lesson soon
  } else if (!activeLesson && todayLessons.length > 0 && currentMinutes < parseTimeToMinutes(todayLessons[0].startTime)) {
    nextLesson = todayLessons[0];
  }

  // Filter nearest upcoming exam
  const upcomingExams = [...exams]
    .filter((e) => getDaysLeft(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nearestExam = upcomingExams[0];

  // Filter nearest upcoming homework
  const upcomingHomeworks = [...homeworks]
    .filter((h) => !h.isCompleted && getDaysLeft(h.dueDate) >= 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const nearestHomework = upcomingHomeworks[0];

  // Tomorrow's lessons and bag status
  const tomorrowLessons = lessons.filter((l) => l.day === tomorrowDay);
  const tomorrowBagItems = bagItems.filter((b) => b.days.includes(tomorrowDay));
  const packedTomorrowCount = tomorrowBagItems.filter((b) => b.packed).length;
  const isBagReady = tomorrowBagItems.length > 0 && packedTomorrowCount === tomorrowBagItems.length;

  // Study target progress for today
  const todayDateStr = new Date().toISOString().split("T")[0];
  const todayStudyMinutes = studyLogs
    .filter((l) => l.date === todayDateStr)
    .reduce((acc, curr) => acc + curr.minutes, 0);

  const totalDailyTarget = studyGoals.reduce((acc, g) => acc + g.targetMinutes, 0) || 60;
  const studyProgressPercent = Math.min(100, Math.round((todayStudyMinutes / totalDailyTarget) * 100));

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* 1. Header Greeting Card */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-500/20 rounded-3xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              {DAY_NAMES[currentDay]} • {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
              Merhaba {profile.name ? `${profile.name} ` : ""}👋
            </h2>
            <p className="text-sm text-slate-300 mt-1">Bugün seni neler bekliyor?</p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-xs font-semibold text-indigo-300">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{studyLogs.length > 0 ? `${new Set(studyLogs.map(l => l.date)).size} Günlük Seri` : "Yeni Başlangıç"}</span>
          </div>
        </div>

        {/* Quick stat chips row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-indigo-500/15">
          <div className="bg-slate-800/50 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-medium block">Ders Sayısı</span>
            <span className="text-base font-bold text-slate-100">{todayLessons.length} ders</span>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-medium block">Bekleyen Ödev</span>
            <span className="text-base font-bold text-amber-300">{upcomingHomeworks.length} ödev</span>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-medium block">Sınavlar</span>
            <span className="text-base font-bold text-purple-300">{upcomingExams.length} sınav</span>
          </div>
        </div>
      </div>

      {/* Quick Setup Prompt if user hasn't added lessons yet */}
      {lessons.length === 0 && (
        <div
          onClick={() => setActiveTab("schedule")}
          className="cursor-pointer bg-slate-800/90 border border-dashed border-indigo-500/50 hover:border-indigo-400 rounded-3xl p-4 transition flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
              📚
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Ders Programını Oluştur</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                İlk dersini ekleyerek günlerini ve saatlerini takip etmeye başla.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shrink-0">
            Ders Ekle
          </span>
        </div>
      )}

      {/* 2. Prominent AI Consultant Banner / Button */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setActiveTab("ai")}
        className="cursor-pointer bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white rounded-3xl p-4 shadow-lg shadow-purple-500/20 flex items-center justify-between gap-3 border border-purple-400/30 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight">🤖 Yapay Zekâ Danışmanı</h3>
              <span className="text-[10px] bg-yellow-400 text-slate-950 font-extrabold px-1.5 py-0.5 rounded-full">
                CANLI
              </span>
            </div>
            <p className="text-xs text-purple-100/90 line-clamp-1 mt-0.5">
              "Bugün 2 saatim var, bana çalışma planı hazırla..."
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <ChevronRight className="w-4 h-4 text-white" />
        </div>
      </motion.div>

      {/* 3. Section: Şimdi & Sonraki Ders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Şimdi (Active Lesson) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              📚 ŞİMDİ
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {activeLesson ? `${activeLesson.startTime} – ${activeLesson.endTime}` : "Ders Yok"}
            </span>
          </div>

          {activeLesson ? (
            <div>
              <h4 className="text-lg font-bold text-white tracking-tight">{activeLesson.name}</h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-300">
                <span>Öğretmen: {activeLesson.teacher}</span>
                <span>•</span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-medium">
                  {activeLesson.classroom}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <p className="text-sm font-medium text-slate-300">Şu anda aktif bir dersin yok.</p>
              <p className="text-xs text-slate-500 mt-0.5">Mola vakti veya okul saati dışındasın.</p>
            </div>
          )}
        </div>

        {/* Sonraki Ders */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 tracking-wide">
              ⏳ SONRAKİ DERS
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {nextLesson ? `${nextLesson.startTime} – ${nextLesson.endTime}` : "—"}
            </span>
          </div>

          {nextLesson ? (
            <div>
              <h4 className="text-lg font-bold text-white tracking-tight">{nextLesson.name}</h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-300">
                <span>Öğretmen: {nextLesson.teacher}</span>
                <span>•</span>
                <span className="px-2 py-0.5 bg-slate-700/60 text-slate-300 rounded font-medium">
                  {nextLesson.classroom}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <p className="text-sm font-medium text-slate-300">Bugün başka dersin kalmadı.</p>
              <p className="text-xs text-emerald-400 mt-0.5">Dinlenebilir veya ödevlerine bakabilirsin!</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Yaklaşan Sınav & Yaklaşan Ödev Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Yaklaşan Sınav */}
        <div
          onClick={() => setActiveTab("exams")}
          className="cursor-pointer bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-3xl p-4 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
              <Calendar className="w-3.5 h-3.5" />
              📅 YAKLAŞAN SINAV
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition" />
          </div>

          {nearestExam ? (
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white tracking-tight">{nearestExam.lessonName}</h4>
                {(() => {
                  const countdown = formatDaysCountdown(getDaysLeft(nearestExam.date));
                  return (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${countdown.badge}`}>
                      {countdown.text}
                    </span>
                  );
                })()}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {nearestExam.examType} • {formatTurkishDate(nearestExam.date)} ({nearestExam.time})
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-1">Yaklaşan sınav bulunmuyor. Rahat bir nefes al!</p>
          )}
        </div>

        {/* Yaklaşan Ödev */}
        <div
          onClick={() => setActiveTab("homework")}
          className="cursor-pointer bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-3xl p-4 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <CheckSquare className="w-3.5 h-3.5" />
              📝 YAKLAŞAN ÖDEV
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition" />
          </div>

          {nearestHomework ? (
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white tracking-tight truncate max-w-[170px]">
                  {nearestHomework.title}
                </h4>
                {(() => {
                  const daysLeft = getDaysLeft(nearestHomework.dueDate);
                  const countdown = formatDaysCountdown(daysLeft);
                  return (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${countdown.badge}`}>
                      {countdown.text}
                    </span>
                  );
                })()}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {nearestHomework.lessonName} • Son teslim: {formatTurkishDate(nearestHomework.dueDate)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-1">Henüz bekleyen bir ödevin yok. Harikasın!</p>
          )}
        </div>
      </div>

      {/* 5. Günlük Çalışma Hedefi & Akıllı Çanta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Günlük Çalışma Hedefi */}
        <div
          onClick={() => setActiveTab("study")}
          className="cursor-pointer bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-3xl p-4 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              🎯 GÜNLÜK ÇALIŞMA HEDEFİ
            </span>
            <span className="text-xs font-bold text-slate-200">
              {todayStudyMinutes} / {totalDailyTarget} dk
            </span>
          </div>

          <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden my-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${studyProgressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{studyProgressPercent >= 100 ? "Hedef tamamlandı! 🏆" : `${totalDailyTarget - todayStudyMinutes} dk kaldı`}</span>
            <span className="font-semibold text-emerald-300">%{studyProgressPercent}</span>
          </div>
        </div>

        {/* Çanta Hazırlama Durumu */}
        <div
          onClick={() => setActiveTab("bag")}
          className="cursor-pointer bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-3xl p-4 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
              <Briefcase className="w-3.5 h-3.5" />
              🎒 YARIN ({DAY_NAMES[tomorrowDay]})
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded-md">
              {tomorrowLessons.length} ders
            </span>
          </div>

          <div className="flex items-center justify-between mt-1">
            <p className="text-sm font-semibold text-white">
              {isBagReady ? "Çantan hazır! 🎒✨" : "Çantanı hazırlamayı unutma!"}
            </p>
            {isBagReady ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {packedTomorrowCount} / {tomorrowBagItems.length} malzeme çantaya konuldu.
          </p>
        </div>
      </div>

      {/* 6. Quick Action Tools Row */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
          Hızlı Araçlar
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setActiveTab("pomodoro")}
            className="flex flex-col items-center justify-center p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-2xl transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center mb-1 group-hover:scale-105 transition">
              <Timer className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200">Pomodoro</span>
          </button>

          <button
            onClick={() => setActiveTab("grades")}
            className="flex flex-col items-center justify-center p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-2xl transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-1 group-hover:scale-105 transition">
              <Calculator className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200">Notlar</span>
          </button>

          <button
            onClick={() => setActiveTab("study")}
            className="flex flex-col items-center justify-center p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-2xl transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-1 group-hover:scale-105 transition">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200">Çalışma</span>
          </button>

          <button
            onClick={() => setActiveTab("bag")}
            className="flex flex-col items-center justify-center p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-2xl transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center mb-1 group-hover:scale-105 transition">
              <Briefcase className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200">Çanta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
