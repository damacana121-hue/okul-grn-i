export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1: Pazartesi, ..., 5: Cuma

export interface StudentProfile {
  name: string;
  school: string;
  grade: string;
  studentNumber?: string;
  avatarIcon?: string;
}

export interface Lesson {
  id: string;
  name: string;
  teacher: string;
  classroom: string;
  day: DayOfWeek;
  startTime: string; // "08:30"
  endTime: string;   // "09:20"
  color: string;     // e.g. "#6366f1"
}

export type HomeworkPriority = "low" | "medium" | "high";
export type HomeworkStatus = "completed" | "approaching" | "overdue";

export interface Homework {
  id: string;
  title: string;
  lessonName: string;
  description: string;
  dueDate: string; // "YYYY-MM-DD"
  priority: HomeworkPriority;
  note?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Exam {
  id: string;
  lessonName: string;
  examType: string; // "1. Yazılı", "2. Yazılı", "Deneme", "Quiz", vb.
  date: string;     // "YYYY-MM-DD"
  time: string;     // "09:30"
  description?: string;
}

export interface GradeRecord {
  id: string;
  lessonName: string;
  written1: number | null;
  written2: number | null;
  written3: number | null;
  oral1: number | null;
  oral2: number | null;
  performance: number | null;
  project: number | null;
  targetGrade?: number;
}

export interface StudyGoal {
  id: string;
  lessonName: string;
  targetMinutes: number;
}

export interface StudyLog {
  id: string;
  lessonName: string;
  minutes: number;
  date: string; // "YYYY-MM-DD"
  timestamp: string;
}

export interface BagItem {
  id: string;
  lessonName: string;
  itemName: string;
  category: "kitap" | "defter" | "kaynak" | "malzeme";
  packed: boolean;
  days: DayOfWeek[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "lesson" | "exam" | "homework" | "pomodoro" | "bag" | "system";
  timestamp: string;
  read: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  themeColor: "indigo" | "violet" | "emerald" | "amber" | "sky" | "rose";
  notificationsEnabled: boolean;
  lessonNotifyMinutes: number; // e.g. 10
  lessonReminderMinutes?: number;
  bagReminderTime: string;      // e.g. "20:00"
  bagReminderEnabled?: boolean;
  pomodoroWork: number;        // default 25
  pomodoroShortBreak: number;  // default 5
  pomodoroLongBreak: number;   // default 15
  soundEnabled: boolean;
  hapticEnabled: boolean;
  simulatedPhoneFrame: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isError?: boolean;
}

export interface StudyPlanTemplate {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: string;
  totalDurationMinutes: number;
  pomodoroAdvice: string;
  items: { lessonName: string; targetMinutes: number }[];
  isCustom?: boolean;
}

export interface ResearchDossier {
  id: string;
  topic: string;
  subject: string;
  gradeLevel: string;
  assignmentType: string;
  specialInstructions?: string;
  content: string;
  createdAt: string;
}
