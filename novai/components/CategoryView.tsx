
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../App';
import { XP_THRESHOLDS, Category, Task, BusinessVenture, SkillNode } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { motion } from 'framer-motion';
import { TaskList } from './TaskList';
import { TaskModal } from './TaskModal';
import { BusinessModal } from './BusinessModal';
import { SkillModal } from './SkillModal';
import { generateTasks } from '../services/geminiService';
import { Wand2, Loader2, Plus, Zap, Brain, TrendingUp, Users, Wallet, Heart, Activity, MapPin, Layers } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const CategoryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const category = id as Category;
  const { state, addTask, setGeminiError } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Business Modal State
  const [isBizModalOpen, setIsBizModalOpen] = useState(false);
  const [ventureToEdit, setVentureToEdit] = useState<BusinessVenture | null>(null);

  // Skill Modal State
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<SkillNode | null>(null);

  const categoryTasks = state.tasks.filter(t => t.category === category);
  const color = CATEGORY_COLORS[category] || '#fff';
  const level = state.user.stats[category] || 1;

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  const handleOpenBizModal = (venture?: BusinessVenture) => {
    setVentureToEdit(venture || null);
    setIsBizModalOpen(true);
  };

  const handleOpenSkillModal = (skill?: SkillNode) => {
      setSkillToEdit(skill || null);
      setIsSkillModalOpen(true);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
        const newTasks = await generateTasks(state.tasks, category, state.user.level);
        newTasks.forEach(t => {
          addTask({
            id: Date.now().toString() + Math.random(),
            title: t.title || 'Unknown Quest',
            category: category,
            complexity: (t.complexity as any) || 'D',
            xpReward: t.xpReward || 50,
            isCompleted: false,
            subtasks: [],
            description: t.description,
            createdAt: Date.now(),
            tags: ['AI Generated']
          });
        });
    } catch (err: any) {
        if (err.message === 'GEMINI_INVALID_KEY') {
            setGeminiError('GEMINI_INVALID_KEY');
        }
    } finally {
        setIsGenerating(false);
    }
  };

  // --- Specialized Views based on Category ---

  const renderFitnessStats = () => {
    if (category !== 'Fitness') return null;
    const { strength, muscle, aesthetics, bodyFat } = state.deepStats.fitness;
    const radarData = [
      { subject: 'Upper', A: strength.upper, fullMark: 100 },
      { subject: 'Lower', A: strength.lower, fullMark: 100 },
      { subject: 'Core', A: strength.core, fullMark: 100 },
      { subject: 'Grip', A: strength.grip, fullMark: 100 },
      { subject: 'Func', A: strength.functional, fullMark: 100 },
    ];

    return (
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="glass-panel p-4 rounded-xl h-[300px]">
           <h3 className="text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">Strength Matrix</h3>
           <ResponsiveContainer width="100%" height="90%">
             <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
               <PolarGrid stroke="rgba(255,255,255,0.1)" />
               <PolarAngleAxis dataKey="subject" tick={{ fill: '#ef4444', fontSize: 10 }} />
               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
               <Radar name="Str" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.3} />
             </RadarChart>
           </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <StatBox label="Body Fat" value={`${bodyFat}%`} sub="Estimated" color="text-red-400" />
           <StatBox label="Mass Score" value={muscle.mass_score} sub="Hypertrophy" color="text-red-400" />
           <StatBox label="Aesthetics" value={aesthetics.appeal} sub="Visual Impact" color="text-red-400" />
           <div className="glass-panel p-4 rounded-xl flex flex-col justify-center">
              <div className="text-xs text-gray-500 uppercase">Weak Points</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {muscle.weak_points.map(wp => (
                  <span key={wp} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded">{wp}</span>
                ))}
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderSkillTree = () => {
    if (category !== 'Skills') return null;
    return (
      <div className="mb-8 space-y-4">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Active Neural Pathways</h3>
            <button 
                onClick={() => handleOpenSkillModal()}
                className="text-xs flex items-center gap-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors border border-blue-500/20"
            >
                <Plus size={12} /> Add Skill
            </button>
         </div>
         <div className="grid md:grid-cols-3 gap-4">
            {['mind', 'communication', 'creative'].map((treeKey) => (
               <div key={treeKey} className="glass-panel p-4 rounded-xl">
                  <div className="text-xs text-gray-500 uppercase mb-3 border-b border-white/5 pb-2">{treeKey}</div>
                  <div className="space-y-3">
                    {(state.deepStats.skills as any)[treeKey].map((skill: any) => (
                       <motion.div 
                         key={skill.id} 
                         onClick={() => handleOpenSkillModal(skill)}
                         whileHover={{ x: 2 }}
                         className="cursor-pointer group"
                       >
                          <div className="flex justify-between text-sm mb-1">
                             <span className="text-gray-200 group-hover:text-blue-300 transition-colors flex items-center gap-2">
                                {skill.name}
                                {skill.techniques && skill.techniques.length > 0 && (
                                    <span className="text-[9px] bg-white/10 px-1 rounded text-gray-500">{skill.techniques.filter((t:any) => t.acquired).length}/{skill.techniques.length}</span>
                                )}
                             </span>
                             <span className="text-blue-400 font-mono text-xs">{skill.rank}-Rank (Lv.{skill.level})</span>
                          </div>
                          <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 group-hover:bg-blue-400 transition-colors" style={{ width: `${skill.mastery}%` }}></div>
                          </div>
                       </motion.div>
                    ))}
                    {(state.deepStats.skills as any)[treeKey].length === 0 && (
                        <div className="text-center py-4 text-xs text-gray-600 italic">No skills initialized</div>
                    )}
                  </div>
               </div>
            ))}
         </div>
      </div>
    );
  };

  const renderBusinessStats = () => {
    if (category !== 'Business') return null;
    return (
      <div className="mb-8 grid md:grid-cols-2 gap-4">
         {state.deepStats.business.map(biz => (
           <motion.div 
             key={biz.id} 
             onClick={() => handleOpenBizModal(biz)}
             whileHover={{ scale: 1.02 }}
             className="glass-panel p-5 rounded-xl border-l-4 border-yellow-500 relative overflow-hidden group cursor-pointer"
           >
              <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                 {biz.type === 'Venue' ? <MapPin size={60} /> : <TrendingUp size={60} />}
              </div>
              <div className="relative z-10">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {biz.name}
                    {biz.subVentures && biz.subVentures.length > 0 && <span className="text-[10px] bg-yellow-500 text-black px-1.5 rounded-full">{biz.subVentures.length}</span>}
                 </h3>
                 <div className="flex gap-2 mt-1 mb-4">
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded border border-yellow-500/20 uppercase">{biz.type}</span>
                    <span className="px-2 py-0.5 bg-white/10 text-gray-300 text-[10px] rounded border border-white/10 uppercase">{biz.status}</span>
                 </div>
                 <div className="flex justify-between items-end">
                    <div>
                       <div className="text-xs text-gray-500">Monthly Revenue</div>
                       <div className="text-2xl font-mono text-white">${biz.revenue.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-xs text-gray-500">Efficiency</div>
                       <div className="text-lg font-mono text-yellow-400">{biz.efficiency}%</div>
                    </div>
                 </div>
                 {biz.subVentures && biz.subVentures.length > 0 && (
                   <div className="mt-4 pt-3 border-t border-white/5">
                     <div className="text-[10px] text-gray-500 mb-1">Sub-Venues</div>
                     <div className="flex flex-wrap gap-1">
                       {biz.subVentures.slice(0, 3).map(s => (
                         <span key={s.id} className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-gray-400">{s.name}</span>
                       ))}
                       {biz.subVentures.length > 3 && <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-gray-400">+{biz.subVentures.length - 3}</span>}
                     </div>
                   </div>
                 )}
              </div>
           </motion.div>
         ))}
         <div 
            onClick={() => handleOpenBizModal()}
            className="glass-panel p-5 rounded-xl flex items-center justify-center border border-dashed border-white/10 hover:border-yellow-500/50 cursor-pointer transition-colors group min-h-[200px]"
         >
            <div className="text-center">
               <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-yellow-500/20 group-hover:text-yellow-400 transition-colors">
                  <Plus size={24} />
               </div>
               <div className="text-sm text-gray-400">Launch New Venture / Venue</div>
            </div>
         </div>
      </div>
    );
  };

  const renderFinanceStats = () => {
      if (category !== 'Finance') return null;
      const { monthlyIncome, savingsRate, emergencyFundMonths, portfolioValue } = state.deepStats.finance;
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatBox label="Monthly Flow" value={`$${monthlyIncome}`} sub="Cash In" color="text-violet-400" />
            <StatBox label="Net Worth" value={`$${portfolioValue.toLocaleString()}`} sub="Asset Value" color="text-violet-400" />
            <StatBox label="Safety Net" value={`${emergencyFundMonths} Mo`} sub="Runway" color="text-violet-400" />
            <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-violet-500/10" style={{ height: `${savingsRate}%`, top: 'auto', bottom: 0 }}></div>
               <div className="text-2xl font-bold text-white relative z-10">{savingsRate}%</div>
               <div className="text-[10px] text-gray-400 uppercase relative z-10">Savings Rate</div>
            </div>
        </div>
      );
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Dynamic Header */}
      <div className="relative h-48 rounded-2xl overflow-hidden glass-panel flex items-center justify-center border-b-4 group" style={{ borderColor: color }}>
        <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent z-10" />
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700 bg-center bg-cover" 
             style={{ 
               backgroundColor: color, 
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
             }} 
        />
        
        <div className="z-20 text-center transform group-hover:scale-105 transition-transform duration-500">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-center mb-2">
             {category === 'Fitness' && <Activity size={40} className="text-red-500" />}
             {category === 'Skills' && <Brain size={40} className="text-blue-500" />}
             {category === 'Business' && <TrendingUp size={40} className="text-yellow-500" />}
             {category === 'Family' && <Users size={40} className="text-green-500" />}
             {category === 'Finance' && <Wallet size={40} className="text-violet-500" />}
             {category === 'Wellness' && <Heart size={40} className="text-pink-500" />}
          </motion.div>
          <h1 className="text-5xl font-display font-black tracking-tighter uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{category}</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-sm font-mono px-3 py-1 bg-black/60 border border-white/10 rounded text-gray-300">MASTERY LVL {level}</span>
          </div>
        </div>
      </div>

      {/* Render Deep Stats */}
      {renderFitnessStats()}
      {renderSkillTree()}
      {renderBusinessStats()}
      {renderFinanceStats()}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center border-t border-white/5 pt-6">
        <h2 className="text-xl font-bold font-display">Active Protocols</h2>
        <div className="flex gap-3">
            <button 
                onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold transition-all border border-white/10 hover:border-white/30"
            >
                <Plus size={16} /> New Quest
            </button>

            <button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primaryLight rounded-lg text-sm font-bold shadow-lg transition-all disabled:opacity-50"
            >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                <span>AI Generate</span>
            </button>
        </div>
      </div>

      {/* Content: Show ALL tasks for this category, letting user see done ones */}
      <TaskList tasks={categoryTasks} hideCategoryFilter={true} onEditTask={handleEditTask} />

      <TaskModal isOpen={isModalOpen} onClose={handleCloseModal} taskToEdit={taskToEdit} />
      <BusinessModal isOpen={isBizModalOpen} onClose={() => setIsBizModalOpen(false)} ventureToEdit={ventureToEdit} />
      <SkillModal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} skillToEdit={skillToEdit} />
    </div>
  );
};

const StatBox = ({ label, value, sub, color }: { label: string, value: string | number, sub: string, color: string }) => (
    <div className="glass-panel p-4 rounded-xl flex flex-col justify-center items-center text-center">
        <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
        <div className="text-xs text-white font-bold uppercase mt-1">{label}</div>
        <div className="text-[10px] text-gray-500">{sub}</div>
    </div>
);