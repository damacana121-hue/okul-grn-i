import { Lesson, Homework, Exam, GradeRecord, StudyGoal, StudyLog, BagItem, StudentProfile, AppSettings } from "../types";

// Clean default slate - user populates everything over time
export const DEFAULT_PROFILE: StudentProfile = {
  name: "",
  school: "",
  grade: "",
  studentNumber: "",
};

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  themeColor: "indigo",
  notificationsEnabled: true,
  lessonNotifyMinutes: 10,
  bagReminderTime: "20:00",
  pomodoroWork: 25,
  pomodoroShortBreak: 5,
  pomodoroLongBreak: 15,
  soundEnabled: true,
  hapticEnabled: true,
  simulatedPhoneFrame: false,
};

// Initial state is 100% empty
export const DEFAULT_LESSONS: Lesson[] = [];
export const DEFAULT_HOMEWORKS: Homework[] = [];
export const DEFAULT_EXAMS: Exam[] = [];
export const DEFAULT_GRADES: GradeRecord[] = [];
export const DEFAULT_STUDY_GOALS: StudyGoal[] = [];
export const DEFAULT_STUDY_LOGS: StudyLog[] = [];
export const DEFAULT_BAG_ITEMS: BagItem[] = [];

// Sample data for optional template loading via Settings button
export const getFutureDate = (daysAhead: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
};

export const SAMPLE_PROFILE: StudentProfile = {
  name: "Ali",
  school: "Anadolu Lisesi",
  grade: "10/A",
  studentNumber: "101",
};

export const SAMPLE_LESSONS: Lesson[] = [
  // Pazartesi (1)
  { id: "l1", name: "Matematik", teacher: "Ahmet Yılmaz", classroom: "10/A", day: 1, startTime: "08:30", endTime: "09:15", color: "#6366f1" },
  { id: "l2", name: "Matematik", teacher: "Ahmet Yılmaz", classroom: "10/A", day: 1, startTime: "09:25", endTime: "10:10", color: "#6366f1" },
  { id: "l3", name: "Türk Dili ve Edebiyatı", teacher: "Elif Demir", classroom: "10/A", day: 1, startTime: "10:20", endTime: "11:05", color: "#ec4899" },
  { id: "l4", name: "Fizik", teacher: "Mehmet Kaya", classroom: "Lab 2", day: 1, startTime: "11:15", endTime: "12:00", color: "#3b82f6" },
  { id: "l5", name: "İngilizce", teacher: "Sarah Jenkins", classroom: "10/A", day: 1, startTime: "12:45", endTime: "13:30", color: "#10b981" },
  { id: "l6", name: "Tarih", teacher: "Hasan Can", classroom: "10/A", day: 1, startTime: "13:40", endTime: "14:25", color: "#f59e0b" },

  // Salı (2)
  { id: "l7", name: "Kimya", teacher: "Zeynep Arslan", classroom: "Lab 1", day: 2, startTime: "08:30", endTime: "09:15", color: "#8b5cf6" },
  { id: "l8", name: "Biyoloji", teacher: "Sibel Öztürk", classroom: "10/A", day: 2, startTime: "09:25", endTime: "10:10", color: "#14b8a6" },
  { id: "l9", name: "Matematik", teacher: "Ahmet Yılmaz", classroom: "10/A", day: 2, startTime: "10:20", endTime: "11:05", color: "#6366f1" },
  { id: "l10", name: "Coğrafya", teacher: "Kemal Güneş", classroom: "10/A", day: 2, startTime: "11:15", endTime: "12:00", color: "#06b6d4" },
  { id: "l11", name: "İngilizce", teacher: "Sarah Jenkins", classroom: "10/A", day: 2, startTime: "12:45", endTime: "13:30", color: "#10b981" },

  // Çarşamba (3)
  { id: "l12", name: "Fizik", teacher: "Mehmet Kaya", classroom: "10/A", day: 3, startTime: "08:30", endTime: "09:15", color: "#3b82f6" },
  { id: "l13", name: "Türk Dili ve Edebiyatı", teacher: "Elif Demir", classroom: "10/A", day: 3, startTime: "09:25", endTime: "10:10", color: "#ec4899" },
  { id: "l14", name: "Felsefe", teacher: "Nilüfer Şen", classroom: "10/A", day: 3, startTime: "10:20", endTime: "11:05", color: "#d946ef" },
  { id: "l15", name: "Beden Eğitimi", teacher: "Murat Koç", classroom: "Spor Salonu", day: 3, startTime: "11:15", endTime: "12:00", color: "#f97316" },
  { id: "l16", name: "Matematik", teacher: "Ahmet Yılmaz", classroom: "10/A", day: 3, startTime: "12:45", endTime: "13:30", color: "#6366f1" },

  // Perşembe (4)
  { id: "l17", name: "Kimya", teacher: "Zeynep Arslan", classroom: "10/A", day: 4, startTime: "08:30", endTime: "09:15", color: "#8b5cf6" },
  { id: "l18", name: "Biyoloji", teacher: "Sibel Öztürk", classroom: "Lab 2", day: 4, startTime: "09:25", endTime: "10:10", color: "#14b8a6" },
  { id: "l19", name: "Tarih", teacher: "Hasan Can", classroom: "10/A", day: 4, startTime: "10:20", endTime: "11:05", color: "#f59e0b" },
  { id: "l20", name: "Almanca", teacher: "Hans Müller", classroom: "Dil Lab", day: 4, startTime: "11:15", endTime: "12:00", color: "#eab308" },
  { id: "l21", name: "Türk Dili ve Edebiyatı", teacher: "Elif Demir", classroom: "10/A", day: 4, startTime: "12:45", endTime: "13:30", color: "#ec4899" },

  // Cuma (5)
  { id: "l22", name: "Matematik Geometri", teacher: "Ahmet Yılmaz", classroom: "10/A", day: 5, startTime: "08:30", endTime: "09:15", color: "#6366f1" },
  { id: "l23", name: "Din Kültürü", teacher: "Ali Rıza", classroom: "10/A", day: 5, startTime: "09:25", endTime: "10:10", color: "#84cc16" },
  { id: "l24", name: "Görsel Sanatlar", teacher: "Berna Ak", classroom: "Atölye", day: 5, startTime: "10:20", endTime: "11:05", color: "#a855f7" },
  { id: "l25", name: "Müzik", teacher: "Cem Tan", classroom: "Müzik Odası", day: 5, startTime: "11:15", endTime: "12:00", color: "#0ea5e9" },
  { id: "l26", name: "Rehberlik", teacher: "Elif Demir", classroom: "10/A", day: 5, startTime: "12:45", endTime: "13:30", color: "#64748b" },
];

