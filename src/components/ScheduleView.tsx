import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Lesson, DayOfWeek } from "../types";
import {
  DAY_NAMES,
  SHORT_DAY_NAMES,
  getCurrentDayOfWeek,
  parseTimeToMinutes,
} from "../utils/dateHelpers";
import { Plus, Trash2, Edit2, Clock, MapPin, User, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#14b8a6", // Teal
  "#ef4444", // Rose
];

export const ScheduleView: React.FC = () => {
  const { lessons, addLesson, updateLesson, deleteLesson } = useApp();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getCurrentDayOfWeek());
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [classroom, setClassroom] = useState("");
  const [startTime, setStartTime] = useState("08:30");
  const [endTime, setEndTime] = useState("09:15");
  const [color, setColor] = useState("#6366f1");
  const [day, setDay] = useState<DayOfWeek>(selectedDay);

  const openAddModal = (targetDay?: DayOfWeek) => {
    setEditingLessonId(null);
    setName("");
    setTeacher("");
    setClassroom("10/A");
    setStartTime("08:30");
    setEndTime("09:15");
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setDay(targetDay || selectedDay);
    setIsModalOpen(true);
  };

  const openEditModal = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setName(lesson.name);
    setTeacher(lesson.teacher);
    setClassroom(lesson.classroom);
    setStartTime(lesson.startTime);
    setEndTime(lesson.endTime);
    setColor(lesson.color);
    setDay(lesson.day);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingLessonId) {
      updateLesson(editingLessonId, {
        name: name.trim(),
        teacher: teacher.trim(),
        classroom: classroom.trim(),
        startTime,
        endTime,
        color,
        day,
      });
    } else {
      addLesson({
        name: name.trim(),
        teacher: teacher.trim(),
        classroom: classroom.trim(),
        startTime,
        endTime,
        color,
        day,
      });
    }
    setIsModalOpen(false);
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayDay = getCurrentDayOfWeek();

  const isCurrentLesson = (lesson: Lesson) => {
    if (lesson.day !== todayDay) return false;
    const s = parseTimeToMinutes(lesson.startTime);
    const e = parseTimeToMinutes(lesson.endTime);
    return currentMinutes >= s && currentMinutes <= e;
  };

  // Day filter
  const dayLessons = lessons
    .filter((l) => l.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const weekDays: DayOfWeek[] = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* Top Controls: View Mode & Add Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center p-1 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
          <button
            onClick={() => setViewMode("daily")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              viewMode === "daily"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Günlük Görünüm
          </button>
          <button
            onClick={() => setViewMode("weekly")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              viewMode === "weekly"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Haftalık Görünüm
          </button>
        </div>

        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-2xl shadow-lg shadow-indigo-500/20 hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Ders Ekle</span>
        </button>
      </div>

      {/* Day Selector (for Daily View) */}
      {viewMode === "daily" && (
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {weekDays.map((d) => {
            const isSelected = selectedDay === d;
            const isToday = todayDay === d;
            const count = lessons.filter((l) => l.day === d).length;

            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`flex-1 min-w-[62px] py-2.5 px-2 rounded-2xl text-center border transition relative ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20"
                    : "bg-slate-800/70 text-slate-300 border-slate-700/60 hover:bg-slate-800"
                }`}
              >
                {isToday && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
                )}
                <span className="block text-[11px] font-semibold">{SHORT_DAY_NAMES[d]}</span>
                <span
                  className={`block text-[10px] mt-0.5 ${
                    isSelected ? "text-indigo-200" : "text-slate-400"
                  }`}
                >
                  {count} ders
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Daily View List */}
      {viewMode === "daily" && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {DAY_NAMES[selectedDay]} Ders Programı ({dayLessons.length} Ders)
            </h3>
            {selectedDay === todayDay && (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Bugün
              </span>
            )}
          </div>

          {dayLessons.length === 0 ? (
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-8 text-center">
              <p className="text-sm font-semibold text-slate-300">
                {DAY_NAMES[selectedDay]} günü için henüz ders programı eklemedin.
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Yeni bir ders eklemek için butona dokun.
              </p>
              <button
                onClick={() => openAddModal()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
              >
                + İlk Dersi Ekle
              </button>
            </div>
          ) : (
            dayLessons.map((lesson) => {
              const active = isCurrentLesson(lesson);

              return (
                <div
                  key={lesson.id}
                  className={`border rounded-3xl p-4 transition-all duration-300 relative overflow-hidden backdrop-blur-sm ${
                    active
                      ? "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10"
                      : "bg-slate-800/80 border-slate-700/80 hover:border-slate-600"
                  }`}
                >
                  {/* Left colored bar indicator */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: lesson.color }}
                  />

                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: lesson.color }}
                        />
                        <h4 className="text-base font-bold text-white tracking-tight">
                          {lesson.name}
                        </h4>
                        {active && (
                          <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">
                            ŞİMDİ
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-0.5">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {lesson.startTime} – {lesson.endTime}
                          </span>
                        </div>
                        {lesson.teacher && (
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lesson.teacher}</span>
                          </div>
                        )}
                        {lesson.classroom && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="px-1.5 py-0.2 bg-slate-700/70 text-slate-300 rounded text-[11px] font-medium">
                              {lesson.classroom}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(lesson)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/50 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteLesson(lesson.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Weekly View (Table/Card Columns) */}
      {viewMode === "weekly" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {weekDays.map((d) => {
              const dayItems = lessons
                .filter((l) => l.day === d)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
              const isToday = todayDay === d;

              return (
                <div
                  key={d}
                  className={`bg-slate-800/80 border rounded-3xl p-3.5 ${
                    isToday ? "border-indigo-500/50 ring-1 ring-indigo-500/30" : "border-slate-700/80"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {DAY_NAMES[d]}
                      {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </span>
                    <button
                      onClick={() => openAddModal(d)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs p-1"
                      title="Bu güne ders ekle"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {dayItems.length === 0 ? (
                      <p className="text-[11px] text-slate-500 py-3 text-center">Ders yok</p>
                    ) : (
                      dayItems.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="p-2 rounded-xl text-xs border"
                          style={{
                            backgroundColor: `${lesson.color}15`,
                            borderColor: `${lesson.color}35`,
                          }}
                        >
                          <div className="flex items-center justify-between font-bold text-white">
                            <span className="truncate">{lesson.name}</span>
                            <span className="text-[10px] text-slate-300 font-normal">
                              {lesson.startTime}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1">
                            <span className="truncate">{lesson.teacher}</span>
                            <span className="px-1 rounded bg-slate-900/40">{lesson.classroom}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Lesson Modal */}
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
                <h3 className="text-base font-bold text-white">
                  {editingLessonId ? "Dersi Düzenle" : "Yeni Ders Ekle"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ders Adı *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Matematik"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Öğretmen</label>
                    <input
                      type="text"
                      value={teacher}
                      onChange={(e) => setTeacher(e.target.value)}
                      placeholder="Örn: Ahmet Hoca"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Sınıf / Derslik</label>
                    <input
                      type="text"
                      value={classroom}
                      onChange={(e) => setClassroom(e.target.value)}
                      placeholder="Örn: 10/A veya Lab 1"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Gün</label>
                    <select
                      value={day}
                      onChange={(e) => setDay(Number(e.target.value) as DayOfWeek)}
                      className="w-full px-2.5 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {weekDays.map((d) => (
                        <option key={d} value={d}>
                          {DAY_NAMES[d]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Başlangıç</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-2 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Bitiş</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-2 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                    />
                  </div>
                </div>

                {/* Color presets */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ders Rengi
                  </label>
                  <div className="flex items-center gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setColor(c)}
                        className="w-7 h-7 rounded-full transition-transform flex items-center justify-center"
                        style={{ backgroundColor: c }}
                      >
                        {color === c && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
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
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-indigo-500/25"
                  >
                    Kaydet
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
