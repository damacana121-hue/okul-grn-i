import React from "react";
import { useApp } from "../context/AppContext";
import {
  Bell,
  CheckCircle2,
  Trash2,
  Calendar,
  Briefcase,
  Timer,
  CheckSquare,
  Sparkles,
  Info,
} from "lucide-react";
import { requestNotificationPermission, sendPushNotification } from "../utils/audio";

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationsAsRead,
    clearNotifications,
    addNotification,
    settings,
    updateSettings,
  } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return <Bell className="w-4 h-4 text-indigo-400" />;
      case "exam":
        return <Calendar className="w-4 h-4 text-rose-400" />;
      case "homework":
        return <CheckSquare className="w-4 h-4 text-amber-400" />;
      case "bag":
        return <Briefcase className="w-4 h-4 text-sky-400" />;
      case "pomodoro":
        return <Timer className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermission();
    addNotification(
      "Test Bildirimi 🔔",
      "Okul Asistanı bildirim sistemi sorunsuz çalışıyor!",
      "system"
    );
    if (granted || settings.notificationsEnabled) {
      sendPushNotification(
        "Okul Asistanı 🔔",
        "Test bildirimi: Dersler ve ödevler için bildirimlerin hazır!"
      );
    }
  };

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Bildirim Geçmişi</h2>
          <p className="text-xs text-slate-400">
            Ders, sınav, ödev ve çanta hatırlatmaları
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={markNotificationsAsRead}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            Okundu İşaretle
          </button>
          <button
            onClick={clearNotifications}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition"
            title="Tümünü Temizle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Test Notification Banner */}
      <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-3xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Bildirim İzni ve Testi</h4>
            <p className="text-[11px] text-indigo-200">
              Telefonunda veya tarayıcında anlık bildirimleri dene
            </p>
          </div>
        </div>

        <button
          onClick={handleTestNotification}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shrink-0"
        >
          Bildirim Gönder
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-8 text-center">
            <p className="text-sm font-semibold text-slate-300">Henüz bildirim geçmişi yok.</p>
            <p className="text-xs text-slate-500 mt-1">
              Dersler, ödevler veya sınav yaklaştığında burada bildirimler göreceksin.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-3xl border transition-all flex items-start gap-3 ${
                notif.read
                  ? "bg-slate-900/60 border-slate-800/80 text-slate-400"
                  : "bg-slate-800/90 border-slate-700 text-white"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white truncate">{notif.title}</h4>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(notif.timestamp).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
