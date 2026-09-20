import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Volume2,
  Vibrate,
  User,
  Download,
  Upload,
  RefreshCw,
  Smartphone,
  CheckCircle2,
  FileCode,
  Shield,
  BookOpen,
  Trash2,
} from "lucide-react";
import { downloadAndroidProjectZip } from "../utils/androidProjectExport";

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    settings,
    updateSettings,
    exportDataAsJson,
    importDataFromJson,
    loadSampleData,
    clearAllData,
    addNotification,
  } = useApp();

  const [name, setName] = useState(profile.name);
  const [school, setSchool] = useState(profile.school);
  const [grade, setGrade] = useState(profile.grade);
  const [studentNumber, setStudentNumber] = useState(profile.studentNumber || "");
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, school, grade, studentNumber });
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
    addNotification("Profil Güncellendi", "Öğrenci bilgileriniz başarıyla kaydedildi.", "system");
  };

  const handleExportBackup = () => {
    const jsonStr = exportDataAsJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OkulAsistani_Yedek_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataFromJson(content);
        if (success) {
          setIsSavedToast(true);
          setTimeout(() => setIsSavedToast(false), 2500);
        } else {
          alert("Yedek dosyası formatı geçersiz.");
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadAndroidProjectZip();
      addNotification(
        "Android Projesi İndirildi 📦",
        "ZIP arşivi indirildi. Android Studio ile doğrudan derleyebilirsiniz.",
        "system"
      );
    } catch (e) {
      alert("ZIP oluşturulurken hata meydana geldi.");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 pt-1 max-w-2xl mx-auto">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Ayarlar</h2>
          <p className="text-xs text-slate-400">
            Kişiselleştirme, profil, bildirim ve APK ayarları
          </p>
        </div>

        {isSavedToast && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 animate-pulse font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Kaydedildi!
          </span>
        )}
      </div>

      {/* 2. Android APK & Proje İndirme Modülü (Section 21) */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">📦 Android APK & Proje Dosyaları</h3>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full">
                  Hazır
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-0.5">
                Gradle, Manifest, Kotlin MainActivity, Bildirim sistemi ve ikonlar eksiksiz hazırlandı.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-indigo-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>Paket: <code className="text-indigo-300">com.okulasistani.app</code></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Derleme: <code className="text-emerald-300">./gradlew assembleDebug</code></span>
            </div>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingZip ? "Hazırlanıyor..." : "Android Projesini İndir (.ZIP)"}</span>
          </button>
        </div>
      </div>

      {/* 3. Öğrenci Profili */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Öğrenci Bilgileri</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ad Soyad</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Okul</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sınıf / Şube</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Okul Numarası</label>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="Örn: 482"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-indigo-500/25"
            >
              Profili Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* 4. Tema ve Görünüm */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Karanlık Mod (Dark Mode)</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Gözü yormayan modern koyu tonlar ve hafif mavi-mor gradyan
            </p>
          </div>
          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className={`p-2.5 rounded-2xl border transition ${
              settings.darkMode
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-slate-700 text-slate-300 border-slate-600"
            }`}
          >
            {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
          <div>
            <h4 className="text-sm font-bold text-white">Android Telefon Çerçevesi (Önizleme)</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Geniş ekranda gerçek bir telefon ekranı mockup'ı içinde görüntüle
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.simulatedPhoneFrame}
            onChange={(e) => updateSettings({ simulatedPhoneFrame: e.target.checked })}
            className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* 5. Bildirim ve Ses Ayarları */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Bildirim & Ses Tercihleri</h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Ders Bildirim Süresi</h4>
            <p className="text-[11px] text-slate-400">Ders başlamadan kaç dakika önce uyarı verilsin?</p>
          </div>
          <select
            value={settings.lessonReminderMinutes || 10}
            onChange={(e) => updateSettings({ lessonReminderMinutes: Number(e.target.value) })}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          >
            <option value={5}>5 dakika önce</option>
            <option value={10}>10 dakika önce</option>
            <option value={15}>15 dakika önce</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Akşam Çanta Hatırlatması</h4>
            <p className="text-[11px] text-slate-400">Saat 20:00'de çantanı hazırlaman için hatırlatma</p>
          </div>
          <input
            type="checkbox"
            checked={settings.bagReminderEnabled}
            onChange={(e) => updateSettings({ bagReminderEnabled: e.target.checked })}
            className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Sesli Uyarılar</h4>
            <p className="text-[11px] text-slate-400">Pomodoro bitişinde ve görev tamamlandığında melodi çal</p>
          </div>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
            className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Titreşim Desteği</h4>
            <p className="text-[11px] text-slate-400">Haptik geri bildirim (Android Vibrate API)</p>
          </div>
          <input
            type="checkbox"
            checked={settings.hapticEnabled}
            onChange={(e) => updateSettings({ hapticEnabled: e.target.checked })}
            className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* 6. Pomodoro Süreleri */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 backdrop-blur-sm space-y-3">
        <h3 className="text-sm font-bold text-white">Pomodoro Süreleri (Dakika)</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Çalışma</label>
            <input
              type="number"
              min="5"
              max="90"
              value={settings.pomodoroWork}
              onChange={(e) => updateSettings({ pomodoroWork: Number(e.target.value) })}
              className="w-full py-2 bg-slate-900 border border-slate-700 rounded-xl text-center text-sm font-bold text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Kısa Mola</label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.pomodoroShortBreak}
              onChange={(e) => updateSettings({ pomodoroShortBreak: Number(e.target.value) })}
              className="w-full py-2 bg-slate-900 border border-slate-700 rounded-xl text-center text-sm font-bold text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Uzun Mola</label>
            <input
              type="number"
              min="5"
              max="60"
              value={settings.pomodoroLongBreak}
              onChange={(e) => updateSettings({ pomodoroLongBreak: Number(e.target.value) })}
              className="w-full py-2 bg-slate-900 border border-slate-700 rounded-xl text-center text-sm font-bold text-white"
            />
          </div>
        </div>
      </div>

      {/* 7. Veri Yönetimi / Yedekleme */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 backdrop-blur-sm space-y-3">
        <h3 className="text-sm font-bold text-white">Veri Yönetimi & Yedekleme</h3>
        <p className="text-xs text-slate-400">
          Ders programınızı, notlarınızı ve ödevlerinizi cihazlar arasında aktarabilirsiniz.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleExportBackup}
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Yedek İndir (.JSON)</span>
          </button>

          <label className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Yedekten Geri Yükle</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={loadSampleData}
            className="px-3.5 py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ml-auto"
            title="Örnek Lise Müfredat Verilerini Yükle"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Örnek Verileri Yükle</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Tüm ders programınızı, ödevlerinizi ve notlarınızı sıfırlamak istediğinize emin misiniz?")) {
                clearAllData();
              }
            }}
            className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="Tüm verileri temizle ve sıfırdan başla"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Tüm Verileri Sıfırla</span>
          </button>
        </div>
      </div>
    </div>
  );
};
