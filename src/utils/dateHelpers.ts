import { Lesson, DayOfWeek } from "../types";

export const DAY_NAMES: Record<DayOfWeek, string> = {
  1: "Pazartesi",
  2: "Salı",
  3: "Çarşamba",
  4: "Perşembe",
  5: "Cuma",
  6: "Cumartesi",
  7: "Pazar",
};

export const SHORT_DAY_NAMES: Record<DayOfWeek, string> = {
  1: "Pzt",
  2: "Sal",
  3: "Çar",
  4: "Per",
  5: "Cum",
  6: "Cts",
  7: "Paz",
};

export function getCurrentDayOfWeek(): DayOfWeek {
  const jsDay = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  if (jsDay === 0) return 7;
  return jsDay as DayOfWeek;
}

export function getTomorrowDayOfWeek(): DayOfWeek {
  const current = getCurrentDayOfWeek();
  if (current === 5) return 1; // Friday -> Monday for school bag context
  if (current === 6) return 1; // Saturday -> Monday
  if (current === 7) return 1; // Sunday -> Monday
  return (current + 1) as DayOfWeek;
}

export function formatMinutesToTimeString(totalMinutes: number): string {
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hrs === 0) return `${mins} dk`;
  if (mins === 0) return `${hrs} saat`;
  return `${hrs} sa ${mins} dk`;
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function getLessonStatus(lesson: Lesson, targetDay?: DayOfWeek): "now" | "upcoming" | "past" | "otherDay" {
  const currentDay = targetDay !== undefined ? targetDay : getCurrentDayOfWeek();
  if (lesson.day !== currentDay) return "otherDay";

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseTimeToMinutes(lesson.startTime);
  const endMinutes = parseTimeToMinutes(lesson.endTime);

  if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
    return "now";
  }
  if (currentMinutes < startMinutes) {
    return "upcoming";
  }
  return "past";
}

export function getDaysLeft(targetDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = targetDateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatDaysCountdown(daysLeft: number): { text: string; color: string; badge: string } {
  if (daysLeft < 0) {
    return {
      text: `${Math.abs(daysLeft)} gün önceydi`,
      color: "text-slate-400",
      badge: "bg-slate-800/80 text-slate-300 border-slate-700",
    };
  }
  if (daysLeft === 0) {
    return {
      text: "Bugün!",
      color: "text-rose-400 font-bold",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse",
    };
  }
  if (daysLeft === 1) {
    return {
      text: "Yarın!",
      color: "text-amber-400 font-semibold",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    };
  }
  if (daysLeft <= 3) {
    return {
      text: `${daysLeft} gün kaldı`,
      color: "text-amber-300",
      badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    };
  }
  return {
    text: `${daysLeft} gün kaldı`,
    color: "text-indigo-300",
    badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  };
}

export function formatTurkishDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "short" });
  } catch {
    return dateStr;
  }
}
