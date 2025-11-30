
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Plus, Trash2, List, AlignLeft, Check, Folder, Wand2, Loader2 } from 'lucide-react';
import { useApp } from '../App';
import { Category, Complexity, Task, XP_THRESHOLDS } from '../types';
import { generateSubtasks } from '../services/geminiService';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  preSelectedProjectId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit, preSelectedProjectId }) => {
  const { addTask, editTask, state, setGeminiError } = useApp();
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Fitness');
  const [projectId, setProjectId] = useState<string>('');
  const [complexity, setComplexity] = useState<Complexity>('D');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  
  // Subtasks State
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  // Initialize form when opening/changing taskToEdit
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setCategory(taskToEdit.category);
      setProjectId(taskToEdit.projectId || '');
      setComplexity(taskToEdit.complexity);
      setDueDate(taskToEdit.dueDate || '');
      setDescription(taskToEdit.description || '');
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      // Reset defaults for new task
      setTitle('');
      setCategory('Fitness');
      setProjectId(preSelectedProjectId || '');
      setComplexity('D');
      setDueDate('');
      setDescription('');
      setSubtasks([]);
      setNewSubtask('');
    }
  }, [taskToEdit, isOpen, preSelectedProjectId]);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: Date.now().toString(), title: newSubtask, completed: false }]);
    setNewSubtask('');
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleAiBreakdown = async () => {
      if (!title) return;
      setIsGeneratingSubtasks(true);
      try {
        const generated = await generateSubtasks(title, category);
        if (generated && generated.length > 0) {
            const newItems = generated.map(g => ({
                id: Date.now().toString() + Math.random(),
                title: g.title,
                completed: false
            }));
            setSubtasks([...subtasks, ...newItems]);
        }
      } catch (err: any) {
        if (err.message === 'GEMINI_INVALID_KEY') {
            setGeminiError('GEMINI_INVALID_KEY');
        }
      } finally {
        setIsGeneratingSubtasks(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: Task = {
      id: taskToEdit ? taskToEdit.id : Date.now().toString(),
      title,
      category,
      projectId: projectId || undefined,
      complexity,
      xpReward: XP_THRESHOLDS[complexity],
      isCompleted: taskToEdit ? taskToEdit.isCompleted : false,
      subtasks,
      description,
      createdAt: taskToEdit ? taskToEdit.createdAt : Date.now(),
      dueDate: dueDate || undefined
    };

    if (taskToEdit) {
      editTask(taskData);
    } else {
      addTask(taskData);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  // Filter and sort projects for dropdown
  const availableProjects = (state.projects || [])
    .sort((a, b) => {
        if (a.status === 'Active' && b.status !== 'Active') return -1;
        if (a.status !== 'Active' && b.status === 'Active') return 1;
        return a.title.localeCompare(b.title);
    });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-voidLight border border-glassBorder w-full max-w-lg rounded-2xl p-6 shadow-[0_0_50px_rgba(91,33,182,0.3)] max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-display font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          {taskToEdit ? 'Edit Protocol' : 'Forge New Quest'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Quest Title</label>
            <input 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 focus:border-accent focus:outline-none transition-colors text-white font-medium"
              placeholder="e.g. Master React Hooks"
              autoFocus={!taskToEdit}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 focus:border-accent focus:outline-none text-white"
              >
                {['Fitness', 'Skills', 'Business', 'Family', 'Finance', 'Wellness'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Complexity</label>
              <select 
                value={complexity}
                onChange={e => setComplexity(e.target.value as Complexity)}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 focus:border-accent focus:outline-none text-white"
              >
                {Object.keys(XP_THRESHOLDS).map(c => (
                  <option key={c} value={c}>{c} Rank (+{XP_THRESHOLDS[c as Complexity]} XP)</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                <Folder size={12}/> Link to Project (Optional)
            </label>
            <select 
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 focus:border-accent focus:outline-none text-white"
            >
                <option value="">-- Independent Quest --</option>
                {availableProjects.map(p => (
                    <option key={p.id} value={p.id}>
                        {p.title} {p.status !== 'Active' ? `(${p.status})` : ''}
                    </option>
                ))}
            </select>
          </div>

          <div>
             <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Due Date (Optional)</label>
             <div className="relative">
               <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
               <input 
                 type="date"
                 value={dueDate}
                 onChange={e => setDueDate(e.target.value)}
                 className="w-full bg-black/30 border border-white/10 rounded-lg p-3 pl-10 focus:border-accent focus:outline-none text-white [color-scheme:dark]"
               />
             </div>
          </div>

          <div>
             <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
               <AlignLeft size={12}/> Description
             </label>
             <textarea 
               value={description}
               onChange={e => setDescription(e.target.value)}
               className="w-full bg-black/30 border border-white/10 rounded-lg p-3 focus:border-accent focus:outline-none text-white min-h-[80px]"
               placeholder="Additional details..."
             />
          </div>

          <div>
             <div className="flex justify-between items-center mb-1">
                <label className="block text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1">
                  <List size={12}/> Subtasks ({subtasks.length})
                </label>
                
                {title.length > 3 && (
                    <button 
                        type="button" 
                        onClick={handleAiBreakdown}
                        disabled={isGeneratingSubtasks}
                        className="text-[10px] flex items-center gap-1 px-2 py-0.5 bg-primary/20 hover:bg-primary/30 text-primaryLight rounded border border-primary/20 transition-colors disabled:opacity-50"
                    >
                        {isGeneratingSubtasks ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                        Tactical Breakdown
                    </button>
                )}
             </div>

             <div className="space-y-2 mb-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                {subtasks.map(st => (
                  <div key={st.id} className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/5 group hover:border-white/10 transition-colors">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${st.completed ? 'bg-primary border-primary' : 'border-gray-600'}`}>
                       {st.completed && <Check size={10} className="text-white"/>}
                    </div>
                    <span className={`flex-grow text-sm truncate ${st.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{st.title}</span>
                    <button type="button" onClick={() => removeSubtask(st.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
             </div>
             <div className="flex gap-2">
               <input 
                 value={newSubtask}
                 onChange={e => setNewSubtask(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                 className="flex-grow bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-accent focus:outline-none"
                 placeholder="Add step..."
               />
               <button 
                 type="button" 
                 onClick={handleAddSubtask}
                 className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
               >
                 <Plus size={18} />
               </button>
             </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-primary hover:bg-primaryLight text-white font-bold rounded-lg mt-6 transition-colors shadow-lg border border-white/10"
          >
            {taskToEdit ? 'Save Changes' : 'Materialize Quest'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};