export const SAMPLE_HOMEWORKS: Homework[] = [
  {
    id: "hw1",
    title: "Matematik Alıştırmaları",
    lessonName: "Matematik",
    description: "Ders kitabındaki ünite sonu soruları çözülecek.",
    dueDate: getFutureDate(2),
    priority: "high",
    note: "Ödev kontrol edilecek.",
    isCompleted: false,
  },
  {
    id: "hw2",
    title: "Fizik Deney Raporu",
    lessonName: "Fizik",
    description: "Laboratuvarda işlenen hareket deneyinin sonuçları yazılacak.",
    dueDate: getFutureDate(4),
    priority: "medium",
    isCompleted: false,
  },
];

export const SAMPLE_EXAMS: Exam[] = [
  {
    id: "ex1",
    lessonName: "Matematik",
    examType: "1. Dönem 1. Yazılı",
    date: getFutureDate(4),
    time: "09:30",
    description: "1. ve 2. ünite konuları dahil.",
  },
  {
    id: "ex2",
    lessonName: "Fizik",
    examType: "1. Dönem 1. Yazılı",
    date: getFutureDate(8),
    time: "10:30",
    description: "Kuvvet ve hareket üniteleri.",
  },
];

export const SAMPLE_GRADES: GradeRecord[] = [
  {
    id: "g1",
    lessonName: "Matematik",
    written1: 85,
    written2: 90,
    written3: null,
    oral1: 95,
    oral2: 90,
    performance: 95,
    project: null,
    targetGrade: 85,
  },
  {
    id: "g2",
    lessonName: "Fizik",
    written1: 75,
    written2: 80,
    written3: null,
    oral1: 85,
    oral2: 85,
    performance: 90,
    project: null,
    targetGrade: 80,
  },
  {
    id: "g3",
    lessonName: "Türk Dili ve Edebiyatı",
    written1: 90,
    written2: 92,
    written3: null,
    oral1: 100,
    oral2: 95,
    performance: 95,
    project: null,
    targetGrade: 90,
  },
];

export const SAMPLE_STUDY_GOALS: StudyGoal[] = [
  { id: "sg1", lessonName: "Matematik", targetMinutes: 45 },
  { id: "sg2", lessonName: "Fizik", targetMinutes: 30 },
];

export const SAMPLE_STUDY_LOGS: StudyLog[] = [];

export const SAMPLE_BAG_ITEMS: BagItem[] = [
  { id: "b1", lessonName: "Matematik", itemName: "Ders Kitabı & Kareli Defter", category: "kitap", packed: false, days: [1, 2, 3, 5] },
  { id: "b2", lessonName: "Genel", itemName: "Kalemlik & Silgi & Araç Gereç", category: "malzeme", packed: false, days: [1, 2, 3, 4, 5] },
];
