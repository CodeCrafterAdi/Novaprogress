
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Trophy, Flame, Plus, LogOut, Settings, Activity, Brain, Briefcase, Users, Wallet, Heart, Target, Wifi, WifiOff, User, Scan, ChevronDown, CheckCircle2 } from 'lucide-react';
import { TaskModal } from './TaskModal';
import { SystemAnalysisModal } from './SystemAnalysisModal';
import { analyzeProgress } from '../services/geminiService';
import { TaskList } from './TaskList';
import { Task, Category } from '../types';
import { useNavigate } from 'react-router-dom';

// --- 3D Card Component ---
const TiltCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const Dashboard: React.FC = () => {
  const { state, logout, session, isOfflineMode, toggleOfflineMode, setGeminiError } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [aiMessage, setAiMessage] = useState("Initializing Neural Link...");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    analyzeProgress(state).then(msg => {
      if (mounted) setAiMessage(msg);
    }).catch(err => {
        if (err.message === 'GEMINI_INVALID_KEY' && mounted) {
            setAiMessage('Connection to Nova AI failed. Invalid API Key.');
            setGeminiError('GEMINI_INVALID_KEY');
        }
    });
    return () => { mounted = false; };
  }, [state.user.level, state.user.name]); 

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    if (hour < 18) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };

  const xpProgress = (state.user.xp % 1000) / 10; 

  const categories = [
    { id: 'Fitness', icon: Activity, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'Skills', icon: Brain, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'Business', icon: Briefcase, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { id: 'Family', icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'Finance', icon: Wallet, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { id: 'Wellness', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  ];

  return (
    <div className="space-y-10" onClick={() => setShowProfileMenu(false)}>
      {/* 3D Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
         <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-primary rounded-full animate-float opacity-40"></div>
         <div className="absolute top-[60%] right-[20%] w-3 h-3 bg-accent rounded-full animate-float opacity-30" style={{ animationDelay: '2s' }}></div>
         <div className="absolute bottom-[20%] left-[30%] w-1 h-1 bg-white rounded-full animate-float opacity-20" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <motion.div 
             initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-gray-400 mb-2"
          >
             <span className={`w-2 h-2 rounded-full ${isOfflineMode ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
             {isOfflineMode ? 'Offline Simulation Active' : 'System Online'}
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-white tracking-tight drop-shadow-2xl">
            {getGreeting()} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryLight via-white to-accent animate-pulse">{state.user.name.toUpperCase()}</span>
          </h1>
          <p className="text-gray-400 mt-2 font-mono text-sm tracking-wide flex items-center gap-3">
             <span className="px-2 py-0.5 bg-primary/20 rounded text-primaryLight border border-primary/20">{state.user.rank}</span>
             <span>LEVEL {state.user.level}</span>
          </p>
        </div>
        
        {/* Profile Avatar */}
        <div className="relative z-50">
            <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); }}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-full blur-xl opacity-40 animate-pulse-slow"></div>
                <div className="relative w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center bg-voidLight hover:border-accent transition-colors overflow-hidden shadow-2xl">
                   {/* Avatar Image Placeholder */}
                   <img 
                    src={state.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${state.user.name}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover opacity-90" 
                   />
                </div>
            </motion.div>

            {/* Dropdown */}
            <AnimatePresence>
                {showProfileMenu && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, rotateX: -15 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, y: 10, rotateX: -15 }}
                        className="absolute right-0 top-24 w-64 bg-voidLight/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
                            <p className="text-sm font-bold text-white truncate">{state.user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{session?.user.email || 'offline@novaprogress.ai'}</p>
                        </div>
                        <div className="p-2 space-y-1">
                             <button 
                                onClick={() => navigate('/profile')}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
                             >
                                <User size={16} className="text-purple-400 group-hover:text-purple-300" /> View Identity
                             </button>
                             
                             <button 
                                onClick={toggleOfflineMode}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${isOfflineMode ? 'text-green-400 hover:bg-green-500/10' : 'text-orange-400 hover:bg-orange-500/10'}`}
                             >
                                {isOfflineMode ? <Wifi size={16} /> : <WifiOff size={16} />}
                                {isOfflineMode ? 'Reconnect System' : 'Simulate Offline'}
                             </button>

                             <button 
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                             >
                                <LogOut size={16} /> {isOfflineMode ? 'Reset Simulation' : 'Disconnect'}
                             </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* AI Insight Bar */}
      <TiltCard className="w-full">
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-primary relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent opacity-10 blur-3xl rounded-full"></div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-primary/20 rounded-lg border border-primary/30">
                      <Target className="text-primaryLight w-5 h-5" />
                  </div>
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-accent uppercase tracking-wider">Nova AI Analysis</span>
                          <div className="h-px bg-accent/30 flex-grow w-12"></div>
                      </div>
                      <p className="text-gray-200 text-sm md:text-base italic leading-relaxed">"{aiMessage}"</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAnalysisOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider text-purple-300 transition-all hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] whitespace-nowrap"
                >
                   <Scan size={14} /> Full System Scan
                </motion.button>
            </div>
        </div>
      </TiltCard>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TiltCard>
            <StatCard label="Daily Streak" value={state.user.streak} icon={Flame} color="text-orange-500" subColor="bg-orange-500/20" />
        </TiltCard>
        <TiltCard>
            <StatCard label="Total XP" value={state.user.xp.toLocaleString()} icon={Trophy} color="text-yellow-400" subColor="bg-yellow-500/20" />
        </TiltCard>
        
        {/* Level Progress (Wide) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-center glass-panel-hover transition-all duration-300">
            <div className="flex justify-between items-end mb-3 relative z-10">
              <div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Current Level</div>
                  <div className="text-3xl font-display font-bold">{state.user.level}</div>
              </div>
              <div className="text-right">
                  <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Next Rank</div>
                  <div className="text-sm font-bold text-primaryLight">{Math.round(xpProgress)}%</div>
              </div>
            </div>
            
            {/* 3D Progress Bar */}
            <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary via-purple-500 to-accent relative"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              </motion.div>
            </div>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
         {categories.map((cat, i) => (
             <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all bg-voidLight/50 flex flex-col items-center gap-2 cursor-default group hover:-translate-y-1 hover:shadow-lg`}
             >
                <div className={`p-2 rounded-lg ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                    <cat.icon size={20} />
                </div>
                <div className="text-xs font-bold text-gray-300">{cat.id}</div>
                <div className="text-[10px] text-gray-500">Lvl {state.user.stats[cat.id as Category] || 1}</div>
             </motion.div>
         ))}
      </div>

      {/* Active Tasks */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-accent rounded-full"></div>
              <h2 className="text-3xl font-display font-bold text-white">Active Protocols</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(91,33,182,0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primaryLight rounded-xl text-sm font-bold text-white shadow-lg border border-white/10 transition-colors"
          >
            <Plus size={18} /> INITIATE QUEST
          </motion.button>
        </div>
        
        <TaskList tasks={state.tasks.filter(t => !t.isCompleted)} onEditTask={handleEditTask} />

        {/* Mission Logs (Completed) */}
        <div className="pt-8 border-t border-white/5">
            <button 
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors uppercase font-bold tracking-wider mb-4"
            >
                {showCompleted ? <ChevronDown size={16} /> : <CheckCircle2 size={16} />}
                Mission Logs (Completed)
            </button>
            <AnimatePresence>
                {showCompleted && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <TaskList tasks={state.tasks.filter(t => t.isCompleted)} onEditTask={handleEditTask} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

      <TaskModal isOpen={isModalOpen} onClose={handleCloseModal} taskToEdit={taskToEdit} />
      <SystemAnalysisModal isOpen={isAnalysisOpen} onClose={() => setIsAnalysisOpen(false)} />
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: any; color: string; subColor: string }> = ({ label, value, icon: Icon, color, subColor }) => (
  <div className="glass-panel p-6 rounded-2xl flex items-center gap-5 relative overflow-hidden group h-full glass-panel-hover transition-all duration-300">
    <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${subColor} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
    <div className={`p-4 rounded-xl bg-white/5 ${color} shadow-[0_0_15px_rgba(0,0,0,0.2)] relative z-10 group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={28} />
    </div>
    <div className="relative z-10">
      <div className="text-3xl font-bold font-display tracking-tight text-white drop-shadow-md">{value}</div>
      <div className="text-xs text-gray-400 uppercase tracking-widest font-mono mt-1">{label}</div>
    </div>
  </div>
);