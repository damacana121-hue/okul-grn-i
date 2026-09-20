import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Send,
  Sparkles,
  Trash2,
  AlertCircle,
  Clock,
  Compass,
  TrendingUp,
  HelpCircle,
  GraduationCap,
  BookOpen,
  Zap,
  CheckCircle2,
  ListChecks,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import Markdown from "react-markdown";

interface SubjectOption {
  name: string;
  popularTopics: string[];
}

const CURRICULUM_SUBJECTS: SubjectOption[] = [
  {
    name: "Matematik",
    popularTopics: ["Fonksiyonlar", "Polinomlar", "Trigonometri", "Türev ve Limit", "Üslü & Köklü Sayılar", "Olasılık"],
  },
  {
    name: "Fizik",
    popularTopics: ["Newton'ın Hareket Yasaları", "Elektrik & Manyetizma", "Optik ve Işık", "İş, Güç ve Enerji", "Basit Makineler"],
  },
  {
    name: "Kimya",
    popularTopics: ["Mol Kavramı", "Periyodik Sistem", "Kimyasal Denge", "Asitler ve Bazlar", "Organik Kimyaya Giriş"],
  },
  {
    name: "Biyoloji",
    popularTopics: ["Hücre ve Organeller", "Mitoz & Mayoz Bölünme", "Kalıtım ve Genetik", "Fotosentez ve Solunum", "Dolaşım Sistemi"],
  },
  {
    name: "Türkçe & Edebiyat",
    popularTopics: ["Cümlenin Ögeleri", "Yazım Kuralları ve Noktalama", "Divan Edebiyatı Nazım Şekilleri", "Söz Sanatları (Teşbih, Mecaz)", "Paragrafta Anlam"],
  },
  {
    name: "Tarih",
    popularTopics: ["Kurtuluş Savaşı ve Cepheler", "Osmanlı Devleti Kuruluş & Yükselme", "Atatürk İlkeleri ve İnkılapları", "I. Dünya Savaşı"],
  },
  {
    name: "Coğrafya",
    popularTopics: ["İklim Tipleri ve Özellikleri", "Türkiye'nin Yer Şekilleri", "Harita Bilgisi ve Ölçekler", "Nüfus ve Yerleşme"],
  },
  {
    name: "İngilizce",
    popularTopics: ["Tenses (Zamanlar) & Kuralları", "Passive Voice (Edilgen Çatı)", "Conditional Sentences (If Clauses)", "Modal Verbs"],
  },
];

const QUICK_PROMPTS = [
  {
    icon: Sparkles,
    label: "🔬 Akıllı Araştırma & Ödev Yeri",
    prompt: "RESEARCH_DIRECT",
  },
  {
    icon: GraduationCap,
    label: "📖 Konu Anlatımı İste",
    prompt: "Bana Matematikte Fonksiyonlar konusunu en baştan, mantığıyla, formülleriyle ve çözümlü örnek sorularla detaylı anlatır mısın?",
  },
  {
    icon: Clock,
    label: "Bugünkü derslerim neler?",
    prompt: "Bugün hangi derslerim var ve saat kaçtalar?",
  },
  {
    icon: Compass,
    label: "Bana çalışma planı hazırla",
    prompt: "Bugün 2 saatim var. Derslerime ve sınavlarıma göre bana verimli bir çalışma planı hazırla.",
  },
  {
    icon: TrendingUp,
    label: "Notlarımı nasıl yükseltirim?",
    prompt: "Ders notlarımı yükseltmek ve sınav başarım için bana hangi çalışma stratejilerini önerirsin?",
  },
  {
    icon: HelpCircle,
    label: "Bekleyen ödev ve sınavlarım",
    prompt: "Önümdeki en acil ödevler ve sınavlar neler? Nasıl bir öncelik sırası yapmalıyım?",
  },
];

type LectureMode = "lecture" | "summary" | "solve" | "quiz";

