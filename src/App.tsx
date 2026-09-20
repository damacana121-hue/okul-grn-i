import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { BottomNavigation } from "./components/BottomNavigation";
import { OnboardingModal } from "./components/OnboardingModal";
import { DecorativeBackground } from "./components/DecorativeBackground";
import { HomeDashboard } from "./components/HomeDashboard";
import { ScheduleView } from "./components/ScheduleView";
import { HomeworkView } from "./components/HomeworkView";
import { ExamCalendarView } from "./components/ExamCalendarView";
import { GradesCalculatorView } from "./components/GradesCalculatorView";
import { StudyPlanView } from "./components/StudyPlanView";
import { PomodoroView } from "./components/PomodoroView";
import { SmartBagView } from "./components/SmartBagView";
import { AiConsultantView } from "./components/AiConsultantView";
import { NotificationsView } from "./components/NotificationsView";
import { SettingsView } from "./components/SettingsView";
import { motion, AnimatePresence } from "motion/react";

const MainContent: React.FC = () => {
  const { activeTab, settings } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case "home":
        return <HomeDashboard />;
      case "schedule":
        return <ScheduleView />;
      case "homework":
        return <HomeworkView />;
      case "exams":
        return <ExamCalendarView />;
      case "grades":
        return <GradesCalculatorView />;
      case "study":
        return <StudyPlanView />;
      case "pomodoro":
        return <PomodoroView />;
      case "bag":
        return <SmartBagView />;
      case "ai":
        return <AiConsultantView />;
      case "notifications":
        return <NotificationsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <HomeDashboard />;
    }
  };

  const isPhoneFrame = settings.simulatedPhoneFrame;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      <DecorativeBackground />
      <OnboardingModal />

      {/* Main Container: either simulated Android Device frame or standard mobile container */}
      <div
        className={`w-full transition-all duration-300 ${
          isPhoneFrame
            ? "max-w-[425px] my-6 rounded-[44px] border-[10px] border-slate-800 shadow-2xl shadow-indigo-950/80 overflow-hidden bg-slate-950 min-h-[850px] relative ring-1 ring-slate-700"
            : "max-w-2xl min-h-screen"
        }`}
      >
        {/* Android Punch-hole camera simulator when phone frame is active */}
        {isPhoneFrame && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700 z-50 pointer-events-none" />
        )}

        {/* Top Header */}
        <Header />

        {/* View Body */}
        <main className="px-3.5 sm:px-4 pt-3 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
