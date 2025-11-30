
import React from 'react';
import { motion } from 'framer-motion';
import { X, KeyRound, ArrowRight, RefreshCw, Layers } from 'lucide-react';

interface ApiKeySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeySetupModal: React.FC<ApiKeySetupModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-voidLight border border-red-500/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.3)]"
      >
        <div className="h-2 w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
            <X size={24} />
        </button>

        <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-400">
                    <KeyRound size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-display font-black text-white tracking-tight">SYSTEM ALERT</h2>
                    <p className="text-red-400 font-mono text-sm uppercase tracking-wider">Invalid Gemini API Key Detected</p>
                </div>
            </div>

            <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <p>
                    The Nova AI subsystem requires a valid Google Gemini API key to function. The key provided in your environment is either missing or invalid.
                </p>
                <p>
                    AI-powered features like task generation and analysis will be disabled or use mock data until a valid key is configured.
                </p>
            </div>

            <div className="mt-8 space-y-4 bg-black/30 p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-3">How to Fix This:</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/20 text-primaryLight font-bold font-mono w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5">1</div>
                        <div>
                            <strong>Obtain a Gemini API Key:</strong> Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primaryLight font-bold underline hover:text-white">Google AI Studio</a> to create your API key.
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/20 text-primaryLight font-bold font-mono w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5">2</div>
                        {/* FIXED: Added clear instructions for both deployment and local development. */}
                        <div>
                            <strong>Set Environment Variable:</strong>
                            <ul className="list-disc list-inside pl-4 mt-2 space-y-2 text-gray-400">
                                <li>
                                    <strong>For Deployment (Netlify/Vercel):</strong> In your project settings, set an environment variable named <code className="bg-white/10 text-accent px-1.5 py-0.5 rounded text-xs">VITE_GEMINI_API_KEY</code> with your new key.
                                </li>
                                <li>
                                    <strong>For Local Development:</strong> Create a file named <code className="bg-white/10 text-accent px-1.5 py-0.5 rounded text-xs">.env.local</code> in the project's root folder. Add this line: <br/> <code className="bg-white/10 text-accent px-1.5 py-0.5 rounded text-xs mt-1 inline-block">VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE</code>
                                </li>
                            </ul>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <div className="bg-primary/20 text-primaryLight font-bold font-mono w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5">3</div>
                        <div>
                            <strong>Restart & Refresh:</strong> After setting the variable, restart your local development server or redeploy your site. Then, click the refresh button below to reload the system.
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors backdrop-blur-md flex items-center justify-center gap-2"
                >
                    <Layers size={16} /> Continue with Mock Data
                </button>
                <button 
                    onClick={() => window.location.reload()}
                    className="w-full py-3 bg-primary hover:bg-primaryLight text-white font-bold rounded-xl shadow-[0_0_20px_rgba(109,40,217,0.3)] transition-all flex items-center justify-center gap-2"
                >
                    <RefreshCw size={16} /> I've set my key, Refresh
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};
