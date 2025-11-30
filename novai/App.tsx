
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CategoryView } from './components/CategoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { ProjectView } from './components/ProjectView';
import { ProfileView } from './components/ProfileView';
import { AppState, Task, BusinessVenture, SkillNode, Project, UserProfile } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { AuthModal } from './components/AuthModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { LandingPage } from './components/LandingPage';
import { WifiOff, Wifi, Loader2 } from 'lucide-react';
import { useGameData } from './hooks/useGameData';
import { RANK_SYSTEM } from './constants';
import { ApiKeySetupModal } from './components/ApiKeySetupModal';
import { DatabaseSetupModal } from './components/DatabaseSetupModal';
import { AuthProvidersModal } from './components/AuthProvidersModal';
// FIXED: Import the new ResetPasswordModal component.
import { ResetPasswordModal } from './components/ResetPasswordModal';

// --- Context ---
interface AppContextType {
  state: AppState;
  session: any | null; 
  addTask: (task: Task) => void;
  editTask: (task: Task) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  updateBusiness: (venture: BusinessVenture, isDelete?: boolean) => void;
  updateSkill: (skill: SkillNode, isDelete?: boolean) => void;
  updateProject: (project: Project, isDelete?: boolean) => void;
  completeMilestone: (projectId: string, milestoneId: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  completeAllTasks: () => Promise<string>;
  geminiError: string | null;
  setGeminiError: (error: string | null) => void;
  handleSocialLogin: (provider: 'google' | 'github') => Promise<void>;
  setAuthProviderError: (provider: string | null) => void;
  openAuth: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- Main App ---

const App: React.FC = () => {
  const [session, setSession] = useState<any | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [authProviderError, setAuthProviderError] = useState<string | null>(null);
  // FIXED: Add state to control the visibility of the password reset modal.
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  // Initialize Session
  useEffect(() => {
    if (isSupabaseConfigured()) {
      // FIXED: The onAuthStateChange listener now detects the PASSWORD_RECOVERY event.
      // This is triggered when a user follows a password reset link from their email.
      const { data: { subscription } } = (supabase!.auth as any).onAuthStateChange((event: any, session: any) => {
        if (event === 'PASSWORD_RECOVERY') {
          setShowResetPassword(true);
        }
        setSession(session);
        if (session) {
           setShowAuth(false);
        } else {
           setShowOnboarding(false);
        }
      });
      return () => subscription.unsubscribe();
    } 
  }, []);

  // Use Game Engine Hook
  const { state, isOfflineMode, toggleOfflineMode, actions, loading, dbError, setDbError } = useGameData(session);

  // Check if Onboarding is needed
  useEffect(() => {
      if (!loading && session && !isOfflineMode) {
          const isNewUser = state.user.name === 'Player' || !state.user.height || state.user.height === 0;
          setShowOnboarding(isNewUser);
      }
  }, [loading, session, state.user, isOfflineMode]);

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedSubtasks = task.subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    
    actions.updateTask({ ...task, subtasks: updatedSubtasks });
  };

  const toggleTask = async (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const isNowDone = !task.isCompleted;

    // --- GAMIFICATION LOGIC ---
    // Add XP if completing, Subtract XP if undoing
    const currentXp = state.user.xp;
    const xpChange = isNowDone ? task.xpReward : -task.xpReward;
    
    // Prevent XP from going below zero (optional, but cleaner)
    const newXp = Math.max(0, currentXp + xpChange);
    
    // Recalculate Level based on new XP
    const newLevel = Math.floor(newXp / 1000) + 1;
    const rankObj = RANK_SYSTEM.find(r => newLevel >= r.minLevel) || RANK_SYSTEM[RANK_SYSTEM.length - 1];
    const newRank = rankObj.rank;
    const newTitle = rankObj.title;
    
    // Update Streak (Only add if completing, don't necessarily remove if undoing to be kind, 
    // or we can just leave streak logic for the backend cron jobs. For now, simple increment on complete).
    const newStreak = isNowDone ? state.user.streak + 1 : state.user.streak; 
    
    // Stats Update (Increment category count)
    const newStats = { ...state.user.stats };
    if (isNowDone) {
        newStats[task.category] = (newStats[task.category] || 1) + 1;
    } else {
        newStats[task.category] = Math.max(1, (newStats[task.category] || 1) - 1);
    }

    // Call the hook action to update state & DB
    actions.toggleTaskCompletion(taskId, isNowDone, newXp, newLevel, newRank, newTitle, newStreak, newStats);
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await (supabase!.auth as any).signOut();
    }
    setSession(null);
    localStorage.removeItem('nova_app_state_v6'); 
    window.location.reload();
  };

