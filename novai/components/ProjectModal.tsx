
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FolderKanban, Trash2, Calendar, Hash, Target, Plus, AlignLeft, Layers, Flag } from 'lucide-react';
import { useApp } from '../App';
import { Project, Milestone } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, projectToEdit }) => {
  const { updateProject } = useApp();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('Active');
  const [deadline, setDeadline] = useState('');
  const [xpBonus, setXpBonus] = useState(1000);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // Milestones State
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneXP, setNewMilestoneXP] = useState(100);

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description);
      setStatus(projectToEdit.status);
      setDeadline(projectToEdit.deadline || '');
      setXpBonus(projectToEdit.xpBonus);
      setTags(projectToEdit.tags || []);
      setMilestones(projectToEdit.milestones || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus('Active');
      setDeadline('');
      setXpBonus(1000);
      setTags([]);
      setMilestones([]);
    }
    setNewTag('');
    setNewMilestoneTitle('');
    setNewMilestoneXP(100);
  }, [projectToEdit, isOpen]);

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    const newMS: Milestone = {
        id: Date.now().toString() + Math.random(),
        title: newMilestoneTitle,
        isCompleted: false,
        xpReward: newMilestoneXP
    };
    setMilestones([...milestones, newMS]);
    setNewMilestoneTitle('');
    setNewMilestoneXP(100);
  };

  const removeMilestone = (id: string) => {
      setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project: Project = {
      id: projectToEdit ? projectToEdit.id : Date.now().toString(),
      title,
      description,
      status,
      deadline: deadline || undefined,
      xpBonus,
      tags,
      milestones,
      createdAt: projectToEdit ? projectToEdit.createdAt : Date.now()
    };
    updateProject(project);
    onClose();
  };

  const handleDelete = () => {
      if (projectToEdit) {
          updateProject(projectToEdit, true);
          onClose();
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-voidLight border border-purple-500/30 w-full max-w-lg rounded-2xl p-8 shadow-[0_0_60px_rgba(168,85,247,0.25)] max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-display font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white flex items-center gap-3">
            <FolderKanban size={32} className="text-purple-500" />
            {projectToEdit ? 'MANAGE OP' : 'NEW OPERATION'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">Operation Title</label>
                <div className="relative group">
                    <input 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-lg text-white focus:border-purple-500 focus:outline-none transition-all group-hover:border-white/20"
                        placeholder="e.g. Operation: Financial Freedom"
                        required 
                        autoFocus
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1 flex items-center gap-1"><AlignLeft size={10}/> Directives</label>
                <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 focus:outline-none h-28 resize-none transition-all hover:border-white/20"
                    placeholder="Define mission objectives and scope..."
                />
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">Status</label>
                    <div className="relative">
                        <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none appearance-none cursor-pointer">
                            <option value="Active">Active</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-gray-500">▼</div>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1 flex items-center gap-1"><Target size={10}/> XP Bounty</label>
                    <input type="number" value={xpBonus} onChange={e => setXpBonus(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none font-mono text-purple-300" />
                </div>
            </div>

            {/* Milestones Section */}
            <div className="border-t border-white/5 pt-4 space-y-2">
                 <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1 flex items-center gap-1">
                    <Flag size={10} /> Key Milestones
                </label>
                <div className="space-y-2 mb-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                    {milestones.map(ms => (
                        <div key={ms.id} className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/5">
                            <span className="text-yellow-400 font-mono text-xs font-bold">+{ms.xpReward} XP</span>
                            <span className="flex-grow text-sm text-gray-300 truncate">{ms.title}</span>
                            <button type="button" onClick={() => removeMilestone(ms.id)} className="text-gray-500 hover:text-red-400 p-1"><Trash2 size={14}/></button>
                        </div>
                    ))}
                    {milestones.length === 0 && <span className="text-gray-600 text-xs italic py-1 block text-center">No milestones defined</span>}
                </div>
                <div className="flex gap-2">
                    <input 
                        value={newMilestoneTitle} 
                        onChange={e => setNewMilestoneTitle(e.target.value)} 
                        className="flex-grow bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:border-purple-500 focus:outline-none" 
                        placeholder="Checkpoint title..." 
                    />
                     <input 
                        type="number"
                        value={newMilestoneXP} 
                        onChange={e => setNewMilestoneXP(Number(e.target.value))} 
                        className="w-20 bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-yellow-400 focus:border-purple-500 focus:outline-none" 
                        placeholder="XP" 
                    />
                    <button type="button" onClick={handleAddMilestone} className="p-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-colors border border-purple-500/20"><Plus size={20}/></button>
                </div>
            </div>


            <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">Deadline</label>
                 <div className="relative group">
                   <Calendar className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                   <input 
                     type="date"
                     value={deadline}
                     onChange={e => setDeadline(e.target.value)}
                     className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-12 focus:border-purple-500 focus:outline-none text-white [color-scheme:dark] transition-all"
                   />
                 </div>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1 flex items-center gap-1">
                    <Hash size={10} /> Tags / Categories
                </label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[30px]">
                    {tags.map(tag => (
                        <div key={tag} className="flex items-center gap-1 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20 text-xs text-purple-300 animate-in fade-in zoom-in duration-200">
                            <span>{tag}</span>
                            <button type="button" onClick={() => removeTag(tag)} className="text-purple-400/50 hover:text-red-400 transition-colors"><X size={12}/></button>
                        </div>
                    ))}
                    {tags.length === 0 && <span className="text-gray-600 text-xs italic py-1">No tags assigned</span>}
                </div>
                <div className="flex gap-2">
                    <input 
                        value={newTag} 
                        onChange={e => setNewTag(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="flex-grow bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:border-purple-500 focus:outline-none" 
                        placeholder="Add new tag..." 
                    />
                    <button type="button" onClick={handleAddTag} className="p-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-colors border border-purple-500/20"><Plus size={20}/></button>
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
                {projectToEdit && (
                    <button type="button" onClick={handleDelete} className="px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition-colors border border-red-500/10">
                        <Trash2 size={20} />
                    </button>
                )}
                <button type="submit" className="flex-grow py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transform active:scale-[0.98]">
                    {projectToEdit ? 'UPDATE OPERATION' : 'INITIALIZE OPERATION'}
                </button>
            </div>
        </form>
      </motion.div>
    </div>
  );
};
