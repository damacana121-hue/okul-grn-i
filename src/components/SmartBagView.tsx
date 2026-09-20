import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { BagItem, DayOfWeek } from "../types";
import {
  getTomorrowDayOfWeek,
  getCurrentDayOfWeek,
  DAY_NAMES,
} from "../utils/dateHelpers";
import {
  Briefcase,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  CheckCheck,
  Calendar,
} from "lucide-react";

export const SmartBagView: React.FC = () => {
  const {
    bagItems,
    toggleBagItem,
    addBagItem,
    deleteBagItem,
    packAllTomorrowItems,
    resetBagItems,
    lessons,
    addNotification,
  } = useApp();

  const tomorrowDay = getTomorrowDayOfWeek();
  const currentDay = getCurrentDayOfWeek();

  const [activeDayTab, setActiveDayTab] = useState<DayOfWeek>(tomorrowDay);
  const [newItemName, setNewItemName] = useState("");
  const [newLessonName, setNewLessonName] = useState("Genel");
  const [newCategory, setNewCategory] = useState<BagItem["category"]>("kitap");

  // Lessons for the active day tab
  const dayLessons = lessons.filter((l) => l.day === activeDayTab);
  const dayBagItems = bagItems.filter((b) => b.days.includes(activeDayTab));

  const packedCount = dayBagItems.filter((b) => b.packed).length;
  const isAllPacked = dayBagItems.length > 0 && packedCount === dayBagItems.length;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addBagItem({
      itemName: newItemName.trim(),
      lessonName: newLessonName,
      category: newCategory,
      days: [activeDayTab],
      packed: false,
    });

    setNewItemName("");
  };

  const sendBagReminder = () => {
    addNotification(
      "Yarın için çantan hazır mı? 🎒",
      `Yarın ${dayLessons.length} dersin var. Malzemelerini kontrol etmeyi unutma!`,
      "bag"
    );
  };

  const weekDays: DayOfWeek[] = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* 1. Header & Status Card */}
      <div className="bg-gradient-to-r from-sky-950/60 via-indigo-950/60 to-slate-900/80 border border-sky-500/30 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wide flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              AKILLI OKUL ÇANTASI
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              {activeDayTab === tomorrowDay ? "Yarınki Çantan 🎒" : `${DAY_NAMES[activeDayTab]} Çantası`}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {dayLessons.length} ders için {dayBagItems.length} malzeme gerekiyor
            </p>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 rounded-2xl border text-xs font-bold ${
                isAllPacked
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
              }`}
            >
              {isAllPacked ? "✅ Çanta Hazır!" : "⏳ Hazırlanıyor"}
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {packedCount} / {dayBagItems.length} tamamlandı
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 mt-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-400 to-indigo-400 h-2.5 rounded-full transition-all duration-300"
            style={{
              width: `${dayBagItems.length ? (packedCount / dayBagItems.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {weekDays.map((d) => {
          const isSelected = activeDayTab === d;
          const isTomorrow = tomorrowDay === d;

          return (
            <button
              key={d}
              onClick={() => setActiveDayTab(d)}
              className={`flex-1 min-w-[62px] py-2 px-1.5 rounded-2xl text-center border transition relative ${
                isSelected
                  ? "bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-500/20"
                  : "bg-slate-800/70 text-slate-300 border-slate-700/60 hover:bg-slate-800"
              }`}
            >
              <span className="block text-[11px] font-semibold">{DAY_NAMES[d]}</span>
              {isTomorrow && (
                <span className="inline-block text-[9px] font-bold px-1.5 bg-amber-400 text-slate-950 rounded-full mt-0.5">
                  Yarın
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bulk Action Buttons */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => packAllTomorrowItems()}
          className="flex-1 py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Tümünü Çantaya Koy</span>
        </button>

        <button
          onClick={() => resetBagItems()}
          className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          title="Listeyi Sıfırla"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Sıfırla</span>
        </button>
      </div>

      {/* Day's Lessons Reminder Strip */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          {DAY_NAMES[activeDayTab]} Günü Derslerin:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {dayLessons.length === 0 ? (
            <span className="text-xs text-slate-500">Bu güne ders eklenmemiş.</span>
          ) : (
            dayLessons.map((l) => (
              <span
                key={l.id}
                className="text-xs px-2 py-0.5 rounded-lg border font-medium text-white"
                style={{
                  backgroundColor: `${l.color}15`,
                  borderColor: `${l.color}40`,
                }}
              >
                {l.name}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Checklist of Bag Items */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Gereken Malzemeler ({dayBagItems.length})
        </h3>

        {dayBagItems.length === 0 ? (
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 text-center">
            <p className="text-sm font-semibold text-slate-300">
              Bu gün için henüz çanta malzemesi eklenmedi.
            </p>
            <p className="text-xs text-slate-500 mt-1">Aşağıdan kitap veya defter ekleyebilirsin.</p>
          </div>
        ) : (
          dayBagItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleBagItem(item.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                item.packed
                  ? "bg-slate-900/60 border-slate-800 text-slate-400"
                  : "bg-slate-800/80 border-slate-700/80 hover:border-slate-600 text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.packed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <h4
                    className={`text-sm font-bold tracking-tight ${
                      item.packed ? "line-through text-slate-400" : "text-white"
                    }`}
                  >
                    {item.itemName}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {item.lessonName} •{" "}
                    {item.category === "kitap"
                      ? "Ders Kitabı"
                      : item.category === "defter"
                      ? "Defter"
                      : item.category === "kaynak"
                      ? "Yardımcı Kaynak / Föy"
                      : "Kırtasiye / Malzeme"}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBagItem(item.id);
                }}
                className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Custom Item Form */}
      <form
        onSubmit={handleAddItem}
        className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 space-y-3"
      >
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Yeni Çanta Malzemesi Ekle
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            required
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Malzeme adı (örn: Geometri Cetvel Takımı)"
            className="px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          />

          <div className="flex gap-2">
            <input
              type="text"
              value={newLessonName}
              onChange={(e) => setNewLessonName(e.target.value)}
              placeholder="İlgili ders"
              className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
            />

            <button
              type="submit"
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Ekle</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
