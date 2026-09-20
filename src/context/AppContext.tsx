import React, { createContext, useContext, useState, useEffect } from "react";
import {
  StudentProfile,
  Lesson,
  Homework,
  Exam,
  GradeRecord,
  StudyGoal,
  StudyLog,
  BagItem,
  AppNotification,
  AppSettings,
  ChatMessage,
  DayOfWeek,
} from "../types";
import {
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  DEFAULT_LESSONS,
  DEFAULT_HOMEWORKS,
  DEFAULT_EXAMS,
  DEFAULT_GRADES,
  DEFAULT_STUDY_GOALS,
  DEFAULT_STUDY_LOGS,
  DEFAULT_BAG_ITEMS,
  SAMPLE_PROFILE,
  SAMPLE_LESSONS,
  SAMPLE_HOMEWORKS,
  SAMPLE_EXAMS,
  SAMPLE_GRADES,
  SAMPLE_STUDY_GOALS,
  SAMPLE_STUDY_LOGS,
  SAMPLE_BAG_ITEMS,
} from "../data/initialData";
import { playChimeSound, triggerHaptic, sendPushNotification } from "../utils/audio";
import confetti from "canvas-confetti";

export type NavTab =
  | "home"
  | "schedule"
  | "homework"
  | "exams"
  | "grades"
  | "study"
  | "pomodoro"
  | "bag"
  | "ai"
  | "notifications"
  | "settings";

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  profile: StudentProfile;
  updateProfile: (profile: Partial<StudentProfile>) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  lessons: Lesson[];
  addLesson: (lesson: Omit<Lesson, "id">) => void;
  updateLesson: (id: string, lesson: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  homeworks: Homework[];
  addHomework: (hw: Omit<Homework, "id">) => void;
  toggleHomework: (id: string) => void;
  deleteHomework: (id: string) => void;
  exams: Exam[];
  addExam: (exam: Omit<Exam, "id">) => void;
  deleteExam: (id: string) => void;
  grades: GradeRecord[];
  updateGrade: (id: string, record: Partial<GradeRecord>) => void;
  addGradeSubject: (lessonName: string) => void;
  deleteGradeSubject: (id: string) => void;
  studyGoals: StudyGoal[];
  updateStudyGoal: (id: string, targetMinutes: number) => void;
  addStudyGoal: (lessonName: string, targetMinutes: number) => void;
  deleteStudyGoal: (id: string) => void;
  applyStudyPlanTemplate: (
    items: { lessonName: string; targetMinutes: number }[],
    replaceExisting?: boolean,
    templateTitle?: string
  ) => void;
  studyLogs: StudyLog[];
  logStudyTime: (lessonName: string, minutes: number) => void;
  bagItems: BagItem[];
  toggleBagItem: (id: string) => void;
  addBagItem: (item: Omit<BagItem, "id">) => void;
  deleteBagItem: (id: string) => void;
  packAllTomorrowItems: () => void;
  resetBagItems: () => void;
  notifications: AppNotification[];
  addNotification: (title: string, message: string, type: AppNotification["type"]) => void;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
  isFirstLaunch: boolean;
  completeOnboarding: (name: string, school: string, grade: string) => void;
  // Pomodoro shared state
  pomodoroState: {
    timeLeft: number;
    isRunning: boolean;
    mode: "work" | "shortBreak" | "longBreak";
    activeSubject: string;
    completedCycles: number;
  };
  setPomodoroState: React.Dispatch<React.SetStateAction<{
    timeLeft: number;
    isRunning: boolean;
    mode: "work" | "shortBreak" | "longBreak";
    activeSubject: string;
    completedCycles: number;
  }>>;
  // AI Chat
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string, options?: { mode?: string; subject?: string; topic?: string }) => Promise<void>;
  clearChat: () => void;
  isAiLoading: boolean;
  // Reset or import data
  exportDataAsJson: () => string;
  importDataFromJson: (jsonStr: string) => boolean;
  loadSampleData: () => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  PROFILE: "okul_asistani_profile",
  SETTINGS: "okul_asistani_settings",
  LESSONS: "okul_asistani_lessons",
  HOMEWORKS: "okul_asistani_homeworks",
  EXAMS: "okul_asistani_exams",
  GRADES: "okul_asistani_grades",
  STUDY_GOALS: "okul_asistani_study_goals",
  STUDY_LOGS: "okul_asistani_study_logs",
  BAG: "okul_asistani_bag",
  NOTIFICATIONS: "okul_asistani_notifications",
  FIRST_LAUNCH: "okul_asistani_first_launch_done",
};

