
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { Task, XP_THRESHOLDS } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Filter, ArrowUpDown, Calendar, Clock, Crown, Skull, Zap, Star, ChevronDown, ChevronUp, Edit2, ListChecks, Folder } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  hideCategoryFilter?: boolean;
  onEditTask?: (task: Task) => void;
}

const getComplexityDetails = (complexity: string) => {
  switch (complexity) {
    case 'E': return { 
      color: 'text-slate-400', 
      bg: 'bg-slate-500/5', 
      border: 'border-slate-500/20', 
      glow: '', 
      icon: null,
      texture: ''
    };
    case 'D': return { 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/5', 
      border: 'border-emerald-500/20', 
      glow: '', 
      icon: null,
      texture: ''
    };
    case 'C': return { 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/5', 
      border: 'border-cyan-500/20', 
      glow: '', 
      icon: null,
      texture: ''
    };
    case 'B': return { 
      color: 'text-blue-500', 
      bg: 'bg-gradient-to-r from-blue-500/5 to-transparent', 
      border: 'border-blue-500/30', 
      glow: 'shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]', 
      icon: <Star size={12} />,
      texture: 'opacity-20'
    };
    case 'A': return { 
      color: 'text-violet-500', 
      bg: 'bg-gradient-to-r from-violet-500/10 to-transparent', 
      border: 'border-violet-500/40', 
      glow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)]', 
      icon: <Zap size={12} />,
      texture: 'opacity-30'
    };
    case 'S': return { 
      color: 'text-orange-500', 
      bg: 'bg-gradient-to-br from-orange-500/10 via-orange-900/5 to-transparent', 
      border: 'border-orange-500/50', 
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.25)]', 
      icon: <Skull size={12} />,
      texture: 'opacity-40'
    };
    case 'SS': return { 
      color: 'text-red-600', 
      bg: 'bg-gradient-to-br from-red-600/10 via-red-900/5 to-transparent', 
      border: 'border-red-600/60', 
      glow: 'shadow-[0_0_25px_rgba(220,38,38,0.3)] animate-pulse', 
      icon: <Skull size={12} />,
      texture: 'opacity-50'
    };
    case 'SSS': return { 
      color: 'text-yellow-400', 
      bg: 'bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent', 
      border: 'border-yellow-400/70', 
      glow: 'shadow-[0_0_35px_rgba(250,204,21,0.4)]', 
      icon: <Crown size={14} className="animate-pulse" />,
      texture: 'opacity-60',
      isLegendary: true
    };
    default: return { 
      color: 'text-gray-400', 
      bg: 'bg-gray-500/5', 
      border: 'border-gray-500/20', 
      glow: '', 
      icon: null,
      texture: ''
    };
  }
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, hideCategoryFilter = false, onEditTask }) => {
  const { toggleTask, deleteTask, toggleSubtask, state } = useApp();
  
  // Controls State
  const [filterCat, setFilterCat] = useState('All');
  const [filterComplex, setFilterComplex] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'xp_desc' | 'xp_asc' | 'due_soon'>('newest');
  
  // Expanded card state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getProjectName = (id?: string) => {
    if (!id) return null;
    return state.projects.find(p => p.id === id)?.title || 'Unknown Ops';
  };

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Filter Category
    if (!hideCategoryFilter && filterCat !== 'All') {
      result = result.filter(t => t.category === filterCat);
    }

    // Filter Complexity
    if (filterComplex !== 'All') {
      result = result.filter(t => t.complexity === filterComplex);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'xp_desc':
          return b.xpReward - a.xpReward;
        case 'xp_asc':
          return a.xpReward - b.xpReward;
        case 'due_soon':
          // If no due date, put at end
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'oldest':
          return (a.createdAt || 0) - (b.createdAt || 0);
        case 'newest':
        default:
          return (b.createdAt || 0) - (a.createdAt || 0);
      }
    });

    return result;
  }, [tasks, filterCat, filterComplex, sortBy, hideCategoryFilter]);

  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-gray-600 font-mono text-sm border-2 border-dashed border-gray-800 rounded-xl">
        NO ACTIVE QUESTS DETECTED
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
        
        {/* Category Filter (if enabled) */}
        {!hideCategoryFilter && (
          <div className="relative">
            <Filter size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="pl-8 pr-4 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs text-gray-200 focus:outline-none focus:border-accent appearance-none cursor-pointer hover:bg-black/60 transition-colors"
            >
              <option value="All">All Categories</option>
              {['Fitness', 'Skills', 'Business', 'Family', 'Finance', 'Wellness'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Complexity Filter */}
        <div className="relative">
          <div className="absolute left-2.5 top-2.5 w-3 h-3 rounded-full border border-gray-500 flex items-center justify-center text-[8px] font-bold text-gray-400">R</div>
          <select
            value={filterComplex}
            onChange={(e) => setFilterComplex(e.target.value)}
            className="pl-8 pr-4 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs text-gray-200 focus:outline-none focus:border-accent appearance-none cursor-pointer hover:bg-black/60 transition-colors"
          >
            <option value="All">All Ranks</option>
            {Object.keys(XP_THRESHOLDS).map(c => (
              <option key={c} value={c}>{c}-Rank</option>
            ))}
          </select>
        </div>

        <div className="flex-grow" />

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="pl-8 pr-4 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs text-gray-200 focus:outline-none focus:border-accent appearance-none cursor-pointer hover:bg-black/60 transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="xp_desc">Highest XP</option>
            <option value="xp_asc">Lowest XP</option>
            <option value="due_soon">Due Soonest</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="grid gap-3">
        <AnimatePresence mode='popLayout'>
          {filteredTasks.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
               className="py-8 text-center text-gray-500 text-xs italic"
             >
               No quests match your filters.
             </motion.div>
          ) : (
            filteredTasks.map((task, index) => {
              const compStyles = getComplexityDetails(task.complexity);
              const isLegendary = (task.complexity === 'SSS');
              const isExpanded = expandedId === task.id;
              const projectName = getProjectName(task.projectId);
              
              const subtaskTotal = task.subtasks?.length || 0;
              const subtaskDone = task.subtasks?.filter(s => s.completed).length || 0;
              const progressPct = subtaskTotal === 0 ? 0 : (subtaskDone / subtaskTotal) * 100;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  layout
                  className={`relative overflow-hidden rounded-xl group border-l-[6px] transition-all duration-300 ${compStyles.bg} ${compStyles.border} ${compStyles.glow}`}
                  style={{ 
                    borderLeftColor: CATEGORY_COLORS[task.category] || '#fff',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                   {/* Main Card Content */}
                  <div className="p-4 flex items-center justify-between relative z-10">
                      {/* Shimmer Effect for Legendary Tasks */}
                      {isLegendary && (
                        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                          <div className="w-full h-full bg-gradient-to-r from-transparent via-yellow-200 to-transparent skew-x-12 animate-shimmer" />
                        </div>
                      )}

                      {/* Background Texture for Complexity */}
                      <div className={`absolute -top-4 -right-4 p-4 text-[6rem] font-black pointer-events-none font-display leading-none select-none ${compStyles.color} ${compStyles.texture}`} style={{ maskImage: 'linear-gradient(to bottom left, black, transparent)' }}>
                        {task.complexity}
                      </div>

                      <div className="flex items-center gap-4 z-10 flex-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                          className="text-gray-500 hover:text-accent transition-colors shrink-0"
                          title={task.isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                        >
                          {task.isCompleted ? <CheckCircle2 size={28} className="text-green-500" /> : <Circle size={28} />}
                        </button>
                        
                        <div className="min-w-0 cursor-pointer flex-grow" onClick={() => toggleExpand(task.id)}>
                          <div className="flex items-center gap-2">
                             <h3 className={`font-medium text-lg truncate ${task.isCompleted ? 'line-through text-gray-600' : 'text-gray-100'} ${isLegendary ? 'text-yellow-200 font-bold drop-shadow-md' : ''}`}>
                                {task.title}
                             </h3>
                             {subtaskTotal > 0 && (
                               <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded flex items-center gap-1 text-gray-400">
                                 <ListChecks size={10} />
                                 {subtaskDone}/{subtaskTotal}
                               </span>
                             )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs mt-1">
                            {projectName && (
                              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-1">
                                <Folder size={10} /> {projectName}
                              </span>
                            )}

                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">{task.category}</span>
                            <span className="px-2 py-0.5 rounded bg-primary/20 border border-primary/20 text-primaryLight font-mono">+{task.xpReward} XP</span>
                            
                            <span className={`px-2 py-0.5 rounded font-bold border flex items-center gap-1 ${compStyles.color} ${compStyles.bg} ${compStyles.border} bg-opacity-30`}>
                              {compStyles.icon}
                              <span>Rank {task.complexity}</span>
                            </span>

                            {task.dueDate && (
                              <span className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center gap-1">
                                <Calendar size={10} /> {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                         {onEditTask && !task.isCompleted && (
                           <button onClick={() => onEditTask(task)} className="text-gray-400 hover:text-white p-2 transition-colors rounded-full hover:bg-white/10">
                              <Edit2 size={16} />
                           </button>
                         )}
                        <button onClick={() => deleteTask(task.id)} className="text-gray-600 hover:text-red-500 p-2 transition-colors rounded-full hover:bg-white/10">
                          <Trash2 size={16} />
                        </button>
                        <button onClick={() => toggleExpand(task.id)} className="text-gray-500 hover:text-white p-2 transition-colors">
                           {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                  </div>
                  
                  {/* Visual Progress Bar */}
                  {subtaskTotal > 0 && !task.isCompleted && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out shadow-[0_0_10px_#F43F5E] relative" 
                        style={{ width: `${progressPct}%` }}
                      >
                         <div className="absolute right-0 top-0 h-full w-2 bg-white/50 blur-[2px]"></div>
                      </div>
                    </div>
                  )}

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/20 border-t border-white/5"
                      >
                         <div className="p-4 pl-14 text-sm space-y-3">
                           {task.description && (
                             <p className="text-gray-400 italic bg-white/5 p-3 rounded-lg border border-white/5">
                               "{task.description}"
                             </p>
                           )}
                           
                           {subtaskTotal > 0 && (
                             <div className="space-y-2 mt-2">
                               <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Objectives</h4>
                               {task.subtasks.map(st => (
                                 <div key={st.id} className="flex items-center gap-3 group/sub">
                                    <button 
                                      onClick={() => toggleSubtask(task.id, st.id)}
                                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${st.completed ? 'bg-primary border-primary shadow-[0_0_8px_rgba(91,33,182,0.5)]' : 'border-gray-600 hover:border-gray-400 bg-white/5 hover:bg-white/10'}`}
                                    >
                                      {st.completed && <CheckCircle2 size={14} className="text-white" />}
                                    </button>
                                    <span 
                                      onClick={() => toggleSubtask(task.id, st.id)}
                                      className={`cursor-pointer transition-colors duration-200 ${st.completed ? 'line-through text-gray-600' : 'text-gray-300 hover:text-white'}`}
                                    >
                                      {st.title}
                                    </span>
                                 </div>
                               ))}
                             </div>
                           )}

                           <div className="pt-2 flex justify-end">
                             <span className="text-[10px] text-gray-600 uppercase font-mono">
                               Created: {new Date(task.createdAt).toLocaleString()}
                             </span>
                           </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
