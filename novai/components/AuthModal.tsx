
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { Loader2, Mail, Lock, Chrome, Shield, AlertCircle, CheckCircle2, Eye, EyeOff, Github, ArrowRight, UserPlus, LogIn, KeyRound, Send, HelpCircle } from 'lucide-react';
import { useApp } from '../App';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

type AuthStep = 'initial' | 'password' | 'magic_link_sent' | 'register' | 'forgot_password_sent';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess, onClose }) => {
  const { handleSocialLogin: handleSocialLoginFromContext } = useApp();
  const [step, setStep] = useState<AuthStep>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);

  useEffect(() => {
    if (isOpen) {
        // Reset state on open
        setStep('initial');
        setError(null);
        setMessage(null);
        setPassword('');
        const savedEmail = localStorage.getItem('nova_remembered_email');
        if (savedEmail) setEmail(savedEmail);
    }
  }, [isOpen]);
  
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) { setError("System Offline: Database connection unavailable."); return; }
    
    setLoading(true);
    setError(null);
    setMessage(null);
    const cleanEmail = email.trim().toLowerCase();
    localStorage.setItem('nova_remembered_email', cleanEmail);

    try {
        const { data, error: checkError } = await supabase.auth.signInWithOtp({
            email: cleanEmail,
            options: { shouldCreateUser: false }
        });

        if (checkError && checkError.message.includes('No user found')) {
            setIsExistingUser(false);
            setStep('register');
        } else if (checkError) {
            throw checkError;
        } else {
            setIsExistingUser(true);
            setStep('password');
        }

    } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
        await supabase.auth.signInWithOtp({
            email: email.trim().toLowerCase()
        });
        setMessage(`Access link sent to ${email}. Check your inbox.`);
        setStep('magic_link_sent');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
      if (!supabase || !email) return;
      setLoading(true);
      setError(null);
      try {
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
          if (error) throw error;
          setMessage(`Password reset link sent to ${email}. Please check your inbox.`);
          setStep('forgot_password_sent');
      } catch (err: any) {
          setError(err.message || "Failed to send reset link.");
      } finally {
          setLoading(false);
      }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!supabase) return;
      setLoading(true);
      setError(null);
      try {
          const { error } = await supabase.auth.signInWithPassword({
              email: email.trim().toLowerCase(),
              password
          });
          if (error) throw error;
          onSuccess();
      } catch (err: any) {
          setError(err.message || "Invalid credentials.");
      } finally {
          setLoading(false);
      }
  };

  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!supabase) return;
      setLoading(true);
      setError(null);
      try {
          const { data, error } = await supabase.auth.signUp({
              email: email.trim().toLowerCase(),
              password
          });
          if (error) throw error;
          if (data.session) {
              onSuccess();
          } else {
              setMessage("Registration successful. Please check your email to verify your account.");
              setStep('magic_link_sent');
          }
      } catch (err: any) {
          setError(err.message || "Registration failed.");
      } finally {
          setLoading(false);
      }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    await handleSocialLoginFromContext(provider);
    setLoading(false);
  };
  
  const stepVariants = {
    hidden: { opacity: 0, y: 20, position: 'absolute' as 'absolute' },
    visible: { opacity: 1, y: 0, position: 'relative' as 'relative' },
    exit: { opacity: 0, y: -20, position: 'absolute' as 'absolute' }
  };

  const isMessageStep = step === 'magic_link_sent' || step === 'forgot_password_sent';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-void/95 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-voidLight border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(109,40,217,0.25)] relative"
      >
        <div className="h-2 w-full bg-gradient-to-r from-primary via-purple-500 to-accent animate-shimmer"></div>
        <div className="p-8">
            <div className="text-center mb-8 min-h-[110px]">
                <motion.div 
                   layout
                   className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-violet-900 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-primary/30 border border-white/10"
                >
                   {step === 'forgot_password_sent' ? <KeyRound className="text-white w-8 h-8" /> : <Shield className="text-white w-8 h-8" />}
                </motion.div>
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <h2 className="text-3xl font-display font-black text-white tracking-tight">
                            {step === 'initial' && 'SYSTEM ACCESS'}
                            {step === 'password' && 'VERIFY IDENTITY'}
                            {step === 'register' && 'NEW HUNTER'}
                            {step === 'magic_link_sent' && 'UPLINK SENT'}
                            {step === 'forgot_password_sent' && 'RECOVERY PROTOCOL'}
                        </h2>
                        {!isMessageStep && <p className="text-gray-400 text-xs font-mono uppercase tracking-widest mt-2">Identify yourself, Hunter</p>}
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={step}
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="w-full"
                >
                    {step === 'initial' && (
                        <div className="space-y-4">
                            <button onClick={() => handleSocialLogin('google')} className="w-full flex items-center justify-center gap-3 py-4 bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/20 transition-all">
                                <Chrome size={18} /> Continue with Google
                            </button>
                            <button onClick={() => handleSocialLogin('github')} className="w-full flex items-center justify-center gap-3 py-4 bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/20 transition-all">
                                <Github size={18} /> Continue with GitHub
                            </button>
                             <div className="flex items-center gap-4 my-2">
                                <div className="h-px bg-white/10 flex-grow"></div>
                                <span className="text-xs text-gray-500 font-bold">OR</span>
                                <div className="h-px bg-white/10 flex-grow"></div>
                            </div>
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-4 text-gray-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-primary focus:outline-none text-white text-sm font-medium transition-all focus:bg-black/60"
                                        placeholder="hunter@novaforge.ai" required autoFocus
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-[0_0_20px_rgba(109,40,217,0.4)] hover:bg-primaryLight transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Continue with Email <ArrowRight size={16}/></>}
                                </button>
                            </form>
                        </div>
                    )}
                    {(step === 'password' || step === 'register') && (
                        <form onSubmit={step === 'password' ? handlePasswordLogin : handleRegister} className="space-y-4">
                             <div className="p-2 bg-black/20 rounded-lg text-center text-sm text-gray-300 border border-white/5">{email}</div>
                             <div className="relative group">
                                <Lock className="absolute left-4 top-4 text-gray-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-12 focus:border-primary focus:outline-none text-white text-sm font-medium transition-all focus:bg-black/60"
                                    placeholder="Enter your password" required autoFocus
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-4 text-gray-500 hover:text-white p-1">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-[0_0_20px_rgba(109,40,217,0.4)] hover:bg-primaryLight transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                               {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>{step === 'register' ? 'Create Account' : 'Sign In'}</>}
                            </button>
                            {step === 'password' && (
                                <div className="flex justify-between items-center text-xs">
                                  <button type="button" onClick={handlePasswordReset} disabled={loading} className="py-2 text-primaryLight/70 hover:text-white transition-colors flex items-center gap-1">
                                      <HelpCircle size={12} /> Forgot Password?
                                  </button>
                                  <button type="button" onClick={handleMagicLink} disabled={loading} className="py-2 text-primaryLight/70 hover:text-white transition-colors">
                                      Email me a magic link
                                  </button>
                                </div>
                            )}
                        </form>
                    )}
                     {isMessageStep && (
                        <div className="text-center space-y-4 py-8">
                            <Send size={40} className="mx-auto text-primary animate-pulse" />
                            <p className="text-green-400 font-bold">
                                {step === 'magic_link_sent' ? 'Uplink Sent Successfully' : 'Recovery Link Dispatched'}
                            </p>
                            <p className="text-gray-300 text-sm">{message}</p>
                            <button onClick={onClose} className="w-full mt-4 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20">Close</button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                  <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono rounded-lg flex items-center gap-2 text-center">
                      <AlertCircle size={14} /> <span>{error}</span>
                  </motion.div>
              )}
            </AnimatePresence>

             <button onClick={() => setStep('initial')} className={`w-full mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-white transition-all ${step === 'initial' || isMessageStep ? 'opacity-0 h-0 invisible' : 'opacity-100 h-auto visible'}`}>
                <ArrowRight size={12} className="rotate-180" /> Back
             </button>
        </div>
      </motion.div>
    </div>
  );
};
