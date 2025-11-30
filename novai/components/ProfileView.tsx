
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { motion } from 'framer-motion';
import { Save, User, Activity, Edit3, Target, Medal, Zap, Shield, Ruler, Weight, Camera, Upload, Lock, Key, AlertCircle, Cpu } from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';
import { useLocation } from 'react-router-dom';

export const ProfileView: React.FC = () => {
  const { state, updateProfile, completeAllTasks } = useApp();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: state.user.name,
    title: state.user.title,
    age: state.user.age,
    height: state.user.height,
    weight: state.user.weight,
    gender: state.user.gender,
    bio: state.user.bio,
    avatarUrl: state.user.avatarUrl
  });
  
  const [newGoal, setNewGoal] = useState('');
  
  // Password Reset State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Command State
  const [command, setCommand] = useState('');
  const [commandOutput, setCommandOutput] = useState('');


  // Check if we came from a reset link
  useEffect(() => {
    if (location.search.includes('reset=true')) {
        setIsEditing(true);
    }
  }, [location]);

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleGoalAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    const updatedGoals = [...(state.user.goals || []), newGoal.trim()];
    updateProfile({ goals: updatedGoals });
    setNewGoal('');
  };

  const handleGoalRemove = (goal: string) => {
    const updatedGoals = (state.user.goals || []).filter(g => g !== goal);
    updateProfile({ goals: updatedGoals });
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordMsg('');
      setPasswordError('');
      if(!supabase || !newPassword) return;

      if (newPassword.length < 6) {
        setPasswordError("Password must be at least 6 characters.");
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match.");
        return;
      }
      
      try {
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if(error) throw error;
          setPasswordMsg("Password successfully updated.");
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(() => setPasswordMsg(''), 3000);
      } catch (err: any) {
          setPasswordError("Error: " + err.message);
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Resize image to max 300x300 to prevent localstorage bloat
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommandOutput('Executing...');
    let output = `Unknown command: "${command}"`;
  
    if (command.trim() === 'system.completeAllTasks()') {
      output = await completeAllTasks();
    }
    
    setCommandOutput(output);
    setCommand('');
    setTimeout(() => setCommandOutput(''), 6000); // Clear output after 6s
  };

  const levelProgress = (state.user.xp % 1000) / 10;

  return (
    <div className="space-y-8 pb-24 max-w-5xl mx-auto">
       {/* Background */}
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none z-0"></div>

       {/* Header */}
       <div className="flex justify-between items-end border-b border-white/5 pb-6 relative z-10">
         <div>
            <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} className="text-purple-400 text-xs font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
                <Shield size={14}/> Hunter Database
            </motion.div>
            <motion.h1 initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="text-5xl font-display font-black text-white">
                IDENTITY CARD
            </motion.h1>
         </div>
         <motion.button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${isEditing ? 'bg-green-500 hover:bg-green-400 text-black' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
         >
            {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
            {isEditing ? 'UPDATE RECORD' : 'EDIT IDENTITY'}
         </motion.button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          
          {/* Main ID Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-1 space-y-6"
          >
             <div className="glass-panel p-1 rounded-3xl overflow-hidden relative group">
                {/* Holographic Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 via-transparent to-blue-500 opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                
                <div className="bg-voidLight rounded-[20px] p-6 relative z-10 h-full flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="w-40 h-40 rounded-full border-4 border-white/10 p-1 mb-6 relative group/avatar">
                        <div className="absolute inset-0 rounded-full border border-purple-500/50 animate-pulse-slow"></div>
                        <img 
                            src={isEditing ? (formData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${state.user.name}`) : (state.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${state.user.name}`)} 
                            alt="Hunter Avatar" 
                            className="w-full h-full rounded-full object-cover bg-black/20"
                        />
                        {isEditing && (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                            >
                                <Camera className="text-white" size={24} />
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/80 text-xs font-bold px-2 py-0.5 rounded border border-purple-500 text-purple-400">
                           LVL {state.user.level}
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="w-full space-y-3 mb-6">
                            <input 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-center text-lg font-bold text-white focus:border-purple-500 focus:outline-none"
                                placeholder="Hunter Name"
                            />
                            {/* Title is auto-calculated now, but keeping editable for overrides if needed, or disable it */}
                            <div className="text-xs text-gray-500 mb-1">Rank Title (Auto-assigned)</div>
                            <div className="w-full bg-black/20 border border-white/5 rounded-lg p-2 text-center text-sm text-purple-400">
                                {state.user.title}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <h2 className="text-3xl font-display font-black text-white mb-1">{state.user.name}</h2>
                            <p className="text-purple-400 font-mono text-sm tracking-wider uppercase">{state.user.title}</p>
                        </div>
                    )}

                    {/* Rank Badge */}
                    <div className="w-full bg-white/5 rounded-xl p-4 border border-white/5 mb-6">
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Hunter Rank</div>
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-600 drop-shadow-md">
                            {state.user.rank.split('-')[0]}
                        </div>
                        <div className="text-xs text-yellow-500/60 mt-1">{state.user.rank}</div>
                    </div>

                    {/* XP Bar */}
                    <div className="w-full mt-auto">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>EXP Progress</span>
                            <span>{state.user.xp % 1000} / 1000</span>
                        </div>
                        <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${levelProgress}%` }}
                                className="h-full bg-gradient-to-r from-purple-600 to-blue-500"
                            />
                        </div>
                        <div className="text-[10px] text-gray-600 mt-2">Total XP: {state.user.xp}</div>
                    </div>
                </div>
             </div>

             {/* Security Panel */}
             {isEditing && (
                 <motion.div 
                    initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}
                    className="glass-panel p-6 rounded-2xl"
                 >
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Lock size={16} /> Security Settings
                     </h3>
                     <form onSubmit={handlePasswordUpdate} className="space-y-4">
                         <div className="space-y-1">
                             <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">New Password</label>
                             <input 
                                 type="password"
                                 value={newPassword}
                                 onChange={e => setNewPassword(e.target.value)}
                                 placeholder="Set new secure pass (min. 6 chars)"
                                 className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                             />
                         </div>
                         <div className="space-y-1">
                             <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Confirm New Password</label>
                             <input 
                                 type="password"
                                 value={confirmPassword}
                                 onChange={e => setConfirmPassword(e.target.value)}
                                 placeholder="Confirm new pass"
                                 className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                             />
                         </div>
                         <button type="submit" className="w-full flex items-center justify-center gap-2 p-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition-colors text-xs font-bold" disabled={!newPassword}>
                             <Key size={14} /> UPDATE PASSWORD
                         </button>

                         {passwordError && <div className="text-xs text-red-400 flex items-center gap-2"><AlertCircle size={14}/>{passwordError}</div>}
                         {passwordMsg && <div className="text-xs text-green-400">{passwordMsg}</div>}
                     </form>
                 </motion.div>
             )}
          </motion.div>

          {/* Details & Goals */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Physical Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-panel p-6 rounded-2xl"
              >
                 <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Activity size={16} className="text-green-400" /> Physiological Parameters
                 </h3>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatField 
                        label="Height" 
                        value={isEditing ? formData.height : state.user.height} 
                        unit="cm" 
                        icon={Ruler}
                        isEditing={isEditing}
                        onChange={(val) => setFormData({...formData, height: Number(val)})}
                    />
                    <StatField 
                        label="Weight" 
                        value={isEditing ? formData.weight : state.user.weight} 
                        unit="kg" 
                        icon={Weight}
                        isEditing={isEditing}
                        onChange={(val) => setFormData({...formData, weight: Number(val)})}
                    />
                    <StatField 
                        label="Age" 
                        value={isEditing ? formData.age : state.user.age} 
                        unit="yrs" 
                        icon={User}
                        isEditing={isEditing}
                        onChange={(val) => setFormData({...formData, age: Number(val)})}
                    />
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
                            <Zap size={12} /> Gender
                        </div>
                        {isEditing ? (
                             <select 
                                value={formData.gender} 
                                onChange={e => setFormData({...formData, gender: e.target.value})}
                                className="w-full bg-black/30 text-white text-lg font-bold p-1 rounded focus:outline-none"
                             >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                             </select>
                        ) : (
                            <div className="text-2xl font-mono text-white">{state.user.gender}</div>
                        )}
                    </div>
                 </div>
              </motion.div>

              {/* Bio & Goals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bio */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass-panel p-6 rounded-2xl flex flex-col"
                  >
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <User size={16} /> Hunter Profile
                      </h3>
                      {isEditing ? (
                          <textarea 
                             value={formData.bio}
                             onChange={e => setFormData({...formData, bio: e.target.value})}
                             className="w-full h-full bg-black/30 border border-white/10 rounded-xl p-4 text-gray-300 focus:border-purple-500 focus:outline-none resize-none min-h-[150px]"
                             placeholder="Enter your hunter background..."
                          />
                      ) : (
                          <p className="text-gray-300 leading-relaxed italic border-l-2 border-purple-500 pl-4 py-2 bg-purple-500/5 rounded-r-lg">
                              "{state.user.bio || "No bio record found."}"
                          </p>
                      )}
                  </motion.div>

                  {/* Goals */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass-panel p-6 rounded-2xl flex flex-col"
                  >
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <Target size={16} className="text-red-400" /> Active Directives
                      </h3>
                      
                      <div className="flex-grow space-y-2 mb-4 overflow-y-auto max-h-[150px] custom-scrollbar pr-1">
                          {(state.user.goals && state.user.goals.length > 0) ? state.user.goals.map((goal, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm bg-white/5 p-2 rounded border border-white/5">
                                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                  <span className="flex-grow text-gray-300">{goal}</span>
                                  {isEditing && (
                                      <button onClick={() => handleGoalRemove(goal)} className="text-gray-600 hover:text-red-400"><XIcon size={14}/></button>
                                  )}
                              </div>
                          )) : (
                              <div className="text-gray-600 text-xs italic text-center py-4">No active directives set.</div>
                          )}
                      </div>

                      <form onSubmit={handleGoalAdd} className="mt-auto">
                          <div className="flex gap-2">
                              <input 
                                value={newGoal}
                                onChange={e => setNewGoal(e.target.value)}
                                className="flex-grow bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-red-500 focus:outline-none"
                                placeholder="Add new directive..."
                              />
                              <button type="submit" className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg"><PlusIcon size={16}/></button>
                          </div>
                      </form>
                  </motion.div>
              </div>

              {/* Command Interface */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass-panel p-6 rounded-2xl"
              >
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Cpu size={16} className="text-accent"/> System Command Interface
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">Execute administrative commands. Use with caution.</p>

                  <form onSubmit={handleCommand} className="flex gap-2">
                    <span className="text-accent font-mono pt-2 pl-1">&gt;</span>
                    <input 
                        value={command}
                        onChange={e => setCommand(e.target.value)}
                        placeholder="system.completeAllTasks()"
                        className="flex-grow bg-transparent font-mono text-accent focus:outline-none placeholder:text-accent/30"
                    />
                    <button type="submit" className="px-4 py-1.5 bg-accent/20 hover:bg-accent/30 text-accent rounded text-xs font-bold border border-accent/20 transition-colors">
                        EXEC
                    </button>
                  </form>
                  
                  {commandOutput && (
                      <div className="mt-4 p-3 bg-black/40 rounded-lg font-mono text-xs text-green-400 border border-white/5 whitespace-pre-wrap">
                          {commandOutput}
                      </div>
                  )}
              </motion.div>

              {/* Achievement Ribbons Mockup */}
              <div className="glass-panel p-4 rounded-xl flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                      <Medal size={20} className="text-yellow-500" />
                      <span>Sunday Bosses Defeated: 0</span>
                  </div>
                  <div className="flex items-center gap-4">
                      <Zap size={20} className="text-blue-500" />
                      <span>Max Streak: {state.user.streak} Days</span>
                  </div>
                  <div className="flex items-center gap-4">
                      <Shield size={20} className="text-purple-500" />
                      <span>System Version: v2.5.0</span>
                  </div>
              </div>
          </div>
       </div>
    </div>
  );
};

// Sub-components
const StatField = ({ label, value, unit, icon: Icon, isEditing, onChange }: any) => (
    <div className="bg-white/5 rounded-xl p-4 border border-white/5 relative group hover:border-white/10 transition-colors">
        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-1">
            <Icon size={12} /> {label}
        </div>
        <div className="flex items-baseline gap-1">
            {isEditing ? (
                <input 
                    type="number"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-black/30 text-white text-2xl font-mono font-bold p-1 rounded focus:outline-none focus:bg-black/50"
                />
            ) : (
                <span className="text-2xl font-mono font-bold text-white">{value}</span>
            )}
            <span className="text-xs text-gray-600 font-bold">{unit}</span>
        </div>
    </div>
);

const XIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const PlusIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
