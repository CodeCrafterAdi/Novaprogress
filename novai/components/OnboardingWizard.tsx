
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';
import { UserProfile } from '../types';
import { Ruler, Weight, User, ArrowRight, CheckCircle2, Target, Crown, Zap } from 'lucide-react';

interface OnboardingWizardProps {
    onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
    const { updateProfile, state } = useApp();
    const [step, setStep] = useState(1);
    
    // Temporary State for Form
    const [formData, setFormData] = useState({
        name: '',
        age: 0,
        height: 0,
        weight: 0,
        gender: 'Male',
        goalInput: '',
        goals: [] as string[]
    });

    const totalSteps = 3;
    const progress = (step / totalSteps) * 100;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.goalInput.trim()) {
            setFormData(prev => ({
                ...prev, 
                goals: [...prev.goals, prev.goalInput],
                goalInput: ''
            }));
        }
    };

    const handleSubmit = async () => {
        // Generate a Title based on gender/vibe
        const title = "Awakened Hunter";
        
        await updateProfile({
            name: formData.name || state.user.name,
            age: formData.age,
            height: formData.height,
            weight: formData.weight,
            gender: formData.gender,
            goals: formData.goals,
            title: title
        });
        onComplete();
    };

    const variants = {
        enter: { x: 50, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -50, opacity: 0 }
    };

    return (
        <div className="fixed inset-0 z-[150] bg-void flex items-center justify-center p-4">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[100px] rounded-full"></div>
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-display font-black text-white mb-2">SYSTEM INITIALIZATION</h1>
                    <p className="text-gray-400 font-mono text-sm">Configuring Hunter Profile... {Math.round(progress)}%</p>
                    <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="bg-voidLight border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] min-h-[400px] flex flex-col relative overflow-hidden">
                    <AnimatePresence mode='wait'>
                        
                        {/* STEP 1: PHYSIOLOGY */}
                        {step === 1 && (
                            <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" className="flex-grow flex flex-col">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Zap className="text-yellow-500" /> Physiological Data
                                </h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-500 font-bold">Gender</label>
                                            <select 
                                                value={formData.gender}
                                                onChange={e => setFormData({...formData, gender: e.target.value})}
                                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none mt-1"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Non-Binary">Non-Binary</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-500 font-bold">Age</label>
                                            <input 
                                                type="number"
                                                value={formData.age || ''}
                                                onChange={e => setFormData({...formData, age: Number(e.target.value)})}
                                                placeholder="Yrs"
                                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none mt-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-500 font-bold flex items-center gap-1"><Ruler size={10}/> Height (cm)</label>
                                            <input 
                                                type="number"
                                                value={formData.height || ''}
                                                onChange={e => setFormData({...formData, height: Number(e.target.value)})}
                                                placeholder="cm"
                                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-500 font-bold flex items-center gap-1"><Weight size={10}/> Weight (kg)</label>
                                            <input 
                                                type="number"
                                                value={formData.weight || ''}
                                                onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
                                                placeholder="kg"
                                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: IDENTITY */}
                        {step === 2 && (
                            <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" className="flex-grow flex flex-col">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Crown className="text-purple-500" /> Identity Verification
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-500 font-bold">Codename / Name</label>
                                        <input 
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            placeholder="e.g. Sung Jin-Woo"
                                            className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-lg text-white focus:border-purple-500 focus:outline-none mt-1 font-display font-bold"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                        <h4 className="text-purple-300 font-bold text-sm mb-1">System Message</h4>
                                        <p className="text-xs text-gray-400">
                                            Your rank will be set to <span className="text-white font-bold">E-Rank</span>. 
                                            Complete quests to evolve. Your journey begins now.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: GOALS */}
                        {step === 3 && (
                            <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" className="flex-grow flex flex-col">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Target className="text-red-500" /> Core Directives
                                </h2>
                                <div className="space-y-4 flex-grow flex flex-col">
                                    <form onSubmit={handleAddGoal} className="flex gap-2">
                                        <input 
                                            value={formData.goalInput}
                                            onChange={e => setFormData({...formData, goalInput: e.target.value})}
                                            placeholder="Add a main goal (e.g. Lose 5kg)"
                                            className="flex-grow bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none"
                                            autoFocus
                                        />
                                        <button type="submit" className="p-3 bg-red-500 hover:bg-red-400 text-white rounded-lg transition-colors"><ArrowRight size={20} /></button>
                                    </form>
                                    
                                    <div className="flex-grow bg-black/20 rounded-xl p-4 overflow-y-auto space-y-2 border border-white/5">
                                        {formData.goals.length === 0 && <span className="text-gray-600 text-xs italic">No directives set.</span>}
                                        {formData.goals.map((g, i) => (
                                            <motion.div initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                                <CheckCircle2 size={14} className="text-green-500" /> {g}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={handleNext}
                            disabled={step === 1 && (!formData.height || !formData.weight)} // Simple validation
                            className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {step === totalSteps ? 'COMPLETE AWAKENING' : 'NEXT PHASE'} <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
