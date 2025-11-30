
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderKanban, Plus, Clock, Target, Hash, ChevronRight, Edit2, CheckCircle, Activity, Brain, Briefcase, Users, Wallet, Heart, Trophy, Zap, AlertCircle, Layers, Flag, Lock, Unlock } from 'lucide-react';
import { Project, Task, Category, Milestone } from '../types';
import { ProjectModal } from './ProjectModal';
import { TaskModal } from './TaskModal';
import { TaskList } from './TaskList';

export const ProjectView: React.FC = () => {
  const { state } = useApp();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [activeProjectIdForTask, setActiveProjectIdForTask] = useState<string>('');

  const projects = state.projects || [];

  // Derived Stats
  const activeCount = projects.filter(p => p.status === 'Active').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const totalXpPotential = projects.reduce((acc, p) => acc + (p.status !== 'Completed' ? p.xpBonus : 0), 0);
  
  const completionRate = projects.length > 0 ? Math.round((completedCount / projects.length) * 100) : 0;

  const handleCreateProject = () => {
      setProjectToEdit(null);
      setIsProjectModalOpen(true);
  };

  const handleEditProject = (e: React.MouseEvent, p: Project) => {
      e.stopPropagation();
      setProjectToEdit(p);
      setIsProjectModalOpen(true);
  };

  const handleAddTaskToProject = (e: React.MouseEvent, projectId: string) => {
      e.stopPropagation();
      setActiveProjectIdForTask(projectId);
      setTaskToEdit(null);
      setIsTaskModalOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const toggleExpand = (projectId: string) => {
      setExpandedProjectId(prev => prev === projectId ? null : projectId);
  };

  return (
    <div className="space-y-8 pb-24 relative min-h-[80vh]">
       {/* Background Grid Accent */}
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none z-0"></div>
       
       {/* Header Section */}
       <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
         <div>
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-purple-400 mb-2"
            >
                <FolderKanban size={20} />
                <span className="text-xs font-mono tracking-widest uppercase">Strategic Operations</span>
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-white to-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
                MISSION CONTROL
            </motion.h1>
         </div>
         <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(168,85,247,0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateProject}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg border border-purple-400/20 transition-all group"
         >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" /> 
            <span>INITIALIZE OP</span>
         </motion.button>
       </div>

       {/* Stats Rail */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <StatRailItem label="Active Ops" value={activeCount} icon={Target} color="text-green-400" />
           <StatRailItem label="Completion Rate" value={`${completionRate}%`} icon={Activity} color="text-blue-400" />
           <StatRailItem label="XP Potential" value={totalXpPotential.toLocaleString()} icon={Trophy} color="text-yellow-400" />
           <StatRailItem label="Total Projects" value={projects.length} icon={FolderKanban} color="text-purple-400" />
       </div>

       {/* Project Grid */}
       <div className="grid grid-cols-1 gap-6 relative z-10">
           {projects.length === 0 && (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/5"
               >
                   <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FolderKanban size={40} className="text-purple-400" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">No Active Operations</h3>
                   <p className="text-gray-500 max-w-md mx-auto">Initialize a new project to bundle cross-category tasks into a single major objective.</p>
               </motion.div>
           )}

           <AnimatePresence mode='popLayout'>
               {projects.map((project, idx) => (
                   <ProjectCard 
                        key={project.id}
                        project={project}
                        tasks={state.tasks.filter(t => t.projectId === project.id)}
                        isExpanded={expandedProjectId === project.id}
                        onToggle={() => toggleExpand(project.id)}
                        onEdit={(e) => handleEditProject(e, project)}
                        onAddTask={(e) => handleAddTaskToProject(e, project.id)}
                        onEditTask={handleEditTask}
                        index={idx}
                   />
               ))}
           </AnimatePresence>
       </div>

       <ProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        projectToEdit={projectToEdit} 
       />

       <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        taskToEdit={taskToEdit}
        preSelectedProjectId={activeProjectIdForTask}
       />
    </div>
  );
};

// --- Sub Components ---

const StatRailItem = ({ label, value, icon: Icon, color }: any) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-4 rounded-xl flex items-center gap-4 relative overflow-hidden group"
    >
        <div className={`p-3 rounded-lg bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
        </div>
        <div>
            <div className="text-2xl font-bold font-mono text-white">{value}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
        </div>
        <div className={`absolute bottom-0 right-0 w-16 h-16 ${color.replace('text', 'bg')}/10 blur-2xl rounded-full`}></div>
    </motion.div>
);

interface ProjectCardProps {
    project: Project;
    tasks: Task[];
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: (e: React.MouseEvent) => void;
    onAddTask: (e: React.MouseEvent) => void;
    onEditTask: (task: Task) => void;
    index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, tasks, isExpanded, onToggle, onEdit, onAddTask, onEditTask, index }) => {
    const { completeMilestone } = useApp();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Status Logic
    const isCompleted = project.status === 'Completed';
    const isActive = project.status === 'Active';
    const isOverdue = project.deadline && new Date(project.deadline) < new Date() && !isCompleted;

    const statusColor = isCompleted ? 'text-green-400 bg-green-500/20 border-green-500/30' : 
                        isOverdue ? 'text-red-400 bg-red-500/20 border-red-500/30' :
                        isActive ? 'text-purple-400 bg-purple-500/20 border-purple-500/30' : 
                        'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    
    const handleMilestoneClick = (e: React.MouseEvent, ms: Milestone) => {
        e.stopPropagation();
        if(!ms.isCompleted) {
            completeMilestone(project.id, ms.id);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className={`glass-panel rounded-2xl overflow-hidden border transition-all duration-500 ${isExpanded ? 'border-purple-500/40 bg-voidLight shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'border-white/5 hover:border-purple-500/20'}`}
        >
            {/* Main Click Area */}
            <div onClick={onToggle} className="relative cursor-pointer group">
                {/* Progress Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Active Indicator Line */}
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500"></div>}

                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
                    
                    {/* Icon & Status */}
                    <div className="flex-shrink-0 relative">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${statusColor} shadow-lg`}>
                            {isCompleted ? <CheckCircle size={28} /> : isActive ? <Target size={28} /> : <AlertCircle size={28} />}
                        </div>
                        {isActive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-void animate-pulse"></div>}
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h2 className={`text-2xl font-bold font-display tracking-tight ${isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>{project.title}</h2>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
                                {project.status}
                            </div>
                            {isOverdue && <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white animate-pulse">OVERDUE</div>}
                        </div>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500">
                             {project.deadline && (
                                 <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-400 font-bold' : ''}`}>
                                     <Clock size={14} /> 
                                     <span>{new Date(project.deadline).toLocaleDateString()}</span>
                                 </div>
                             )}
                             <div className="flex items-center gap-2">
                                 {project.tags.map(tag => (
                                     <span key={tag} className="flex items-center gap-1 text-purple-300 bg-purple-500/5 px-1.5 py-0.5 rounded border border-purple-500/10">
                                         <Hash size={10} /> {tag}
                                     </span>
                                 ))}
                             </div>
                        </div>
                    </div>

                    {/* XP & Stats Right Side */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-2 md:w-48">
                         <div className="flex items-center gap-2 text-yellow-400 font-bold font-mono bg-yellow-400/10 px-3 py-1 rounded-lg border border-yellow-400/20">
                             <Zap size={16} /> <span>+{project.xpBonus.toLocaleString()} XP</span>
                         </div>
                         <div className="w-full">
                             <div className="flex justify-between text-xs text-gray-400 mb-1">
                                 <span>Progress</span>
                                 <span>{Math.round(progress)}%</span>
                             </div>
                             <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                 <motion.div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1 }}
                                 />
                             </div>
                         </div>
                    </div>

                    {/* Controls */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={onAddTask} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors" title="Add Protocol">
                             <Plus size={16} />
                         </button>
                         <button onClick={onEdit} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 hover:text-white transition-colors" title="Edit Operation">
                             <Edit2 size={16} />
                         </button>
                    </div>
                </div>
            </div>

            {/* Expandable Task List */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'circOut' }}
                        className="border-t border-white/5 bg-black/20"
                    >
                        {/* Milestones Section */}
                        {(project.milestones && project.milestones.length > 0) && (
                            <div className="p-4 md:px-8 pt-6 border-b border-white/5">
                                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Flag size={14} /> Key Milestones
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {project.milestones.map(ms => (
                                        <div 
                                            key={ms.id} 
                                            onClick={(e) => handleMilestoneClick(e, ms)}
                                            className={`relative p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${ms.isCompleted ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${ms.isCompleted ? 'bg-yellow-500 text-black border-yellow-500' : 'border-gray-600 bg-black/40'}`}>
                                                    {ms.isCompleted ? <Unlock size={14} /> : <Lock size={14} className="text-gray-500"/>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-bold ${ms.isCompleted ? 'text-yellow-100' : 'text-gray-300'}`}>{ms.title}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase">{ms.isCompleted ? 'Achieved' : 'Locked'}</span>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-mono px-2 py-1 rounded ${ms.isCompleted ? 'bg-yellow-500/20 text-yellow-300' : 'bg-black/30 text-gray-500'}`}>+{ms.xpReward} XP</span>
                                            
                                            {ms.isCompleted && <div className="absolute inset-0 border border-yellow-500/50 rounded-lg animate-pulse-slow pointer-events-none"></div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="p-4 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                    <Layers size={14} /> Operation Protocols
                                </h3>
                                <button 
                                    onClick={onAddTask}
                                    className="text-xs flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors border border-purple-500/20"
                                >
                                    <Plus size={12} /> Add Task
                                </button>
                            </div>
                            
                            <TaskList tasks={tasks} hideCategoryFilter={false} onEditTask={onEditTask} />
                            
                            {tasks.length === 0 && (
                                <div className="text-center py-8 text-gray-600 italic text-sm border border-dashed border-white/10 rounded-xl bg-white/5">
                                    No protocols assigned to this operation. <br/>
                                    Initialize tasks to begin execution.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