  const openAuth = () => {
      setShowAuth(true);
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    if (!supabase) return;
    try {
        // We remove `redirectTo` and rely on the Site URL configured in the Supabase dashboard.
        // This is more robust for deploying to different environments (dev, prod).
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
        });
        if (error) throw error;
    } catch (error: any) {
        if (error.message.includes("Unsupported provider")) {
            setAuthProviderError(provider);
        } else {
            console.error("Social login initiation error:", error.message);
        }
    }
  };

  // Loading Screen
  if (loading && session && !isOfflineMode) {
      return (
          <div className="min-h-screen bg-void flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
      );
  }

  return (
    <AppContext.Provider value={{ 
        state, 
        session, 
        addTask: actions.addTask, 
        editTask: actions.updateTask, 
        toggleTask,
        deleteTask: actions.deleteTask, 
        updateBusiness: actions.updateBusiness,
        updateSkill: actions.updateSkill,
        updateProject: actions.updateProject,
        completeMilestone: actions.completeMilestone,
        updateProfile: actions.updateProfile,
        toggleSubtask, 
        logout, 
        isOfflineMode,
        toggleOfflineMode,
        completeAllTasks: actions.completeAllTasks,
        geminiError,
        setGeminiError,
        handleSocialLogin,
        setAuthProviderError,
        openAuth,
    }}>
      <HashRouter>
        <AuthModal 
            isOpen={showAuth} 
            onSuccess={() => setShowAuth(false)} 
            onClose={() => setShowAuth(false)}
        />
        
        {/* FIXED: Render the new ResetPasswordModal when triggered by the auth state listener. */}
        <ResetPasswordModal 
            isOpen={showResetPassword}
            onSuccess={() => setShowResetPassword(false)}
        />
        
        {/* Render Landing Page if not logged in and not offline mode */}
        {!session && !isOfflineMode && (
            <LandingPage onEmailLogin={openAuth} />
        )}

        {showOnboarding && !showAuth && session && (
            <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
        )}
        
        {/* API Key Setup Modal */}
        <ApiKeySetupModal 
          isOpen={geminiError === 'GEMINI_INVALID_KEY'}
          onClose={() => setGeminiError(null)}
        />
        
        {/* Database Setup Modal */}
        <DatabaseSetupModal
          isOpen={!!dbError}
          onClose={() => setDbError(null)}
        />
        
        {/* Auth Provider Setup Modal */}
        <AuthProvidersModal
          isOpen={!!authProviderError}
          provider={authProviderError}
          onClose={() => setAuthProviderError(null)}
        />


        {/* Connection Status Banner */}
        {isOfflineMode && (
          <div className="fixed top-0 left-0 w-full z-[9999] bg-gradient-to-r from-orange-900/90 to-red-900/90 backdrop-blur-md border-b border-orange-500/30 text-white text-xs py-1.5 px-4 flex justify-center items-center gap-2 shadow-lg">
            <WifiOff size={14} className="text-orange-300 animate-pulse" />
            <span className="font-mono tracking-wide">OFFLINE MODE: Supabase credentials not found. System running on local data.</span>
          </div>
        )}

        {/* Only show routes if logged in (or offline) and not onboarding */}
        {(session || isOfflineMode) && !showOnboarding && <AppRoutes />}
      </HashRouter>
    </AppContext.Provider>
  );
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/projects" element={<PageWrapper><ProjectView /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><ProfileView /></PageWrapper>} />
          <Route path="/category/:id" element={<PageWrapper><CategoryView /></PageWrapper>} />
          <Route path="/analytics" element={<PageWrapper><AnalyticsView /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96, rotateX: 2 }}
    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
    exit={{ opacity: 0, scale: 1.04, rotateX: -2 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} 
    className="w-full h-full perspective-1000 origin-bottom"
  >
    {children}
  </motion.div>
);

export default App;
