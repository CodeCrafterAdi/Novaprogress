
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TempleType, UserProfile, Category, Task } from '../../types';
import MirrorButton from '../UI/MirrorButton';
import { useNotification } from '../UI/NotificationProvider';
import { supabase } from '../../lib/supabaseClient';
import LevelUpOverlay from './LevelUpOverlay';
import { 
  HomeView, FitnessView, SkillsView, BusinessView, MissionView, 
  AnalyticsView, ProfileView, AIView, GenericCategoryView, QuestModal 
} from './Views';
import RoadmapEditor from './RoadmapEditor';

// Icons
const Icons = {
  HOME: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  FITNESS: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  SKILLS: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  BUSINESS: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  MISSION: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  ANALYTICS: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /></svg>,
  PROFILE: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  ROADMAP: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  AI: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  ADD: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'HOME', label: 'Home', icon: Icons.HOME, color: '#ffffff' },
  { id: 'FITNESS', label: 'Fitness', icon: Icons.FITNESS, color: '#ef4444' },
  { id: 'MISSION', label: 'Mission', icon: Icons.MISSION, color: '#6366f1' },
  { id: 'SKILLS', label: 'Skills', icon: Icons.SKILLS, color: '#3b82f6' },
  { id: 'BUSINESS', label: 'Business', icon: Icons.BUSINESS, color: '#eab308' },
  { id: 'ROADMAP', label: 'Roadmap', icon: Icons.ROADMAP, color: '#f87171' },
  { id: 'AI', label: 'Oracle', icon: Icons.AI, color: '#8b5cf6' },
  { id: 'ANALYTICS', label: 'Analytics', icon: Icons.ANALYTICS, color: '#14b8a6' },
  { id: 'PROFILE', label: 'Identity', icon: Icons.PROFILE, color: '#22c55e' },
];

interface DashboardShellProps { userId: string; }

// Color mapping for rings based on level range
const getLevelColor = (lvl: number) => {
    if (lvl >= 50) return '#ffd700'; // Gold S-Rank
    if (lvl >= 40) return '#ef4444'; // Red A-Rank
    if (lvl >= 30) return '#a855f7'; // Purple B-Rank
    if (lvl >= 20) return '#3b82f6'; // Blue C-Rank
    if (lvl >= 10) return '#22c55e'; // Green D-Rank
    return '#ffffff'; // White E-Rank
};

