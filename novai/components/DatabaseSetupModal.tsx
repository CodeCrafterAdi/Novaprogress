import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Check, Copy, AlertTriangle, RefreshCw } from 'lucide-react';
import { schemaSQL } from '../schema';

interface DatabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSetupModal: React.FC<DatabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(schemaSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 py-8 overflow-y-auto">
          
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-voidLight border border-red-500/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.3)] max-h-[95vh] flex flex-col"
          >
            {/* TOP GRADIENT BAR */}
            <div className="h-2 w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>

            {/* CLOSE BUTTON */}
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10">
              <X size={24} />
            </button>

            {/* HEADER */}
            <div className="p-8 flex-shrink-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-400">
                  <Database size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-black text-white tracking-tight">DATABASE ERROR</h2>
                  <p className="text-red-400 font-mono text-sm uppercase tracking-wider">Required Tables Not Found</p>
                </div>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed">
                The application connected to your Supabase project but could not find the necessary database tables. You must run the setup script below in your Supabase SQL Editor to initialize the database schema.
              </p>
            </div>

            {/* BODY (scrollable) */}
            <div className="px-8 pb-4 flex-grow overflow-y-auto custom-scrollbar">
              <h3 className="text-lg font-bold text-white mb-3">Database Setup Script:</h3>

              <div className="relative">
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-void hover:bg-black rounded-lg text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy SQL'}
                </button>

                <pre className="bg-black/40 text-xs text-gray-300 p-4 rounded-xl border border-white/10 max-h-64 overflow-auto custom-scrollbar font-mono">
                  <code>{schemaSQL}</code>
                </pre>
              </div>

              <div className="mt-6 p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20 text-yellow-300 text-sm space-y-3">
                <h4 className="font-bold flex items-center gap-2"><AlertTriangle size={16} /> Instructions</h4>
                <ol className="list-decimal list-inside space-y-2 text-yellow-200/90">
                  <li>Go to the <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-white">Supabase Dashboard</a> and select your project.</li>
                  <li>Navigate to the <b className="text-white">SQL Editor</b>.</li>
                  <li>Click <b className="text-white">"+ New query"</b>.</li>
                  <li>Paste the copied SQL script.</li>
                  <li>Click the green <b className="text-white">"RUN"</b> button.</li>
                </ol>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-8 flex-shrink-0 border-t border-white/10 mt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-primary hover:bg-primaryLight text-white font-bold rounded-xl shadow-[0_0_20px_rgba(109,40,217,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} /> I've run the script, Refresh Application
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
