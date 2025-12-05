
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { audioManager } from '../utils/audioManager';

// Providers
import { NotificationProvider } from '../components/UI/NotificationProvider';

// Components
import IntroPlayer from '../components/Intro/IntroPlayer';
import SystemOnlineScreen from '../components/Intro/SystemOnlineScreen';
import LoginPanel from '../components/Auth/LoginPanel';
import DashboardShell from '../components/HUD/DashboardShell';
import OnboardingSequence from '../components/Auth/OnboardingSequence';

type Stage = 'INTRO' | 'SYSTEM' | 'LOGIN' | 'ONBOARDING' | 'DASHBOARD';

export default function Page() {
  const [stage, setStage] = useState<Stage>('INTRO');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      // Check existing session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      
      if (existingSession) {
        setUserId(existingSession.user.id);
      }
    };
    checkUser();

    // Listen for auth changes (like password reset or magic link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) setUserId(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleIntroComplete = () => {
    setStage('SYSTEM');
  };

  const handleSystemProceed = () => {
    audioManager.stopIntroMusic();
    if (userId) {
      checkProfileAndRedirect(userId);
    } else {
      setStage('LOGIN');
    }
  };

  const handleSystemRetry = () => {
    console.log("Contract Rejected. Resetting System.");
    setStage('INTRO');
  };

  const handleLoginSuccess = (id: string) => {
    setUserId(id);
    checkProfileAndRedirect(id);
  };

  // Check if user has a profile (local or remote check logic ideally matches)
  // For zero lag, we prefer local check if available, but for correctness, should ideally rely on state.
  const checkProfileAndRedirect = async (id: string) => {
    // We assume if they have a local profile, they are onboarded. 
    // If not, we could check Supabase "profiles" table, but to keep it fast/responsive:
    const localProfile = localStorage.getItem(`nova_profile_${id}`);
    
    if (localProfile) {
      setStage('DASHBOARD');
    } else {
      // Fallback: Check remote if local missing
      const { data } = await supabase.from('profiles').select('id').eq('id', id).single();
      if (data) {
          setStage('DASHBOARD');
      } else {
          setStage('ONBOARDING');
      }
    }
  };

  const handleOnboardingComplete = () => {
    setStage('DASHBOARD');
  };

  return (
    <NotificationProvider>
      <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden select-none">
        <AnimatePresence mode="wait">
          
          {stage === 'INTRO' && (
            <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 1 }}>
              <IntroPlayer onComplete={handleIntroComplete} />
            </motion.div>
          )}

          {stage === 'SYSTEM' && (
            <motion.div 
              key="system"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            >
              <SystemOnlineScreen 
                onProceed={handleSystemProceed} 
                onRetry={handleSystemRetry}
              />
            </motion.div>
          )}

          {stage === 'LOGIN' && (
            <motion.div 
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="w-full h-full"
            >
               <LoginPanel onLoginSuccess={handleLoginSuccess} />
            </motion.div>
          )}

          {stage === 'ONBOARDING' && userId && (
            <motion.div
               key="onboarding"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, y: -50 }}
            >
               <OnboardingSequence userId={userId} onComplete={handleOnboardingComplete} />
            </motion.div>
          )}

          {stage === 'DASHBOARD' && userId && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="min-h-screen bg-[#050000]"
            >
               <DashboardShell userId={userId} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </NotificationProvider>
  );
}
