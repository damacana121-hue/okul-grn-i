import { StudyPlanTemplate } from "../types";

export const PRESET_STUDY_TEMPLATES: StudyPlanTemplate[] = [
  {
    id: "final-week-intensive",
    title: "Final & Yazılı Haftası Yoğun Kamp",
    badge: "Sınav Dönemi",
    icon: "Target",
    description: "Yazılılar ve finaller öncesi eksik bırakmayan, soru çözümü ve formül tekrarı ağırlıklı yüksek verimli çalışma kampı.",
    totalDurationMinutes: 195,
    pomodoroAdvice: "50 dk Çalışma + 10 dk Mola (veya 25+5 çift döngü)",
    items: [
      { lessonName: "Matematik (Soru & Formül)", targetMinutes: 60 },
      { lessonName: "Fizik / Fen Bilimleri", targetMinutes: 50 },
      { lessonName: "Türkçe / Edebiyat", targetMinutes: 45 },
      { lessonName: "Kimya / Biyoloji / Sosyal", targetMinutes: 40 },
    ],
  },
  {
    id: "daily-regular-review",
    title: "Günlük Düzenli Tekrar & Ödev",
    badge: "Hafta İçi Rutini",
    icon: "BookOpen",
    description: "Günün derslerini unutmadan tazelemek, ödevleri günü gününe bitirmek ve okuma alışkanlığını korumak için ideal denge.",
    totalDurationMinutes: 95,
    pomodoroAdvice: "25 dk Odaklanma + 5 dk Dinlenme",
    items: [
      { lessonName: "Günün Dersleri Tekrarı", targetMinutes: 30 },
      { lessonName: "Ödevler & Proje Çalışması", targetMinutes: 40 },
      { lessonName: "Paragraf & Kitap Okuma", targetMinutes: 25 },
    ],
  },
  {
    id: "weekend-make-up",
    title: "Hafta Sonu Telafi & Deneme Kampı",
    badge: "Hafta Sonu",
    icon: "Flame",
    description: "Hafta içi anlaşılmayan zor konuları pekiştirmek ve kapsamlı soru bankası / deneme sınavı çözmek için.",
    totalDurationMinutes: 165,
    pomodoroAdvice: "45 dk Çalışma + 10 dk Mola",
    items: [
      { lessonName: "Eksik Konu Derin Tekrar", targetMinutes: 60 },
      { lessonName: "Deneme Sınavı & Test Çözümü", targetMinutes: 75 },
      { lessonName: "Yanlış Soru Analizi", targetMinutes: 30 },
    ],
  },
  {
    id: "last-day-revision",
    title: "Sınav Öncesi Son Gün Hızlı Tekrar",
    badge: "Kritik Gün",
    icon: "Zap",
    description: "Sınavdan bir gün önce beyni yormadan sadece formül kartları, özet notlar ve çıkmış sorularla hafıza tazeleme.",
    totalDurationMinutes: 95,
    pomodoroAdvice: "20 dk Odak + 5 dk Kısa Mola",
    items: [
      { lessonName: "Özet Notlar & Zihin Haritası", targetMinutes: 35 },
      { lessonName: "Formül & Tanım Kartları", targetMinutes: 30 },
      { lessonName: "Çıkmış Soru & Tipik Soru Taraması", targetMinutes: 30 },
    ],
  },
  {
    id: "lgs-yks-marathon",
    title: "LGS / YKS Hedef Kampı (Maraton)",
    badge: "Merkezi Sınav",
    icon: "Award",
    description: "Derece ve yüksek net hedefleyen öğrenciler için soru sayısı ve hız odaklı disiplinli maraton.",
    totalDurationMinutes: 150,
    pomodoroAdvice: "40 dk Soru + 10 dk Mola",
    items: [
      { lessonName: "Matematik & Geometri Testi", targetMinutes: 60 },
      { lessonName: "Fen / Sosyal Alan Tekrarı", targetMinutes: 50 },
      { lessonName: "Paragraf & Problem Rutini", targetMinutes: 40 },
    ],
  },
];

const CUSTOM_TEMPLATES_KEY = "okul_asistani_custom_study_templates_v1";

export function getCustomStudyTemplates(): StudyPlanTemplate[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load custom templates:", e);
    return [];
  }
}

export function saveCustomStudyTemplate(template: StudyPlanTemplate): StudyPlanTemplate[] {
  try {
    const existing = getCustomStudyTemplates();
    const updated = [template, ...existing.filter((t) => t.id !== template.id)];
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save custom template:", e);
    return [];
  }
}

export function deleteCustomStudyTemplate(id: string): StudyPlanTemplate[] {
  try {
    const existing = getCustomStudyTemplates();
    const updated = existing.filter((t) => t.id !== id);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to delete custom template:", e);
    return [];
  }
}
