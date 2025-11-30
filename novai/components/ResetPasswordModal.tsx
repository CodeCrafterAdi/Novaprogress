
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { Loader2, Lock, KeyRound, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage("Your password has been successfully updated. You are now logged in.");
        setTimeout(() => {
            onSuccess();
        }, 2500);
    } catch (err: any) {
        setError(err.message || "Failed to update password.");
    } finally {
        setLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-void/95 backdrop-blur-xl" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-voidLight border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(109,40,217,0.25)] relative"
      >
        <div className="h-2 w-full bg-gradient-to-r from-primary via-purple-500 to-accent animate-shimmer"></div>
        <div className="p-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-violet-900 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-primary/30 border border-white/10">
                   <KeyRound className="text-white w-8 h-8" />
                </div>
                <h2 className="text-3xl font-display font-black text-white tracking-tight">SET NEW PASSWORD</h2>
                <p className="text-gray-400 text-xs font-mono uppercase tracking-widest mt-2">Create your new access credentials</p>
            </div>

            {message ? (
                <div className="text-center space-y-4 py-8">
                    <CheckCircle2 size={40} className="mx-auto text-green-500" />
                    <p className="text-green-400 font-bold">Success!</p>
                    <p className="text-gray-300 text-sm">{message}</p>
                </div>
            ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="relative group">
                        <Lock className="absolute left-4 top-4 text-gray-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-12 focus:border-primary focus:outline-none text-white text-sm font-medium transition-all focus:bg-black/60"
                            placeholder="Enter new password" required autoFocus
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-4 text-gray-500 hover:text-white p-1">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-4 text-gray-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-12 focus:border-primary focus:outline-none text-white text-sm font-medium transition-all focus:bg-black/60"
                            placeholder="Confirm new password" required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-[0_0_20px_rgba(109,40,217,0.4)] hover:bg-primaryLight transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                       {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'UPDATE PASSWORD'}
                    </button>
                    {error && (
                        <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono rounded-lg flex items-center gap-2 text-center">
                            <AlertCircle size={14} /> <span>{error}</span>
                        </motion.div>
                    )}
                </form>
            )}
        </div>
      </motion.div>
    </div>
  );
};
