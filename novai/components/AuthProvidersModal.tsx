import React from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, ExternalLink, Chrome, Github } from 'lucide-react';
// FIX: Import SUPABASE_URL to get project ID without accessing protected property.
import { supabase, SUPABASE_URL } from '../services/supabaseClient';

interface AuthProvidersModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string | null;
}

// FIX: Use exported SUPABASE_URL constant instead of protected supabase.supabaseUrl property.
const getProjectId = () => {
    if (!SUPABASE_URL) return null;
    const url = SUPABASE_URL; // e.g., 'https://xyz.supabase.co'
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
    return match ? match[1] : null;
};

export const AuthProvidersModal: React.FC<AuthProvidersModalProps> = ({ isOpen, onClose, provider }) => {
  if (!isOpen || !provider) return null;

  const projectId = getProjectId();
  const providerSettingsUrl = projectId 
    ? `https://supabase.com/dashboard/project/${projectId}/auth/providers` 
    : 'https://supabase.com/dashboard';

  const providerDetails = {
    google: {
      name: 'Google',
      icon: <Chrome size={32} />,
      color: 'text-blue-400',
      setupUrl: 'https://console.cloud.google.com/apis/credentials',
      docUrl: 'https://supabase.com/docs/guides/auth/social-login/auth-google'
    },
    github: {
      name: 'GitHub',
      icon: <Github size={32} />,
      color: 'text-gray-300',
      setupUrl: 'https://github.com/settings/developers',
      docUrl: 'https://supabase.com/docs/guides/auth/social-login/auth-github'
    }
  };

  const details = providerDetails[provider as keyof typeof providerDetails] || providerDetails.google;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-voidLight border border-orange-500/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(249,115,22,0.3)]"
      >
        <div className="h-2 w-full bg-gradient-to-r from-orange-500 to-yellow-500"></div>
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
            <X size={24} />
        </button>

        <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 ${details.color}`}>
                    <AlertTriangle size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-display font-black text-white tracking-tight">CONFIGURATION ERROR</h2>
                    <p className="text-orange-400 font-mono text-sm uppercase tracking-wider">{details.name} Provider Not Configured</p>
                </div>
            </div>

            <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <p>
                    The social login for <strong className="text-white">{details.name}</strong> is enabled, but it's missing the required <strong className="text-white">Client ID</strong> and <strong className="text-white">Client Secret</strong>.
                </p>
                <p>
                    You need to obtain these credentials from the provider's developer console and add them to your Supabase project settings.
                </p>
            </div>

            <div className="mt-8 space-y-4 bg-black/30 p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-3">How to Fix This:</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/20 text-primaryLight font-bold font-mono w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5">1</div>
                        <div>
                            <strong>Get Credentials:</strong> Visit <a href={details.setupUrl} target="_blank" rel="noopener noreferrer" className="text-primaryLight font-bold underline hover:text-white">the {details.name} developer console</a> to create an OAuth application and get your Client ID and Client Secret.
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/20 text-primaryLight font-bold font-mono w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5">2</div>
                        <div>
                            <strong>Configure Supabase:</strong> Go to your <a href={providerSettingsUrl} target="_blank" rel="noopener noreferrer" className="text-primaryLight font-bold underline hover:text-white">Supabase Auth Providers settings</a>, select {details.name}, and paste in the credentials.
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <div className="bg-primary/20 text-primaryLight font-bold font-mono w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5">3</div>
                        <div>
                            <strong>Save and Retry:</strong> Make sure to save the settings in Supabase. Then you can close this message and try logging in again. For more help, see the <a href={details.docUrl} target="_blank" rel="noopener noreferrer" className="text-primaryLight font-bold underline hover:text-white">Supabase Docs</a>.
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors backdrop-blur-md"
                >
                    Okay, I understand
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};