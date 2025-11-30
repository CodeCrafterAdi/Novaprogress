
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Plus, Trash2, Zap, Layers, CheckCircle2 } from 'lucide-react';
import { useApp } from '../App';
import { SkillNode, SkillTechnique, SkillDomain, Complexity, XP_THRESHOLDS } from '../types';

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillToEdit?: SkillNode | null;
}

export const SkillModal: React.FC<SkillModalProps> = ({ isOpen, onClose, skillToEdit }) => {
  const { updateSkill } = useApp();
  
  const [name, setName] = useState('');
  const [domain, setDomain] = useState<SkillDomain>('mind');
  const [level, setLevel] = useState(1);
  const [mastery, setMastery] = useState(0);
  const [rank, setRank] = useState<Complexity>('E');
  const [techniques, setTechniques] = useState<SkillTechnique[]>([]);
  const [newTechName, setNewTechName] = useState('');

  useEffect(() => {
    if (skillToEdit) {
      setName(skillToEdit.name);
      setDomain(skillToEdit.domain);
      setLevel(skillToEdit.level);
      setMastery(skillToEdit.mastery);
      setRank(skillToEdit.rank);
      setTechniques(skillToEdit.techniques || []);
    } else {
      setName('');
      setDomain('mind');
      setLevel(1);
      setMastery(0);
      setRank('E');
      setTechniques([]);
    }
    setNewTechName('');
  }, [skillToEdit, isOpen]);

  const handleAddTech = () => {
    if (!newTechName.trim()) return;
    setTechniques([...techniques, { id: Date.now().toString(), name: newTechName, acquired: false }]);
    setNewTechName('');
  };

  const removeTech = (id: string) => {
    setTechniques(techniques.filter(t => t.id !== id));
  };

  const toggleTech = (id: string) => {
    setTechniques(techniques.map(t => t.id === id ? { ...t, acquired: !t.acquired } : t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skill: SkillNode = {
      id: skillToEdit ? skillToEdit.id : Date.now().toString(),
      name,
      domain,
      level,
      mastery,
      rank,
      techniques
    };
    updateSkill(skill);
    onClose();
  };

  const handleDelete = () => {
      if (skillToEdit) {
          updateSkill(skillToEdit, true);
          onClose();
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-voidLight border border-blue-500/30 w-full max-w-lg rounded-2xl p-6 shadow-[0_0_50px_rgba(59,130,246,0.2)] max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-display font-bold mb-6 text-blue-500 flex items-center gap-2">
            <Brain size={24} />
            {skillToEdit ? 'Refine Skill' : 'Acquire New Skill'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Skill Name</label>
                <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Python Programming"
                    required 
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Domain</label>
                    <select value={domain} onChange={e => setDomain(e.target.value as SkillDomain)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none">
                        <option value="mind">Mind</option>
                        <option value="communication">Communication</option>
                        <option value="creative">Creative</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Rank</label>
                    <select value={rank} onChange={e => setRank(e.target.value as Complexity)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none">
                        {Object.keys(XP_THRESHOLDS).map(c => (
                            <option key={c} value={c}>{c}-Rank</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1"><Layers size={12}/> Level (1-100)</label>
                    <input type="number" value={level} onChange={e => setLevel(Number(e.target.value))} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none" min={1} max={100} />
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1"><Zap size={12}/> Mastery %</label>
                    <input type="number" value={mastery} onChange={e => setMastery(Number(e.target.value))} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none" min={0} max={100} />
                    <div className="w-full h-1 bg-white/10 mt-2 rounded overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${mastery}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/5 pt-4">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Techniques / Milestones
                </label>
                <div className="space-y-2 mb-3 max-h-[150px] overflow-y-auto custom-scrollbar">
                    {techniques.map(tech => (
                        <div key={tech.id} className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/5">
                            <button 
                                type="button"
                                onClick={() => toggleTech(tech.id)}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${tech.acquired ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}
                            >
                                {tech.acquired && <CheckCircle2 size={10} className="text-white"/>}
                            </button>
                            <span className={`flex-grow text-sm ${tech.acquired ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{tech.name}</span>
                            <button type="button" onClick={() => removeTech(tech.id)} className="text-gray-500 hover:text-red-400 p-1"><Trash2 size={14}/></button>
                        </div>
                    ))}
                    {techniques.length === 0 && <div className="text-center text-gray-600 text-xs py-2 italic">No techniques recorded</div>}
                </div>
                <div className="flex gap-2">
                    <input value={newTechName} onChange={e => setNewTechName(e.target.value)} className="flex-grow bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="Add technique..." />
                    <button type="button" onClick={handleAddTech} className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 rounded-lg transition-colors"><Plus size={18}/></button>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                {skillToEdit && (
                    <button type="button" onClick={handleDelete} className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-lg transition-colors">
                        <Trash2 size={20} />
                    </button>
                )}
                <button type="submit" className="flex-grow py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                    {skillToEdit ? 'Update Skill Matrix' : 'Acquire Skill'}
                </button>
            </div>
        </form>
      </motion.div>
    </div>
  );
};
