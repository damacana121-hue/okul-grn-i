import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { ResearchDossier } from "../types";
import Markdown from "react-markdown";
import {
  Sparkles,
  Search,
  BookOpen,
  Send,
  Copy,
  Check,
  Download,
  PlusCircle,
  Clock,
  Trash2,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  FileText,
  BookmarkPlus,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const RESEARCH_STORAGE_KEY = "okul_asistani_saved_researches_v1";

const SAMPLE_TOPICS = [
  {
    topic: "Yenilenebilir Enerji Kaynakları ve Geleceğin Teknolojileri",
    subject: "Fizik",
    gradeLevel: "Lise (9-12. Sınıf)",
    assignmentType: "Kapsamlı Dönem / Yıl Sonu Ödevi",
  },
  {
    topic: "Mustafa Kemal Atatürk'ün Çanakkale Savaşı'ndaki Stratejik Rolü",
    subject: "Tarih",
    gradeLevel: "Lise (9-12. Sınıf)",
    assignmentType: "Yazılı Araştırma Raporu",
  },
  {
    topic: "Hücre Bölünmesi ve Kanser: Hücre Döngüsünün Kontrol Mekanizmaları",
    subject: "Biyoloji",
    gradeLevel: "Lise (9-12. Sınıf)",
    assignmentType: "Kapsamlı Dönem / Yıl Sonu Ödevi",
  },
  {
    topic: "Küresel İklim Değişikliği, Sera Gazları ve Karbon Ayak İzi",
    subject: "Coğrafya",
    gradeLevel: "Lise (9-12. Sınıf)",
    assignmentType: "Sunum & Slayt Konuşma Metni",
  },
  {
    topic: "Cahit Sıtkı Tarancı ve Şiirlerinde Yaşama Sevinci ile Ölüm Teması",
    subject: "Edebiyat",
    gradeLevel: "Lise (9-12. Sınıf)",
    assignmentType: "Kompozisyon / Makale İncelemesi",
  },
  {
    topic: "Yapay Zekâ ve Makine Öğreniminin Günlük Yaşama Etkileri",
    subject: "Bilişim",
    gradeLevel: "Ortaokul (5-8. Sınıf / LGS)",
    assignmentType: "Kapsamlı Dönem / Yıl Sonu Ödevi",
  },
];

export const ResearchAssistantView: React.FC<{ onBackToHomeworks?: () => void }> = ({
  onBackToHomeworks,
}) => {
  const { lessons, addHomework, setActiveTab, sendChatMessage } = useApp();

  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState(lessons[0]?.name || "Genel Fen / Sosyal");
  const [gradeLevel, setGradeLevel] = useState("Lise (9-12. Sınıf)");
  const [assignmentType, setAssignmentType] = useState("Kapsamlı Dönem / Yıl Sonu Ödevi");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ResearchDossier | null>(null);
  const [copied, setCopied] = useState(false);
  const [addedToHw, setAddedToHw] = useState(false);
  const [savedResearches, setSavedResearches] = useState<ResearchDossier[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load saved researches from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESEARCH_STORAGE_KEY);
      if (raw) {
        setSavedResearches(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Error reading saved researches", e);
    }
  }, []);

  const saveToHistory = (item: ResearchDossier) => {
    try {
      const updated = [item, ...savedResearches.filter((r) => r.id !== item.id)].slice(0, 20);
      setSavedResearches(updated);
      localStorage.setItem(RESEARCH_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving research", e);
    }
  };

  const deleteFromHistory = (id: string) => {
    try {
      const updated = savedResearches.filter((r) => r.id !== id);
      setSavedResearches(updated);
      localStorage.setItem(RESEARCH_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Error deleting research", e);
    }
  };

  const handleStartResearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setErrorMessage("");
    setCopied(false);
    setAddedToHw(false);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "research",
          topic: topic.trim(),
          subject: subject.trim(),
          gradeLevel,
          assignmentType,
          specialInstructions: specialInstructions.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Sunucu yanıt vermedi");
      }

      const data = await res.json();
      const content = data.reply || "İçerik oluşturulamadı.";

      const dossier: ResearchDossier = {
        id: "res_" + Date.now(),
        topic: topic.trim(),
        subject: subject.trim(),
        gradeLevel,
        assignmentType,
        specialInstructions: specialInstructions.trim() || undefined,
        content,
        createdAt: new Date().toISOString(),
      };

      setCurrentResult(dossier);
      saveToHistory(dossier);
    } catch (err: any) {
      setErrorMessage(
        "Araştırma dosyası oluşturulurken bir bağlantı hatası oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(currentResult.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadTxt = () => {
    if (!currentResult) return;
    const blob = new Blob([currentResult.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentResult.topic.replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ_-]/g, "_")}_Arastirma_Raporu.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddAsHomework = () => {
    if (!currentResult) return;

    // Set deadline 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const dueDateStr = d.toISOString().split("T")[0];

    // Summary description from top 180 chars
    const cleanExcerpt = currentResult.content
      .replace(/[#*`_]/g, "")
      .slice(0, 200)
      .trim();

    addHomework({
      title: `${currentResult.topic} (Araştırma)`,
      lessonName: currentResult.subject || "Genel",
      description: `${currentResult.assignmentType} • ${cleanExcerpt}...`,
      dueDate: dueDateStr,
      priority: "high",
      isCompleted: false,
    });

    setAddedToHw(true);
    setTimeout(() => setAddedToHw(false), 3000);
  };

  const handleAskInAiChat = () => {
    if (!currentResult) return;
    sendChatMessage(
      `Ödevim için araştırdığım "${currentResult.topic}" konusuyla ilgili ek sorularım ve hocaya soracağım noktalar var. Bana rehberlik eder misin?`
    );
    setActiveTab("ai");
  };

  const handleSelectSample = (sample: typeof SAMPLE_TOPICS[0]) => {
    setTopic(sample.topic);
    setSubject(sample.subject);
    setGradeLevel(sample.gradeLevel);
    setAssignmentType(sample.assignmentType);
  };

  const uniqueLessons = Array.from(new Set(lessons.map((l) => l.name)));
  if (uniqueLessons.length === 0) {
    uniqueLessons.push(
      "Matematik",
      "Fizik",
      "Kimya",
      "Biyoloji",
      "Tarih",
      "Coğrafya",
      "Türk Dili ve Edebiyatı",
      "Felsefe",
      "İngilizce",
      "Bilişim Teknolojileri"
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900/80 border border-purple-500/30 rounded-3xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="max-w-[85%]">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              AKILLI ARAŞTIRMA & ÖDEV LABORATUVARI
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
              Ödev & Proje Araştırma Danışmanı
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Konunu ve isteklerini detaylıca yaz; MEB müfredatı, güncel bilimsel kaynaklar, 
              grafikler, örnekler ve akademik kaynakça ile tam not alacak bir araştırma dosyası hazırla.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {onBackToHomeworks && (
              <button
                onClick={onBackToHomeworks}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Ödev Listem
              </button>
            )}

            {savedResearches.length > 0 && (
              <button
                onClick={() => setHistoryOpen(!historyOpen)}
                className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-purple-200 px-2.5 py-1 bg-purple-500/15 border border-purple-500/30 rounded-xl transition"
              >
                <Clock className="w-3 h-3" />
                <span>Geçmiş ({savedResearches.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History Drawer */}
      <AnimatePresence>
        {historyOpen && savedResearches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-4 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Önceki Araştırma Dosyaların
              </h3>
              <span className="text-[10px] text-slate-400">Tek tıkla görüntüle</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {savedResearches.map((r) => (
                <div
                  key={r.id}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-2.5 flex items-center justify-between gap-2 group transition"
                >
                  <div
                    onClick={() => {
                      setCurrentResult(r);
                      setTopic(r.topic);
                      setSubject(r.subject);
                      setGradeLevel(r.gradeLevel);
                      setAssignmentType(r.assignmentType);
                      setHistoryOpen(false);
                    }}
                    className="cursor-pointer flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded">
                        {r.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white truncate mt-0.5 group-hover:text-purple-300 transition-colors">
                      {r.topic}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteFromHistory(r.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition"
                    title="Geçmişten Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Form */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 sm:p-5 backdrop-blur-sm">
        <form onSubmit={handleStartResearch} className="space-y-4">
          {/* Main Topic Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-purple-400" />
                Araştırılacak Konu / Proje Başlığı *
              </label>
              <span className="text-[10px] text-slate-400">Detaylı ve net yazabilirsiniz</span>
            </div>
            <textarea
              required
              rows={2}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Örn: Yenilenebilir Enerji Kaynakları, Rüzgar ve Güneş Santrallerinin Verimlilik Karşılaştırması..."
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Subject & Grade & Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                İlgili Ders
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {uniqueLessons.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Eğitim / Sınıf Düzeyi
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="Ortaokul (5-8. Sınıf / LGS)">Ortaokul (5-8. Sınıf / LGS)</option>
                <option value="Lise (9-12. Sınıf / YKS)">Lise (9-12. Sınıf / YKS)</option>
                <option value="Üniversite / Akademik">Üniversite / Akademik</option>
                <option value="İlkokul (1-4. Sınıf)">İlkokul (1-4. Sınıf)</option>
              </select>
            </div>

            {/* Assignment Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ödev Türü & Formatı
              </label>
              <select
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="Kapsamlı Dönem / Yıl Sonu Ödevi">📑 Kapsamlı Dönem Ödevi</option>
                <option value="Yazılı Araştırma Raporu">📄 Yazılı Araştırma Raporu</option>
                <option value="Sunum & Slayt Konuşma Metni">📊 Sunum & Slayt Metni</option>
                <option value="Kompozisyon / Makale İncelemesi">✍️ Kompozisyon / Makale</option>
                <option value="Deney & Gözlem Raporu">🔬 Deney Raporu</option>
                <option value="Hızlı Bilgi Notu & Soru-Cevap">⚡ Hızlı Bilgi Notu</option>
              </select>
            </div>
          </div>

          {/* Special Instructions (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Öğretmenin Özel Şartları / Kriterleri (İsteğe Bağlı)
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Örn: En az 3 akademik kaynakça olsun, Türkiye'deki durumdan bahsetsin, avantaj-dezavantaj tablosu içersin..."
              className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Sample Topic Chips */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
              💡 Hızlı Denemek İçin Popüler Konular:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_TOPICS.map((s, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectSample(s)}
                  className="px-2.5 py-1 bg-slate-900/60 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white rounded-xl text-[11px] transition flex items-center gap-1"
                >
                  <span className="font-semibold text-purple-400">{s.subject}:</span>
                  <span className="truncate max-w-[200px]">{s.topic}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              MEB kazanımları ve bilimsel standartlara göre analiz edilir
            </span>

            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:opacity-95 disabled:opacity-50 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-purple-500/25 flex items-center gap-2 transition"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Kapsamlı Dosya Hazırlanıyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Kapsamlı Araştırmayı Başlat 🚀</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Loading Progress State */}
      {isLoading && (
        <div className="bg-slate-800/80 border border-purple-500/30 rounded-3xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-white">
            Yapay Zekâ Akademik Araştırma Motoru Çalışıyor...
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            1. MEB ve akademik literatür taranıyor <br />
            2. Alt başlıklar, formüller ve somut örnekler yapılandırılıyor <br />
            3. Öğretmenin tam puan kriterleri ve güvenilir kaynakça listeleniyor...
          </p>
        </div>
      )}

      {/* Result Display */}
      {currentResult && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 border border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
        >
          {/* Result Header & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md text-[11px] font-bold">
                  {currentResult.subject}
                </span>
                <span className="text-xs text-slate-400">{currentResult.assignmentType}</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight mt-1">
                {currentResult.topic}
              </h3>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={handleAddAsHomework}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                title="Bu araştırmayı doğrudan ödev listene ekle"
              >
                {addedToHw ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Ödevlere Eklendi!</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ödevlerime Ekle</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                title="Tüm raporu panoya kopyala"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Metni Kopyala</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadTxt}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                title="Raporu metin dosyası (.txt) olarak indir"
              >
                <Download className="w-3.5 h-3.5" />
                <span>İndir (.txt)</span>
              </button>

              <button
                onClick={handleAskInAiChat}
                className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                title="Yapay Zekâ ile bu araştırmayı derinlemesine tartış"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>AI ile Tartış</span>
              </button>
            </div>
          </div>

          {/* Dossier Content Styled View */}
          <div className="bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-800 text-slate-200 text-sm leading-relaxed overflow-x-auto">
            <div className="prose prose-invert max-w-none space-y-3 font-normal text-slate-200 text-sm">
              <Markdown>{currentResult.content}</Markdown>
            </div>
          </div>

          {/* Bottom Guidance Card */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 to-slate-900/60 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
            <BookmarkPlus className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-white">Öğretmenine Sunarken İpucu:</p>
              <p className="text-slate-300 mt-0.5">
                Bu araştırma dosyasını sunumunda veya ödevinde kullanırken "Kaynaklar" bölümünü 
                aynı formatta korumanız ve sonuç bölümüne kendi cümlelerinizle kişisel görüşünüzü 
                eklemeniz projenize ekstra özgünlük puanı kazandıracaktır!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
