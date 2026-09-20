import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const OnboardingModal: React.FC = () => {
  const { isFirstLaunch, completeOnboarding, profile } = useApp();

  const [name, setName] = useState(profile.name || "");
  const [school, setSchool] = useState(profile.school || "");
  const [grade, setGrade] = useState(profile.grade || "");

  if (!isFirstLaunch) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeOnboarding(
      name.trim(),
      school.trim(),
      grade.trim()
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Okul Asistanı'na Hoş Geldin 👋
              </h2>
              <p className="text-xs text-slate-400">
                Sana özel bir okul deneyimi için bilgilerini gir.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Adın ve Soyadın:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Emre Yılmaz"
                className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Okulun:
              </label>
              <input
                type="text"
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Örn: Atatürk Anadolu Lisesi"
                className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sınıf ve Şuben:
              </label>
              <input
                type="text"
                required
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Örn: 10/A veya 11/B"
                className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group transition"
              >
                <span>Hemen Başla</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-500">
              * Bu bilgileri dilediğin zaman Ayarlar sekmesinden güncelleyebilirsin.
            </p>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
