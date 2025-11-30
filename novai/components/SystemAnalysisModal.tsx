
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Shield, Zap, Target, AlertTriangle, TrendingUp, Cpu, Brain, Crosshair, Camera, Upload, ScanLine } from 'lucide-react';
import { useApp } from '../App';
import { getDetailedProfileAnalysis } from '../services/geminiService';
import { AnalysisReport } from '../types';

interface SystemAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemAnalysisModal: React.FC<SystemAnalysisModalProps> = ({ isOpen, onClose }) => {
  const { state, setGeminiError } = useApp();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'scanning' | 'results'>('upload');

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
        setStep('upload');
        setReport(null);
        setScanStep(0);
        setSelectedImage(null);
    }
  }, [isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        // Simple compression/resize could happen here to keep payload small
        setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startScan = async () => {
      setStep('scanning');
      setLoading(true);
      
      const stepInterval = setInterval(() => {
        setScanStep(prev => Math.min(95, prev + 5));
      }, 150);

      let base64Data = selectedImage ? selectedImage.split(',')[1] : undefined;

      try {
        const data = await getDetailedProfileAnalysis(state, base64Data);
        setReport(data);
      } catch (err: any) {
        if (err.message === 'GEMINI_INVALID_KEY') {
            setGeminiError('GEMINI_INVALID_KEY');
            setReport({
                hunterClass: "Glitch Walker",
                summary: "System scan failed due to an invalid API Key. Please configure the key in your environment settings.",
                vitalStatus: { status: "Critical", message: "Authentication Failure" },
                keyStrengths: [],
                weaknesses: ["API Connectivity"],
                recommendedFocus: "System Configuration",
                tacticalAdvice: ["Verify your Gemini API Key is correct and has billing enabled."],
                projectedRankUp: "Unknown"
            });
        }
      } finally {
        clearInterval(stepInterval);
        setScanStep(100);
        setTimeout(() => {
            setLoading(false);
            setStep('results');
        }, 500);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-voidLight border border-primary/40 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(109,40,217,0.3)] flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-primary/10 border-b border-primary/20 p-6 flex justify-between items-center relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer"></div>
            <div className="flex items-center gap-3">
                <Cpu className="text-primary animate-pulse" size={24} />
                <h2 className="text-2xl font-display font-black text-white tracking-widest uppercase">
                    SYSTEM DIAGNOSTIC
                </h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto custom-scrollbar flex-grow relative">
            
            {/* STEP 1: UPLOAD / START */}
            {step === 'upload' && (
                <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="mb-8 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className={`w-48 h-48 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all ${selectedImage ? 'border-primary' : 'border-gray-600 hover:border-primary/50'}`}>
                            {selectedImage ? (
                                <img src={selectedImage} alt="Scan Target" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-gray-500 flex flex-col items-center gap-2">
                                    <Camera size={40} />
                                    <span className="text-xs uppercase font-bold">Upload Biometrics</span>
                                    <span className="text-[10px]">(Optional Photo)</span>
                                </div>
                            )}
                            
                            {selectedImage && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold uppercase">
                                    <Upload size={20} className="mb-1" /> Change Image
                                </div>
                            )}
                        </div>
                        {selectedImage && <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-full"><ScanLine size={14}/></div>}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload} 
                        />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">Ready to Initialize Scan</h3>
                    <p className="text-gray-400 text-sm max-w-sm mb-8">
                        The System will analyze your stats, tasks, and uploaded biometrics (if provided) to calculate your Hunter Rank and optimal growth path.
                    </p>

                    <button 
                        onClick={startScan}
                        className="px-8 py-4 bg-primary hover:bg-primaryLight text-white font-bold rounded-xl shadow-[0_0_30px_rgba(91,33,182,0.4)] transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                        <Target size={20} /> INITIATE DIAGNOSTIC
                    </button>
                </div>
            )}

            {/* STEP 2: SCANNING */}
            {step === 'scanning' && (
                <div className="flex flex-col items-center justify-center py-20 text-center min-h-[400px]">
                    <div className="w-32 h-32 relative mb-8">
                        <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-3xl text-primary">
                            {scanStep}%
                        </div>
                        {selectedImage && (
                             <div className="absolute inset-0 rounded-full overflow-hidden opacity-30 mix-blend-overlay">
                                 <img src={selectedImage} className="w-full h-full object-cover" />
                             </div>
                        )}
                    </div>
                    <div className="space-y-4 max-w-md w-full px-8">
                        <div className="text-primary font-mono text-sm uppercase tracking-widest animate-pulse">
                            {scanStep < 30 ? "Initializing Neural Link..." : 
                             scanStep < 50 ? "Processing Biometric Data..." :
                             scanStep < 80 ? "Calculating Potential..." : "Compiling Report..."}
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-primary"
                                animate={{ width: `${scanStep}%` }}
                            />
                        </div>
                        <div className="font-mono text-xs text-gray-500 h-6">
                            {scanStep > 20 && <p className="animate-in fade-in slide-in-from-bottom-2">Reading muscle density...</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: RESULTS */}
            {step === 'results' && report && (
                <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
                    
                    {/* Class & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 text-white/5">
                                <Shield size={100} />
                            </div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Assigned Class</div>
                            <div className="text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primaryLight to-white">
                                {report.hunterClass.toUpperCase()}
                            </div>
                        </div>

                        <div className={`border p-5 rounded-2xl relative overflow-hidden ${
                            report.vitalStatus.status === 'Optimal' ? 'bg-green-500/10 border-green-500/30' : 
                            report.vitalStatus.status === 'Critical' ? 'bg-red-500/10 border-red-500/30' :
                            'bg-yellow-500/10 border-yellow-500/30'
                        }`}>
                            <div className="text-xs uppercase tracking-widest mb-1 opacity-80 flex items-center gap-2">
                                <Activity size={12} /> Vital Status
                            </div>
                            <div className="text-2xl font-display font-black flex items-center gap-2">
                                {report.vitalStatus.status.toUpperCase()}
                            </div>
                            <div className="text-xs mt-1 opacity-80">{report.vitalStatus.message}</div>
                        </div>
                    </div>

                    {/* Physique Analysis (If Image Uploaded) */}
                    {report.physiqueAnalysis && (
                        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 p-6 rounded-2xl relative overflow-hidden">
                             <div className="flex items-center gap-2 mb-4 text-blue-400 font-bold uppercase tracking-widest text-sm">
                                <ScanLine size={16} /> Biometric Analysis
                             </div>
                             
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-black/30 p-3 rounded-xl border border-blue-500/20 text-center">
                                    <div className="text-[10px] text-gray-400 uppercase">Rank</div>
                                    <div className="text-3xl font-black text-blue-400">{report.physiqueAnalysis.rank}</div>
                                </div>
                                <div className="bg-black/30 p-3 rounded-xl border border-blue-500/20 text-center">
                                    <div className="text-[10px] text-gray-400 uppercase">Est. Body Fat</div>
                                    <div className="text-xl font-bold text-white">{report.physiqueAnalysis.estimatedBodyFat}</div>
                                </div>
                                <div className="bg-black/30 p-3 rounded-xl border border-blue-500/20 text-center">
                                    <div className="text-[10px] text-gray-400 uppercase">Aesthetics</div>
                                    <div className="text-xl font-bold text-white">{report.physiqueAnalysis.aestheticsScore}/100</div>
                                </div>
                                <div className="bg-black/30 p-3 rounded-xl border border-blue-500/20 text-center">
                                    <div className="text-[10px] text-gray-400 uppercase">Build Type</div>
                                    <div className="text-sm font-bold text-white mt-1">{report.physiqueAnalysis.potentialClass}</div>
                                </div>
                             </div>

                             <div className="space-y-3 text-sm">
                                <div className="flex gap-2">
                                    <span className="text-blue-400 font-bold shrink-0">Symmetry:</span>
                                    <span className="text-gray-300">{report.physiqueAnalysis.muscleSymmetry}</span>
                                </div>
                                <div>
                                    <span className="text-green-400 font-bold block mb-1">Strengths:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {report.physiqueAnalysis.strengths.map((s,i) => (
                                            <span key={i} className="px-2 py-0.5 bg-green-500/10 text-green-300 rounded text-xs border border-green-500/20">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-red-400 font-bold block mb-1">Weaknesses:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {report.physiqueAnalysis.weaknesses.map((w,i) => (
                                            <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-300 rounded text-xs border border-red-500/20">{w}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <span className="text-yellow-400 font-bold block mb-2">Recommended Protocol:</span>
                                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                                        {report.physiqueAnalysis.improvementPlan.map((step, i) => (
                                            <li key={i}>{step}</li>
                                        ))}
                                    </ul>
                                </div>
                             </div>
                        </div>
                    )}

                    {/* Summary */}
                    <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl">
                        <p className="text-gray-200 italic font-medium leading-relaxed">
                            "{report.summary}"
                        </p>
                    </div>

                    {/* Strengths & Weaknesses (General) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <TrendingUp size={16} /> Key Attributes
                            </h3>
                            <ul className="space-y-2">
                                {report.keyStrengths.map((str, i) => (
                                    <li key={i} className="bg-white/5 border border-white/5 p-3 rounded-lg text-sm text-gray-300 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                        {str}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <AlertTriangle size={16} /> Vulnerabilities
                            </h3>
                            <ul className="space-y-2">
                                {report.weaknesses.map((weak, i) => (
                                    <li key={i} className="bg-white/5 border border-white/5 p-3 rounded-lg text-sm text-gray-300 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                        {weak}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase tracking-widest text-sm">
                            <Crosshair size={16} /> Tactical Recommendations
                        </div>
                        
                        <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border-l-4 border-yellow-500 p-4 rounded-r-xl">
                            <div className="text-xs text-yellow-500/80 uppercase font-bold mb-1">Primary Focus</div>
                            <div className="text-lg font-bold text-white">{report.recommendedFocus}</div>
                        </div>

                        <div className="grid gap-3">
                            {report.tacticalAdvice.map((advice, i) => (
                                <div key={i} className="bg-void border border-white/10 p-4 rounded-xl flex items-start gap-4">
                                    <div className="bg-primary/20 text-primaryLight font-bold font-mono w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm text-gray-300">{advice}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Projection */}
                    <div className="text-center pt-4 border-t border-white/5">
                        <div className="text-xs text-gray-500 uppercase">Projected Rank Up</div>
                        <div className="text-primaryLight font-mono mt-1 animate-pulse">
                            {report.projectedRankUp}
                        </div>
                    </div>

                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};