export const AiConsultantView: React.FC = () => {
  const { chatMessages, sendChatMessage, clearChat, isAiLoading, lessons, setActiveTab } =
    useApp();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Topic Lecture Studio States
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(CURRICULUM_SUBJECTS[0].name);
  const [customTopic, setCustomTopic] = useState("");
  const [lectureMode, setLectureMode] = useState<LectureMode>("lecture");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isAiLoading) return;
    setInput("");
    await sendChatMessage(query);
  };

  const handleStartLecture = async (topicToUse?: string) => {
    const topic = topicToUse || customTopic.trim();
    if (!topic || isAiLoading) return;

    let modeDescription = "kapsamlı konu anlatımı";
    if (lectureMode === "summary") modeDescription = "hap bilgiler ve formül özeti";
    if (lectureMode === "solve") modeDescription = "çözümlü örnek sorular";
    if (lectureMode === "quiz") modeDescription = "pekiştirme sorusu ve beni sına";

    const promptText = `${selectedSubject} dersi "${topic}" konusu için ${modeDescription} hazırla.`;

    setIsStudioOpen(false);
    setCustomTopic("");

    await sendChatMessage(promptText, {
      mode: lectureMode,
      subject: selectedSubject,
      topic,
    });
  };

  const currentSubjectData =
    CURRICULUM_SUBJECTS.find((s) => s.name === selectedSubject) || CURRICULUM_SUBJECTS[0];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] pb-1 pt-1 max-w-2xl mx-auto">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-2 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Yapay Zekâ Okul Danışmanı & Özel Öğretmen
              </h2>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded-md font-semibold">
                MEB / YKS Uyumlu
              </span>
            </div>
            <p className="text-[11px] text-purple-300/90">
              Derinlemesine Konu Anlatımı, Soru Çözümü ve Okul Koçluğu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsStudioOpen(!isStudioOpen)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
              isStudioOpen
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                : "bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Konu Anlatımı</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isStudioOpen ? "rotate-180" : ""}`} />
          </button>

          <button
            onClick={() => clearChat()}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition"
            title="Sohbeti Temizle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Topic Lecture Studio Accordion */}
      {isStudioOpen && (
        <div className="mt-2 mx-1 p-3.5 bg-slate-900/95 border border-purple-500/30 rounded-2xl shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Konu Anlatım Atölyesi
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              İstediğin konuyu adım adım öğren
            </span>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-4 gap-1 bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setLectureMode("lecture")}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition text-center ${
                lectureMode === "lecture"
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📖 Detaylı Anlatım
            </button>
            <button
              onClick={() => setLectureMode("summary")}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition text-center ${
                lectureMode === "summary"
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ⚡ Hap Özet
            </button>
            <button
              onClick={() => setLectureMode("solve")}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition text-center ${
                lectureMode === "solve"
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              💡 Örnek Çözüm
            </button>
            <button
              onClick={() => setLectureMode("quiz")}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition text-center ${
                lectureMode === "quiz"
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🎯 Beni Sına
            </button>
          </div>

          {/* Subject Selector Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {CURRICULUM_SUBJECTS.map((sub) => (
              <button
                key={sub.name}
                onClick={() => setSelectedSubject(sub.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedSubject === sub.name
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>

          {/* Popular Topics Chips */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-slate-400 block">
              Popüler Konulardan Seç:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {currentSubjectData.popularTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleStartLecture(topic)}
                  className="px-2.5 py-1 bg-slate-800/80 hover:bg-purple-600/30 hover:border-purple-500/50 border border-slate-700/80 rounded-lg text-xs text-slate-300 hover:text-white transition flex items-center gap-1"
                >
                  <span>{topic}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-purple-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom Topic Input */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder={`Veya ${selectedSubject} dersinden başka bir konu yaz (Örn: Çarpanlara Ayırma)...`}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleStartLecture();
                }
              }}
            />
            <button
              onClick={() => handleStartLecture()}
              disabled={!customTopic.trim() || isAiLoading}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shrink-0 transition"
            >
              Anlatımı Başlat
            </button>
          </div>
        </div>
      )}

      {/* 3. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3.5 no-scrollbar">
        {chatMessages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                  isUser
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm"
                    : msg.isError
                    ? "bg-rose-950/40 border border-rose-500/40 text-rose-200 rounded-tl-sm"
                    : "bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-sm"
                }`}
              >
                {msg.isError ? (
                  <div className="flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{msg.content}</span>
                  </div>
                ) : (
                  <div className="markdown-body prose prose-invert prose-sm max-w-none text-slate-100 space-y-2">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}

                <span
                  className={`block text-[10px] mt-1.5 text-right ${
                    isUser ? "text-indigo-200/70" : "text-slate-500"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {isAiLoading && (
          <div className="flex gap-2.5 items-center text-xs text-purple-300 animate-pulse">
            <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            </div>
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-100" />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-200" />
              <span className="ml-1 text-slate-300">Özel öğretmen anlatımı hazırlıyor...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Quick Prompts Carousel */}
      <div className="py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 px-1">
        {QUICK_PROMPTS.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              disabled={isAiLoading}
              onClick={() => {
                if (qp.prompt === "RESEARCH_DIRECT") {
                  setActiveTab("homework");
                } else if (qp.label.includes("Konu Anlatımı")) {
                  setIsStudioOpen(true);
                } else {
                  handleSend(qp.prompt);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 rounded-full text-xs text-slate-300 hover:text-white whitespace-nowrap transition disabled:opacity-50"
            >
              <Icon className="w-3.5 h-3.5 text-purple-400" />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-1.5 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Konu anlatımı iste, soru sor veya plan talep et..."
          disabled={isAiLoading}
          className="flex-1 px-4 py-3 bg-slate-800/90 border border-slate-700/90 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isAiLoading}
          className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-2xl shadow-lg shadow-purple-500/20 transition flex items-center justify-center shrink-0"
          title="Gönder"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
