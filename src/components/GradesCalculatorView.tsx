import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { GradeRecord } from "../types";
import {
  Calculator,
  Plus,
  Trash2,
  Award,
  Target,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

export const GradesCalculatorView: React.FC = () => {
  const { grades, updateGrade, addGradeSubject, deleteGradeSubject, lessons, setActiveTab } =
    useApp();

  const [expandedId, setExpandedId] = useState<string | null>(grades[0]?.id || null);
  const [newSubjectName, setNewSubjectName] = useState("");

  // Target calculator state
  const [targetSubjectId, setTargetSubjectId] = useState(grades[0]?.id || "");
  const [desiredAverage, setDesiredAverage] = useState(85);

  // Calculate single subject average
  const calculateSubjectAverage = (record: GradeRecord): number | null => {
    const scores: number[] = [];
    if (record.written1 !== null) scores.push(record.written1);
    if (record.written2 !== null) scores.push(record.written2);
    if (record.written3 !== null) scores.push(record.written3);
    if (record.oral1 !== null) scores.push(record.oral1);
    if (record.oral2 !== null) scores.push(record.oral2);
    if (record.performance !== null) scores.push(record.performance);
    if (record.project !== null) scores.push(record.project);

    if (scores.length === 0) return null;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 10) / 10;
  };

  // Calculate overall semester average
  const subjectAverages = grades
    .map((g) => calculateSubjectAverage(g))
    .filter((a): a is number => a !== null);

  const overallAverage =
    subjectAverages.length > 0
      ? Math.round((subjectAverages.reduce((a, b) => a + b, 0) / subjectAverages.length) * 100) / 100
      : null;

  // Certificate status: Takdir (85+), Teşekkür (70 - 84.99), Geçer (50 - 69.99), Kaldı (<50)
  const getCertificateStatus = (avg: number | null) => {
    if (avg === null) return { text: "Not Girilmedi", badge: "bg-slate-800 text-slate-400 border-slate-700" };
    if (avg >= 85) {
      return {
        text: "🏆 Takdir Belgesi",
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/30 font-extrabold animate-pulse",
      };
    }
    if (avg >= 70) {
      return {
        text: "📜 Teşekkür Belgesi",
        badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-bold",
      };
    }
    if (avg >= 50) {
      return {
        text: "Geçer Not",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-medium",
      };
    }
    return {
      text: "Sorumlu / Kaldı",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/30 font-semibold",
    };
  };

  const certificate = getCertificateStatus(overallAverage);

  // Target Grade Calculation:
  // How much does the student need on the next written exam to reach desiredAverage?
  const selectedTargetRecord = grades.find((g) => g.id === targetSubjectId) || grades[0];
  const calculateRequiredScore = () => {
    if (!selectedTargetRecord) return null;
    const scores: number[] = [];
    if (selectedTargetRecord.written1 !== null) scores.push(selectedTargetRecord.written1);
    if (selectedTargetRecord.oral1 !== null) scores.push(selectedTargetRecord.oral1);
    if (selectedTargetRecord.performance !== null) scores.push(selectedTargetRecord.performance);
    if (selectedTargetRecord.project !== null) scores.push(selectedTargetRecord.project);

    // Assuming 1 next exam added to the count
    const totalCount = scores.length + 1;
    const currentSum = scores.reduce((a, b) => a + b, 0);
    const requiredTotal = desiredAverage * totalCount;
    const requiredScore = Math.round(requiredTotal - currentSum);

    return requiredScore;
  };

  const requiredScore = calculateRequiredScore();

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    addGradeSubject(newSubjectName.trim());
    setNewSubjectName("");
  };

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* 1. Overall Average & Certificate Header Card */}
      <div className="bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" />
              DÖNEM ORTALAMASI
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                {overallAverage !== null ? overallAverage.toFixed(2) : "—"}
              </h2>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {subjectAverages.length} dersin ortalaması hesaplandı
            </p>
          </div>

          <div className="text-right">
            <span className={`inline-block px-3 py-1.5 rounded-2xl border text-xs ${certificate.badge}`}>
              {certificate.text}
            </span>
            {overallAverage !== null && overallAverage < 85 && (
              <p className="text-[11px] text-amber-300 mt-2">
                Takdir için {(85 - overallAverage).toFixed(2)} puan daha gerekiyor
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive "Hedef Not Hesaplayıcı" */}
      <div className="bg-slate-800/80 border border-indigo-500/20 rounded-3xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Target className="w-4 h-4 text-purple-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              🎯 Hedef Not Hesaplayıcı
            </h3>
            <p className="text-xs text-slate-400">
              Ortalamanın istediğin seviyeye gelmesi için sonraki sınavdan kaç alman gerektiğini gör.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/60">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Ders Seç</label>
            <select
              value={targetSubjectId}
              onChange={(e) => setTargetSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.lessonName} (Şu an: {calculateSubjectAverage(g) || "—"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Hedef Ders Ortalaması: <span className="font-bold text-indigo-400">{desiredAverage}</span>
            </label>
            <input
              type="range"
              min="50"
              max="100"
              value={desiredAverage}
              onChange={(e) => setDesiredAverage(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Calculation Result */}
        {requiredScore !== null && (
          <div className="mt-3 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-300">
                <span className="font-bold text-white">{selectedTargetRecord?.lessonName}</span> dersinden{" "}
                <span className="font-bold text-indigo-300">{desiredAverage}</span> ortalama için:
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Sonraki sınavdan alman gereken yaklaşık not</p>
            </div>

            <div className="text-right">
              <span
                className={`text-xl font-extrabold ${
                  requiredScore > 100
                    ? "text-rose-400"
                    : requiredScore <= 50
                    ? "text-emerald-400"
                    : "text-amber-400"
                }`}
              >
                {requiredScore > 100 ? `${requiredScore} (Zor)` : `${requiredScore} Puan`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Subjects & Grades Input List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Ders Notları ({grades.length} Ders)
          </h3>

          <form onSubmit={handleAddSubject} className="flex items-center gap-1.5">
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="Yeni Ders..."
              className="w-28 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
              title="Ders Ekle"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {grades.map((record) => {
          const avg = calculateSubjectAverage(record);
          const isExpanded = expandedId === record.id;

          return (
            <div
              key={record.id}
              className="bg-slate-800/80 border border-slate-700/80 rounded-3xl overflow-hidden backdrop-blur-sm transition-all"
            >
              {/* Header Accordion */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : record.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-700/30 transition select-none"
              >
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-white">{record.lessonName}</h4>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      avg === null
                        ? "bg-slate-700 text-slate-400"
                        : avg >= 85
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : avg >= 70
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : avg >= 50
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    Ortalama: {avg !== null ? avg : "—"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGradeSubject(record.id);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition"
                    title="Dersi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Grades Input Grid */}
              {isExpanded && (
                <div className="p-4 pt-1 border-t border-slate-700/60 bg-slate-900/40 space-y-3">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    {/* 1. Yazılı */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        1. Yazılı
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={record.written1 ?? ""}
                        onChange={(e) =>
                          updateGrade(record.id, {
                            written1: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                        placeholder="—"
                        className="w-full py-2 bg-slate-800 border border-slate-700 rounded-xl text-center text-sm font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* 2. Yazılı */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        2. Yazılı
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={record.written2 ?? ""}
                        onChange={(e) =>
                          updateGrade(record.id, {
                            written2: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                        placeholder="—"
                        className="w-full py-2 bg-slate-800 border border-slate-700 rounded-xl text-center text-sm font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Sözlü 1 */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Sözlü 1
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={record.oral1 ?? ""}
                        onChange={(e) =>
                          updateGrade(record.id, {
                            oral1: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                        placeholder="—"
                        className="w-full py-2 bg-slate-800 border border-slate-700 rounded-xl text-center text-sm font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Sözlü 2 */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Sözlü 2
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={record.oral2 ?? ""}
                        onChange={(e) =>
                          updateGrade(record.id, {
                            oral2: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                        placeholder="—"
                        className="w-full py-2 bg-slate-800 border border-slate-700 rounded-xl text-center text-sm font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Performans */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Performans
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={record.performance ?? ""}
                        onChange={(e) =>
                          updateGrade(record.id, {
                            performance: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                        placeholder="—"
                        className="w-full py-2 bg-slate-800 border border-slate-700 rounded-xl text-center text-sm font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Proje */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Proje
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={record.project ?? ""}
                        onChange={(e) =>
                          updateGrade(record.id, {
                            project: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                        placeholder="—"
                        className="w-full py-2 bg-slate-800 border border-slate-700 rounded-xl text-center text-sm font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
