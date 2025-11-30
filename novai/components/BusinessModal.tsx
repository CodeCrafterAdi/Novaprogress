
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Briefcase, Plus, Trash2, Building, DollarSign, TrendingUp, MapPin } from 'lucide-react';
import { useApp } from '../App';
import { BusinessVenture, SubVenture } from '../types';

interface BusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  ventureToEdit?: BusinessVenture | null;
}

export const BusinessModal: React.FC<BusinessModalProps> = ({ isOpen, onClose, ventureToEdit }) => {
  const { updateBusiness } = useApp();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<BusinessVenture['type']>('Digital');
  const [status, setStatus] = useState<BusinessVenture['status']>('Idea');
  const [revenue, setRevenue] = useState(0);
  const [efficiency, setEfficiency] = useState(0);
  const [subVentures, setSubVentures] = useState<SubVenture[]>([]);
  const [newSubName, setNewSubName] = useState('');

  useEffect(() => {
    if (ventureToEdit) {
      setName(ventureToEdit.name);
      setType(ventureToEdit.type);
      setStatus(ventureToEdit.status);
      setRevenue(ventureToEdit.revenue);
      setEfficiency(ventureToEdit.efficiency);
      setSubVentures(ventureToEdit.subVentures || []);
    } else {
      setName('');
      setType('Digital');
      setStatus('Idea');
      setRevenue(0);
      setEfficiency(50);
      setSubVentures([]);
    }
    setNewSubName('');
  }, [ventureToEdit, isOpen]);

  const handleAddSub = () => {
    if (!newSubName.trim()) return;
    setSubVentures([...subVentures, { id: Date.now().toString(), name: newSubName, status: 'Planned' }]);
    setNewSubName('');
  };

  const removeSub = (id: string) => {
    setSubVentures(subVentures.filter(s => s.id !== id));
  };

  const toggleSubStatus = (id: string) => {
      setSubVentures(subVentures.map(s => {
          if (s.id !== id) return s;
          const next = s.status === 'Planned' ? 'Active' : s.status === 'Active' ? 'Done' : 'Planned';
          return { ...s, status: next };
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const venture: BusinessVenture = {
      id: ventureToEdit ? ventureToEdit.id : Date.now().toString(),
      name,
      type,
      status,
      revenue,
      efficiency,
      subVentures
    };
    updateBusiness(venture);
    onClose();
  };

  const handleDelete = () => {
      if (ventureToEdit) {
          updateBusiness(ventureToEdit, true);
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
        className="relative bg-voidLight border border-yellow-500/30 w-full max-w-lg rounded-2xl p-6 shadow-[0_0_50px_rgba(234,179,8,0.2)] max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-display font-bold mb-6 text-yellow-500 flex items-center gap-2">
            <Briefcase size={24} />
            {ventureToEdit ? 'Manage Venture' : 'Launch New Business'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Venture Name / Venue</label>
                <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="e.g. Neo Tokyo Branch"
                    required 
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Type</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none">
                        <option value="Digital">Digital</option>
                        <option value="Service">Service</option>
                        <option value="Trading">Trading</option>
                        <option value="Venue">Physical Venue</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none">
                        <option value="Idea">Idea Phase</option>
                        <option value="Setup">Setup</option>
                        <option value="Active">Active</option>
                        <option value="Scaling">Scaling</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1"><DollarSign size={12}/> Monthly Rev</label>
                    <input type="number" value={revenue} onChange={e => setRevenue(Number(e.target.value))} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1"><TrendingUp size={12}/> Efficiency %</label>
                    <input type="number" value={efficiency} onChange={e => setEfficiency(Number(e.target.value))} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none" max={100} />
                </div>
            </div>

            <div className="border-t border-white/5 pt-4">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                    <MapPin size={12} /> Sub-Venues / Branches
                </label>
                <div className="space-y-2 mb-3 max-h-[150px] overflow-y-auto custom-scrollbar">
                    {subVentures.map(sub => (
                        <div key={sub.id} className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/5">
                            <span 
                                onClick={() => toggleSubStatus(sub.id)}
                                className={`text-[10px] px-2 py-0.5 rounded cursor-pointer select-none ${sub.status === 'Active' ? 'bg-green-500 text-black' : sub.status === 'Done' ? 'bg-gray-600 text-gray-300' : 'bg-yellow-500/20 text-yellow-500'}`}
                            >
                                {sub.status}
                            </span>
                            <span className="flex-grow text-sm text-gray-200">{sub.name}</span>
                            <button type="button" onClick={() => removeSub(sub.id)} className="text-gray-500 hover:text-red-400 p-1"><Trash2 size={14}/></button>
                        </div>
                    ))}
                    {subVentures.length === 0 && <div className="text-center text-gray-600 text-xs py-2 italic">No sub-venues registered</div>}
                </div>
                <div className="flex gap-2">
                    <input value={newSubName} onChange={e => setNewSubName(e.target.value)} className="flex-grow bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-yellow-500 focus:outline-none" placeholder="Add sub-venue..." />
                    <button type="button" onClick={handleAddSub} className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-lg transition-colors"><Plus size={18}/></button>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                {ventureToEdit && (
                    <button type="button" onClick={handleDelete} className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-lg transition-colors">
                        <Trash2 size={20} />
                    </button>
                )}
                <button type="submit" className="flex-grow py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors shadow-lg shadow-yellow-500/20">
                    {ventureToEdit ? 'Save Changes' : 'Launch Venture'}
                </button>
            </div>
        </form>
      </motion.div>
    </div>
  );
};
