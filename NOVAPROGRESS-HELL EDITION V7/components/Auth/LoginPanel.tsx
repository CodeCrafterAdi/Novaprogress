
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useNotification } from '../UI/NotificationProvider';
import MirrorButton from '../UI/MirrorButton';

interface LoginPanelProps {
  onLoginSuccess: (userId: string) => void;
}

const BG_VIDEO_URL = "https://voawdvkcqyikeilflzzt.supabase.co/storage/v1/object/public/animation/login/v1/background_circle.mp4";

const LoginPanel: React.FC<LoginPanelProps> = ({ onLoginSuccess }) => {
  const { addToast } = useNotification();
  const [videoError, setVideoError] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'RECOVERY'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) addToast(error.message, 'error');
  };

  const handleEmailAuth = async () => {
    if (!email || (authMode !== 'RECOVERY' && !password)) {
        addToast("CREDENTIALS REQUIRED", "error");
        return;
    }
    setLoading(true);

    try {
        if (authMode === 'REGISTER') {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            addToast("INITIATION LINK SENT TO EMAIL", "success");
        } else if (authMode === 'LOGIN') {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (data.user) onLoginSuccess(data.user.id);
        } else if (authMode === 'RECOVERY') {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/update-password',
            });
            if (error) throw error;
            addToast("RECOVERY SIGNAL TRANSMITTED", "success");
            setAuthMode('LOGIN');
        }
    } catch (e: any) {
        addToast(e.message?.toUpperCase() || "AUTHENTICATION FAILED", "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full min-h-screen flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden bg-black">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-black">
        {!videoError ? (
            <video 
              src={BG_VIDEO_URL} autoPlay loop muted playsInline preload="auto"
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover opacity-60 transition-opacity duration-1000"
              style={{ filter: 'contrast(1.2) brightness(0.7) hue-rotate(-10deg)' }} 
            />
        ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-950/40 via-black to-gray-900/40 opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-red-950/40 to-black mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      {/* CONTENT WRAPPER */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          {/* Header */}
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-10">
            <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter text-white drop-shadow-[0_0_25px_rgba(220,38,38,0.5)]">
              NOVA<span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900">PRO</span>
            </h1>
            <div className="flex items-center justify-center gap-4 mt-4">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-red-500" />
                <span className="text-[10px] font-mono tracking-[0.4em] text-red-200 uppercase">Hell Edition V8</span>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-red-500" />
            </div>
          </motion.div>

          {/* Auth Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
             {/* Top Gradient Line */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-80" />

             {/* GOOGLE BUTTON - ENHANCED */}
             <button
                onClick={handleGoogleLogin}
                className="group relative w-full mb-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-red-500/50 text-white transition-all duration-500 rounded-full py-4 flex items-center justify-center gap-3 overflow-hidden hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 w-1/2 h-full transform -translate-x-[150%] group-hover:translate-x-[250%] transition-transform duration-700 ease-in-out" />
                <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-colors duration-500" />
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12.5S6.42 23 12.1 23c5.83 0 8.84-4.15 8.84-11.9z"/></svg>
                <span className="font-display font-bold tracking-widest text-xs uppercase">Continue with Google</span>
             </button>

             <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-[10px] text-gray-500 font-mono uppercase">Or Neural Link</span>
                <div className="h-[1px] flex-1 bg-white/10" />
             </div>

             {/* EMAIL FORM */}
             <div className="space-y-4">
                <div className="group relative">
                    <input 
                       type="email" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       placeholder=" "
                       className="peer w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 transition-colors font-mono text-sm"
                    />
                    <label className="absolute left-4 top-3 text-xs text-gray-500 transition-all peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:bg-black peer-focus:px-2 peer-focus:text-red-500 peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:bg-black peer-not-placeholder-shown:px-2 pointer-events-none uppercase">
                        Email Address
                    </label>
                </div>

                {authMode !== 'RECOVERY' && (
                    <div className="group relative">
                        <input 
                           type="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder=" " 
                           className="peer w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 transition-colors font-mono text-sm"
                        />
                        <label className="absolute left-4 top-3 text-xs text-gray-500 transition-all peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:bg-black peer-focus:px-2 peer-focus:text-red-500 peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:bg-black peer-not-placeholder-shown:px-2 pointer-events-none uppercase">
                            Password
                        </label>
                    </div>
                )}

                <div className="pt-2">
                    <MirrorButton 
                        text={loading ? "PROCESSING..." : authMode === 'LOGIN' ? "ENTER SYSTEM" : authMode === 'REGISTER' ? "INITIATE SEQUENCE" : "SEND SIGNAL"}
                        onClick={handleEmailAuth}
                        disabled={loading}
                        className="w-full !py-4 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                        variant="primary"
                        reflectionColor="from-transparent via-red-500/40 to-transparent"
                    />
                </div>

                <div className="flex justify-between items-center mt-4 text-[10px] font-mono text-gray-400">
                    <button onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')} className="hover:text-white transition-colors uppercase">
                        {authMode === 'LOGIN' ? "Create Account" : "Back to Login"}
                    </button>
                    {authMode !== 'RECOVERY' && (
                        <button onClick={() => setAuthMode('RECOVERY')} className="hover:text-red-400 transition-colors uppercase">
                            Lost Key?
                        </button>
                    )}
                </div>
             </div>
          </motion.div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 z-10 text-[9px] font-mono text-white/20 tracking-[0.3em]">SECURE CONNECTION ESTABLISHED</div>
    </motion.div>
  );
};

export default LoginPanel;