const DashboardShell: React.FC<DashboardShellProps> = ({ userId }) => {
  const { addToast } = useNotification();
  const [activeView, setActiveView] = useState<TempleType>('HOME');
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // Stats
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [globalTasks, setGlobalTasks] = useState<Task[]>([]);
  
  // Categories
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#ff0000');

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: userId, email: 'hunter@nova.system', username: 'HUNTER', height: '0', weight: '0', age: '0', gender: 'MALE', dob: '', bio: 'System Initialized.', api_key: '', is_premium: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
       // Prefer remote
       const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
       if (data) {
           setUserProfile(data as UserProfile);
           localStorage.setItem(`nova_profile_${userId}`, JSON.stringify(data));
       } else {
           // Fallback local
           const localStr = localStorage.getItem(`nova_profile_${userId}`);
           if (localStr) { try { setUserProfile(JSON.parse(localStr)); } catch(e) {} }
       }
    };
    fetchProfile();
  }, [userId]);

  const fetchGlobalStats = async () => {
     let allTasks: Task[] = [];
     try { const { data } = await supabase.from('tasks').select('*').eq('user_id', userId); if (data) allTasks = data as Task[]; } catch (e) {}
     try { const stored = localStorage.getItem(`nova_local_tasks_${userId}`); if (stored) allTasks = [...allTasks, ...JSON.parse(stored)]; } catch (e) {}
     allTasks = Array.from(new Map(allTasks.map(item => [item.id, item])).values());
     setGlobalTasks(allTasks);

     const xp = allTasks.filter(t => t.completed).reduce((sum, t) => sum + (t.xp_value || 10), 0);
     const calculatedLevel = Math.floor(xp / 100) + 1;

     if (calculatedLevel > level && level > 0) {
        setShowLevelUp(true);
        if (calculatedLevel % 5 === 0) {
            addToast(`ASCENSION CHALLENGE: LEVEL ${calculatedLevel}`, 'warning');
            setTimeout(() => addToast("OBJECTIVE: EARN 500 XP TO UNLOCK NEXT TIER", 'info'), 1000);
        }
     }
     setTotalXP(xp);
     setLevel(calculatedLevel);
  };

  useEffect(() => {
    fetchGlobalStats();
    const channel = supabase.channel('global_stats').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, fetchGlobalStats).subscribe();
    window.addEventListener('nova_tasks_update', fetchGlobalStats);
    return () => { supabase.removeChannel(channel); window.removeEventListener('nova_tasks_update', fetchGlobalStats); };
  }, [userId, level]);

  useEffect(() => {
    const saved = localStorage.getItem('nova_custom_categories');
    if (saved) { try { setCategories([...DEFAULT_CATEGORIES, ...JSON.parse(saved)]); } catch (e) {} }
  }, []);

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) { addToast('CATEGORY NAME REQUIRED', 'error'); return; }
    const newId = newCategoryName.toUpperCase().replace(/\s+/g, '_');
    if (categories.some(c => c.id === newId)) { addToast('CATEGORY ALREADY EXISTS', 'warning'); return; }
    const newCategory: Category = { id: newId, label: newCategoryName, icon: <span className="text-xl font-bold">{newCategoryName.charAt(0)}</span>, color: newCategoryColor, isCustom: true };
    const updated = [...categories, newCategory];
    setCategories(updated);
    localStorage.setItem('nova_custom_categories', JSON.stringify(updated.filter(c => c.isCustom)));
    setNewCategoryName(''); setIsCategoryModalOpen(false);
    addToast(`CATEGORY "${newCategoryName}" FORGED`, 'success');
  };

  const getGradient = () => {
    const activeCat = categories.find(c => c.id === activeView);
    if (!activeCat) return 'from-purple-900/20 via-black to-black';
    switch (activeView) {
      case 'FITNESS': return 'from-red-900/20 via-black to-black';
      case 'SKILLS': return 'from-blue-900/20 via-black to-black';
      case 'BUSINESS': return 'from-yellow-900/20 via-black to-black';
      case 'MISSION': return 'from-indigo-900/20 via-black to-black';
      case 'PROFILE': return 'from-green-900/20 via-black to-black';
      case 'ROADMAP': return 'from-gray-900 via-black to-black';
      case 'AI': return 'from-violet-900/20 via-black to-black';
      default: return 'from-pink-900/10 via-black to-black'; 
    }
  };

  const levelColor = getLevelColor(level);

  return (
    <div className={`flex h-screen w-full bg-black text-white overflow-hidden transition-colors duration-1000 bg-gradient-to-br ${getGradient()}`}>
      <AnimatePresence>
         {showLevelUp && <LevelUpOverlay level={level} onClose={() => setShowLevelUp(false)} />}
      </AnimatePresence>

      <motion.aside initial={{ x: -100 }} animate={{ x: 0 }} className="w-20 md:w-24 border-r border-white/5 bg-black/50 backdrop-blur-xl flex flex-col items-center py-8 z-50 overflow-y-auto custom-scrollbar">
        <div className="mb-8 text-red-500 text-3xl font-display font-bold">V8</div>
        <nav className="flex flex-col gap-4 flex-1 w-full items-center">
          {categories.map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className={`relative group p-3 rounded-xl transition-all duration-300 w-12 h-12 flex items-center justify-center ${activeView === item.id ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`} style={{ color: activeView === item.id ? item.color : undefined }}>
              {item.icon}
              {activeView === item.id && <motion.div layoutId="active-pill" className="absolute left-[-8px] top-2 bottom-2 w-1 rounded-r-full" style={{ backgroundColor: item.color }} />}
              <div className="absolute left-16 bg-black border border-white/10 px-2 py-1 rounded text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">{item.label}</div>
            </button>
          ))}
          <button onClick={() => setIsCategoryModalOpen(true)} className="p-3 rounded-xl text-white/30 hover:text-white hover:bg-white/10 transition-all border border-dashed border-white/10 hover:border-white/30 mt-4 group relative">{Icons.ADD}</button>
        </nav>
      </motion.aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-sm z-40 shrink-0">
           <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-xs font-mono tracking-[0.2em] text-white/50">SYSTEM ONLINE</span></div>
           <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                 <div className="text-xs text-gray-400 font-mono">HUNTER RANK</div>
                 <div className="text-xl font-display font-bold text-yellow-500 flex items-center justify-end gap-2">LVL {level}</div>
              </div>
              <div 
                className="w-10 h-10 rounded-full bg-gray-800 border-2 overflow-hidden cursor-pointer transition-all duration-500 hover:scale-110" 
                style={{ borderColor: levelColor, boxShadow: `0 0 15px ${levelColor}80` }}
                onClick={() => setActiveView('PROFILE')}
              >
                 <img src={userProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.username}`} alt="User" className="w-full h-full object-cover" />
              </div>
           </div>
        </header>

        <div className={`flex-1 relative ${activeView === 'ROADMAP' ? 'overflow-hidden p-0' : 'overflow-y-auto custom-scrollbar p-6 md:p-8'}`}>
          <AnimatePresence mode='wait'>
            <motion.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className={`h-full ${activeView === 'ROADMAP' ? 'w-full' : 'max-w-7xl mx-auto'}`}>
              {activeView === 'HOME' && <HomeView userId={userId} onNavigate={setActiveView} username={userProfile.username} onOpenQuest={() => setIsQuestModalOpen(true)} />}
              {activeView === 'FITNESS' && <FitnessView userId={userId} onOpenQuest={() => setIsQuestModalOpen(true)} />}
              {activeView === 'BUSINESS' && <BusinessView userId={userId} onOpenQuest={() => setIsQuestModalOpen(true)} />}
              {activeView === 'SKILLS' && <SkillsView userId={userId} onOpenQuest={() => setIsQuestModalOpen(true)} />}
              {activeView === 'MISSION' && <MissionView userId={userId} onOpenQuest={() => setIsQuestModalOpen(true)} />}
              {activeView === 'ROADMAP' && <RoadmapEditor userId={userId} />}
              {activeView === 'AI' && <AIView userId={userId} profile={userProfile} tasks={globalTasks} />}
              {activeView === 'ANALYTICS' && <AnalyticsView tasks={globalTasks} level={level} xp={totalXP} />}
              {activeView === 'PROFILE' && <ProfileView userId={userId} profile={userProfile} setProfile={setUserProfile} level={level} />}
              {DEFAULT_CATEGORIES.every(c => c.id !== activeView) && <GenericCategoryView id={activeView} userId={userId} category={categories.find(c => c.id === activeView)} onOpenQuest={() => setIsQuestModalOpen(true)} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isQuestModalOpen && <QuestModal isOpen={isQuestModalOpen} onClose={() => setIsQuestModalOpen(false)} initialCategory={activeView} categories={categories} userId={userId} existingTasks={globalTasks} />}
        {isCategoryModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md bg-[#050505] border border-white/10 rounded-3xl p-6 relative shadow-2xl">
                  <h3 className="text-xl font-display font-bold text-white mb-6">FORGE NEW CATEGORY</h3>
                  <div className="space-y-4">
                     <div className="space-y-2"><label className="text-xs font-mono text-gray-500 uppercase">Category Name</label><input autoFocus value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-red-500 outline-none" placeholder="e.g. Learning" onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()} /></div>
                     <div className="space-y-2"><label className="text-xs font-mono text-gray-500 uppercase">Aura Color</label><div className="flex gap-2 flex-wrap">{['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#ec4899', '#f97316'].map(color => (<button key={color} onClick={() => setNewCategoryColor(color)} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${newCategoryColor === color ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />))}</div></div>
                  </div>
                  <div className="flex gap-4 mt-8"><MirrorButton text="FORGE" onClick={handleCreateCategory} className="flex-1" /><MirrorButton text="CANCEL" onClick={() => setIsCategoryModalOpen(false)} variant="danger" className="flex-1" /></div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardShell;