// Automatic one-time cleanup to ensure fresh user starts with 100% clean slate
try {
  if (typeof window !== "undefined") {
    const isCleaned = localStorage.getItem("okul_asistani_v3_clean_slate");
    if (!isCleaned) {
      const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (savedProfile && (savedProfile.includes("Emre") || savedProfile.includes("Atatürk Anadolu"))) {
        localStorage.removeItem(STORAGE_KEYS.PROFILE);
        localStorage.removeItem(STORAGE_KEYS.LESSONS);
        localStorage.removeItem(STORAGE_KEYS.HOMEWORKS);
        localStorage.removeItem(STORAGE_KEYS.EXAMS);
        localStorage.removeItem(STORAGE_KEYS.GRADES);
        localStorage.removeItem(STORAGE_KEYS.STUDY_GOALS);
        localStorage.removeItem(STORAGE_KEYS.STUDY_LOGS);
        localStorage.removeItem(STORAGE_KEYS.BAG);
        localStorage.removeItem(STORAGE_KEYS.FIRST_LAUNCH);
      }
      localStorage.setItem("okul_asistani_v3_clean_slate", "true");
    }
  }
} catch {
  // ignore
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<NavTab>("home");

  const setActiveTab = (tab: NavTab) => {
    triggerHaptic(10);
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // State initialization with localStorage
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LESSONS);
      return saved ? JSON.parse(saved) : DEFAULT_LESSONS;
    } catch {
      return DEFAULT_LESSONS;
    }
  });

  const [homeworks, setHomeworks] = useState<Homework[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOMEWORKS);
      return saved ? JSON.parse(saved) : DEFAULT_HOMEWORKS;
    } catch {
      return DEFAULT_HOMEWORKS;
    }
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
      return saved ? JSON.parse(saved) : DEFAULT_EXAMS;
    } catch {
      return DEFAULT_EXAMS;
    }
  });

  const [grades, setGrades] = useState<GradeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GRADES);
      return saved ? JSON.parse(saved) : DEFAULT_GRADES;
    } catch {
      return DEFAULT_GRADES;
    }
  });

  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDY_GOALS);
      return saved ? JSON.parse(saved) : DEFAULT_STUDY_GOALS;
    } catch {
      return DEFAULT_STUDY_GOALS;
    }
  });

  const [studyLogs, setStudyLogs] = useState<StudyLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDY_LOGS);
      return saved ? JSON.parse(saved) : DEFAULT_STUDY_LOGS;
    } catch {
      return DEFAULT_STUDY_LOGS;
    }
  });

  const [bagItems, setBagItems] = useState<BagItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BAG);
      return saved ? JSON.parse(saved) : DEFAULT_BAG_ITEMS;
    } catch {
      return DEFAULT_BAG_ITEMS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
      return [
        {
          id: "n1",
          title: "Hoş Geldin! 👋",
          message: "Okul Asistanı senin için hazırlandı. Derslerini ve ödevlerini takip edebilirsin.",
          type: "system",
          timestamp: new Date().toISOString(),
          read: false,
        },
        {
          id: "n2",
          title: "Yarınki Çanta Hazırlığı 🎒",
          message: "Yarınki derslerin için çantanı hazırlamayı unutma!",
          type: "bag",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
        },
      ];
    } catch {
      return [];
    }
  });

  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
    } catch {
      return false;
    }
  });

  // Pomodoro runtime state
  const [pomodoroState, setPomodoroState] = useState({
    timeLeft: (settings.pomodoroWork || 25) * 60,
    isRunning: false,
    mode: "work" as "work" | "shortBreak" | "longBreak",
    activeSubject: "Matematik",
    completedCycles: 0,
  });

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "ai_init",
      role: "assistant",
      content: `Merhaba ${profile.name || "Öğrenci"}! 👋 Ben senin kişisel Okul Danışmanınım. Ders programın, ödevlerin, sınavların veya ders çalışma planınla ilgili her şeyi bana sorabilirsin. Sana nasıl yardımcı olabilirim?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOMEWORKS, JSON.stringify(homeworks));
  }, [homeworks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDY_GOALS, JSON.stringify(studyGoals));
  }, [studyGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDY_LOGS, JSON.stringify(studyLogs));
  }, [studyLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BAG, JSON.stringify(bagItems));
  }, [bagItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Pomodoro timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (pomodoroState.isRunning) {
      interval = setInterval(() => {
        setPomodoroState((prev) => {
          if (prev.timeLeft <= 1) {
            // Timer Finished
            if (settings.soundEnabled) playChimeSound("complete");
            if (settings.hapticEnabled) triggerHaptic([50, 100, 50, 100]);

            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.7 },
            });

            if (prev.mode === "work") {
              // Log study time
              const workMins = settings.pomodoroWork || 25;
              logStudyTime(prev.activeSubject || "Genel Çalışma", workMins);

              const newCycles = prev.completedCycles + 1;
              const nextMode = newCycles % 4 === 0 ? "longBreak" : "shortBreak";
              const nextTime = (nextMode === "longBreak" ? (settings.pomodoroLongBreak || 15) : (settings.pomodoroShortBreak || 5)) * 60;

              const title = "Pomodoro Tamamlandı! 🎉";
              const msg = `${workMins} dakikalık ${prev.activeSubject} çalışması bitti. Şimdi dinlenme vakti!`;
              addNotification(title, msg, "pomodoro");
              if (settings.notificationsEnabled) {
                sendPushNotification(title, msg);
              }

              return {
                ...prev,
                isRunning: false,
                mode: nextMode,
                timeLeft: nextTime,
                completedCycles: newCycles,
              };
            } else {
              // Break finished
              const title = "Mola Sona Erdi! ⏰";
              const msg = "Hazırsan yeni bir çalışma seansına başlayabiliriz.";
              addNotification(title, msg, "pomodoro");
              if (settings.notificationsEnabled) {
                sendPushNotification(title, msg);
              }

              return {
                ...prev,
                isRunning: false,
                mode: "work",
                timeLeft: (settings.pomodoroWork || 25) * 60,
              };
            }
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoroState.isRunning, pomodoroState.mode, settings]);

  const updateProfile = (updated: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const updateSettings = (updated: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
  };

  const completeOnboarding = (name: string, school: string, grade: string) => {
    setProfile((prev) => ({ ...prev, name, school, grade }));
    setIsFirstLaunch(false);
    localStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, "true");
    addNotification("Tebrikler! 🚀", "Okul Asistanı kurulumun tamamlandı. Başarılar dileriz!", "system");
  };

  const addLesson = (newLesson: Omit<Lesson, "id">) => {
    const lesson: Lesson = {
      ...newLesson,
      id: "lesson_" + Date.now(),
    };
    setLessons((prev) => [...prev, lesson]);
    triggerHaptic(15);
  };

  const updateLesson = (id: string, updated: Partial<Lesson>) => {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, ...updated } : l)));
  };

  const deleteLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
    triggerHaptic(20);
  };

  const addHomework = (hw: Omit<Homework, "id">) => {
    const item: Homework = {
      ...hw,
      id: "hw_" + Date.now(),
    };
    setHomeworks((prev) => [item, ...prev]);
    triggerHaptic(15);
    addNotification("Yeni Ödev Eklendi 📝", `"${item.title}" ödevi başarıyla eklendi.`, "homework");
  };

  const toggleHomework = (id: string) => {
    setHomeworks((prev) =>
      prev.map((hw) => {
        if (hw.id === id) {
          const nextCompleted = !hw.isCompleted;
          if (nextCompleted) {
            triggerHaptic([30, 60]);
            playChimeSound("complete");
            confetti({
              particleCount: 50,
              spread: 50,
              origin: { y: 0.8 },
            });
            addNotification("Ödev Tamamlandı! 🟢", `"${hw.title}" ödevini bitirdin. Tebrikler!`, "homework");
          }
          return {
            ...hw,
            isCompleted: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return hw;
      })
    );
  };

  const deleteHomework = (id: string) => {
    setHomeworks((prev) => prev.filter((hw) => hw.id !== id));
    triggerHaptic(20);
  };

  const addExam = (exam: Omit<Exam, "id">) => {
    const item: Exam = {
      ...exam,
      id: "exam_" + Date.now(),
    };
    setExams((prev) => [...prev, item].sort((a, b) => a.date.localeCompare(b.date)));
    triggerHaptic(15);
    addNotification("Yeni Sınav Eklendi 📅", `${item.lessonName} (${item.examType}) takvime eklendi.`, "exam");
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    triggerHaptic(20);
  };

  const updateGrade = (id: string, record: Partial<GradeRecord>) => {
    setGrades((prev) => prev.map((g) => (g.id === id ? { ...g, ...record } : g)));
  };

  const addGradeSubject = (lessonName: string) => {
    const newRecord: GradeRecord = {
      id: "grade_" + Date.now(),
      lessonName,
      written1: null,
      written2: null,
      written3: null,
      oral1: null,
      oral2: null,
      performance: null,
      project: null,
      targetGrade: 85,
    };
    setGrades((prev) => [...prev, newRecord]);
    triggerHaptic(15);
  };

  const deleteGradeSubject = (id: string) => {
    setGrades((prev) => prev.filter((g) => g.id !== id));
    triggerHaptic(20);
  };

  const updateStudyGoal = (id: string, targetMinutes: number) => {
    setStudyGoals((prev) => prev.map((g) => (g.id === id ? { ...g, targetMinutes } : g)));
  };

  const addStudyGoal = (lessonName: string, targetMinutes: number) => {
    const newGoal: StudyGoal = {
      id: "sg_" + Date.now(),
      lessonName,
      targetMinutes,
    };
    setStudyGoals((prev) => [...prev, newGoal]);
    triggerHaptic(15);
  };

  const deleteStudyGoal = (id: string) => {
    setStudyGoals((prev) => prev.filter((g) => g.id !== id));
    triggerHaptic(20);
  };

  const applyStudyPlanTemplate = (
    items: { lessonName: string; targetMinutes: number }[],
    replaceExisting: boolean = true,
    templateTitle?: string
  ) => {
    const newGoals: StudyGoal[] = items.map((item, idx) => ({
      id: "sg_tpl_" + Date.now() + "_" + idx,
      lessonName: item.lessonName,
      targetMinutes: item.targetMinutes,
    }));

    if (replaceExisting) {
      setStudyGoals(newGoals);
    } else {
      // Append non-duplicate goals or add
      setStudyGoals((prev) => {
        const existingNames = new Set(prev.map((g) => g.lessonName.toLowerCase()));
        const filteredNew = newGoals.filter(
          (g) => !existingNames.has(g.lessonName.toLowerCase())
        );
        return [...prev, ...filteredNew];
      });
    }

    triggerHaptic([25, 60]);
    playChimeSound("complete");
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
    });

    if (templateTitle) {
      addNotification(
        "Çalışma Planı Uygulandı! 🎯",
        `"${templateTitle}" şablonu aktif hedeflerinize yüklendi.`,
        "system"
      );
    }
  };

  const logStudyTime = (lessonName: string, minutes: number) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newLog: StudyLog = {
      id: "sl_" + Date.now(),
      lessonName,
      minutes,
      date: todayStr,
      timestamp: new Date().toISOString(),
    };
    setStudyLogs((prev) => [newLog, ...prev]);
  };

  const toggleBagItem = (id: string) => {
    triggerHaptic(10);
    setBagItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, packed: !item.packed } : item))
    );
  };

  const addBagItem = (item: Omit<BagItem, "id">) => {
    const newItem: BagItem = {
      ...item,
      id: "bag_" + Date.now(),
    };
    setBagItems((prev) => [...prev, newItem]);
    triggerHaptic(15);
  };

  const deleteBagItem = (id: string) => {
    setBagItems((prev) => prev.filter((item) => item.id !== id));
    triggerHaptic(20);
  };

  const packAllTomorrowItems = () => {
    triggerHaptic([30, 40]);
    playChimeSound("complete");
    confetti({ particleCount: 35, spread: 45, origin: { y: 0.8 } });
    setBagItems((prev) => prev.map((item) => ({ ...item, packed: true })));
  };

  const resetBagItems = () => {
    triggerHaptic(20);
    setBagItems((prev) => prev.map((item) => ({ ...item, packed: false })));
  };

  const addNotification = (title: string, message: string, type: AppNotification["type"]) => {
    const newNotif: AppNotification = {
      id: "n_" + Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 30)]);
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const sendChatMessage = async (
    content: string,
    options?: { mode?: string; subject?: string; topic?: string }
  ) => {
    if (!content.trim() && !options?.topic) return;

    const displayContent = content.trim() || `"${options?.topic}" konusu için anlatım hazırla`;
    const userMsg: ChatMessage = {
      id: "user_" + Date.now(),
      role: "user",
      content: displayContent,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      // Calculate current student context
      const studentContext = {
        profile,
        timetable: lessons,
        homeworks: homeworks.map((h) => ({
          title: h.title,
          lesson: h.lessonName,
          dueDate: h.dueDate,
          priority: h.priority,
          isCompleted: h.isCompleted,
        })),
        exams: exams.map((e) => ({
          lesson: e.lessonName,
          type: e.examType,
          date: e.date,
          time: e.time,
        })),
        grades: grades.map((g) => ({
          lesson: g.lessonName,
          written: [g.written1, g.written2, g.written3].filter((x) => x !== null),
          oral: [g.oral1, g.oral2].filter((x) => x !== null),
          performance: g.performance,
          project: g.project,
          target: g.targetGrade,
        })),
        studyStats: {
          goals: studyGoals,
          recentLogs: studyLogs.slice(0, 10),
        },
        bagItems: bagItems.map((b) => ({
          name: b.itemName,
          lesson: b.lessonName,
          packed: b.packed,
        })),
      };

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: content.trim(),
          history: chatMessages.slice(-6),
          studentContext,
          mode: options?.mode,
          subject: options?.subject,
          topic: options?.topic,
        }),
      });

      if (!response.ok) {
        throw new Error("Yapay Zekâ sunucusuna bağlanılamadı.");
      }

      const data = await response.json();
      const aiReply: ChatMessage = {
        id: "ai_" + Date.now(),
        role: "assistant",
        content: data.reply || "Yanıt alınamadı.",
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: "err_" + Date.now(),
        role: "assistant",
        content:
          "⚠️ Yapay Zekâ Danışmanı için internet bağlantısı gerekiyor. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: "ai_init_" + Date.now(),
        role: "assistant",
        content: `Sohbet temizlendi. Hangi dersin konusunu anlatmamı istersin veya okul hayatınla ilgili ne sormak istersin?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const exportDataAsJson = (): string => {
    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      profile,
      settings,
      lessons,
      homeworks,
      exams,
      grades,
      studyGoals,
      studyLogs,
      bagItems,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.lessons) setLessons(parsed.lessons);
      if (parsed.homeworks) setHomeworks(parsed.homeworks);
      if (parsed.exams) setExams(parsed.exams);
      if (parsed.grades) setGrades(parsed.grades);
      if (parsed.studyGoals) setStudyGoals(parsed.studyGoals);
      if (parsed.studyLogs) setStudyLogs(parsed.studyLogs);
      if (parsed.bagItems) setBagItems(parsed.bagItems);
      addNotification("Yedek Geri Yüklendi ✅", "Verileriniz başarıyla geri yüklendi.", "system");
      return true;
    } catch (e) {
      return false;
    }
  };

  const loadSampleData = () => {
    setProfile(SAMPLE_PROFILE);
    setLessons(SAMPLE_LESSONS);
    setHomeworks(SAMPLE_HOMEWORKS);
    setExams(SAMPLE_EXAMS);
    setGrades(SAMPLE_GRADES);
    setStudyGoals(SAMPLE_STUDY_GOALS);
    setStudyLogs(SAMPLE_STUDY_LOGS);
    setBagItems(SAMPLE_BAG_ITEMS);
    addNotification("Örnek Veriler Yüklendi 📚", "Örnek ders programı ve sınav verileri yüklendi.", "system");
  };

  const clearAllData = () => {
    setProfile(DEFAULT_PROFILE);
    setLessons([]);
    setHomeworks([]);
    setExams([]);
    setGrades([]);
    setStudyGoals([]);
    setStudyLogs([]);
    setBagItems([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.LESSONS);
      localStorage.removeItem(STORAGE_KEYS.HOMEWORKS);
      localStorage.removeItem(STORAGE_KEYS.EXAMS);
      localStorage.removeItem(STORAGE_KEYS.GRADES);
      localStorage.removeItem(STORAGE_KEYS.STUDY_GOALS);
      localStorage.removeItem(STORAGE_KEYS.STUDY_LOGS);
      localStorage.removeItem(STORAGE_KEYS.BAG);
    } catch {
      // ignore
    }
    addNotification("Veriler Sıfırlandı 🧹", "Tüm dersleriniz ve verileriniz temizlendi.", "system");
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        profile,
        updateProfile,
        settings,
        updateSettings,
        lessons,
        addLesson,
        updateLesson,
        deleteLesson,
        homeworks,
        addHomework,
        toggleHomework,
        deleteHomework,
        exams,
        addExam,
        deleteExam,
        grades,
        updateGrade,
        addGradeSubject,
        deleteGradeSubject,
        studyGoals,
        updateStudyGoal,
        addStudyGoal,
        deleteStudyGoal,
        applyStudyPlanTemplate,
        studyLogs,
        logStudyTime,
        bagItems,
        toggleBagItem,
        addBagItem,
        deleteBagItem,
        packAllTomorrowItems,
        resetBagItems,
        notifications,
        addNotification,
        markNotificationsAsRead,
        clearNotifications,
        isFirstLaunch,
        completeOnboarding,
        pomodoroState,
        setPomodoroState,
        chatMessages,
        sendChatMessage,
        clearChat,
        isAiLoading,
        exportDataAsJson,
        importDataFromJson,
        loadSampleData,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
