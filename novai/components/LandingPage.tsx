
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Trophy, Target, Mail, Github, Chrome } from 'lucide-react';
import { useApp } from '../App';

interface LandingPageProps {
    onEmailLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEmailLogin }) => {
    const { handleSocialLogin } = useApp();

    return (
        <div className="min-h-screen bg-void flex flex-col items-center justify-center relative overflow-hidden">
             {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

            <div className="container mx-auto px-4 z-10 text-center max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-widest text-accent mb-6">
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                        System v2.5 Online
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-display font-black text-white leading-tight mb-6 tracking-tighter drop-shadow-[0_0_50px_rgba(109,40,217,0.5)]">
                        FORGE YOUR <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryLight via-white to-accent">LEGACY</span>
                    </h1>
                    
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                        The ultimate gamified life-evolution OS. Level up your fitness, skills, business, and family life with anime-inspired progression.
                    </p>
                    
                    <div className="flex flex-col gap-4 max-w-sm mx-auto mb-16">
                         <button 
                            onClick={() => handleSocialLogin('google')}
                            className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3"
                         >
                            <Chrome size={20} /> Continue with Google
                         </button>
                         <div className="grid grid-cols-2 gap-4">
                             <button 
                                onClick={() => handleSocialLogin('github')}
                                className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/10 transition-colors backdrop-blur-md flex items-center justify-center gap-2"
                             >
                                <Github size={16} /> GitHub
                             </button>
                             <button 
                                onClick={onEmailLogin}
                                className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/10 transition-colors backdrop-blur-md flex items-center justify-center gap-2"
                             >
                                <Mail size={16} /> Email
                             </button>
                         </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                        <FeatureCard icon={Zap} title="Gamified XP" desc="Earn XP for every real-world action." color="text-yellow-400" />
                        <FeatureCard icon={Shield} title="Rank Up" desc="Evolve from E-Rank to S-Rank." color="text-purple-400" />
                        <FeatureCard icon={Trophy} title="Quests" desc="Daily missions & epic boss battles." color="text-red-400" />
                        <FeatureCard icon={Target} title="Analytics" desc="Visual stats for body, mind & wealth." color="text-blue-400" />
                    </div>
                </motion.div>
            </div>
            
            <div className="absolute bottom-6 text-xs text-gray-600 font-mono">
                NOVA PROGRESS // SYSTEM INITIALIZED
            </div>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, color }: any) => (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm">
        <Icon size={24} className={`mb-3 ${color}`} />
        <h3 className="font-bold text-white mb-1">{title}</h3>
        <p className="text-xs text-gray-400">{desc}</p>
    </div>
);
