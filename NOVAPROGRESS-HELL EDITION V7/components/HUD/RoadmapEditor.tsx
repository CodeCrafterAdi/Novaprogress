
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { audioManager } from '../../utils/audioManager';
import { useNotification } from '../UI/NotificationProvider';
import { QuestModal, ICON_DATA } from './Views';

interface RoadmapEditorProps {
  userId: string;
}

// --- ATMOSPHERIC BACKGROUND ---
const AtmosphericBackground = ({ scale, pan }: { scale: number, pan: {x: number, y: number} }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        const particles: {x: number, y: number, size: number, speedY: number, alpha: number}[] = [];
        const spikes: {x: number, height: number, offset: number}[] = [];
        for(let i=0; i<100; i++) particles.push({ x: Math.random() * w, y: Math.random() * h, size: Math.random() * 2 + 0.5, speedY: Math.random() * 0.5 + 0.1, alpha: Math.random() * 0.5 });
        for(let i=0; i<50; i++) spikes.push({ x: (i * (w / 40)) + Math.random() * 20, height: 50 + Math.random() * 100, offset: Math.random() * Math.PI });
        let time = 0;
        const render = () => {
            time += 0.01;
            ctx.clearRect(0, 0, w, h);
            const parallaxX = pan.x * 0.2;
            const parallaxY = pan.y * 0.2;
            ctx.save();
            ctx.fillStyle = 'rgba(20, 0, 0, 0.4)';
            ctx.beginPath();
            spikes.forEach(s => {
                const drawX = (s.x * scale) + parallaxX + (Math.sin(time + s.offset) * 10);
                const drawY = h; 
                const drawH = (s.height * scale);
                const modX = (drawX % (w * 2)); 
                ctx.moveTo(modX, drawY);
                ctx.lineTo(modX + (10 * scale), drawY - drawH);
                ctx.lineTo(modX + (20 * scale), drawY);
            });
            ctx.fill();
            particles.forEach(p => {
                p.y -= p.speedY;
                if (p.y < 0) p.y = h;
                const drawX = (p.x * scale) + parallaxX;
                const drawY = (p.y * scale) + parallaxY;
                const screenX = ((drawX % w) + w) % w;
                const screenY = ((drawY % h) + h) % h;
                ctx.fillStyle = `rgba(200, 50, 50, ${p.alpha})`;
                ctx.beginPath();
                ctx.arc(screenX, screenY, p.size * scale, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
            requestAnimationFrame(render);
        };
        const animationId = requestAnimationFrame(render);
        const handleResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
        window.addEventListener('resize', handleResize);
        return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', handleResize); };
    }, [scale, pan]);
    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-50 z-0" />;
};

const getPath = (x1: number, y1: number, x2: number, y2: number) => {
  const dist = Math.abs(x2 - x1);
  const cp1x = x1 + dist * 0.5;
  const cp1y = y1;
  const cp2x = x2 - dist * 0.5;
  const cp2y = y2;
  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
};

const RoadmapEditor: React.FC<RoadmapEditorProps> = ({ userId }) => {
  const { addToast } = useNotification();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSpawnPos, setModalSpawnPos] = useState<{x: number, y: number} | null>(null);
  const [linkingNodeId, setLinkingNodeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTasks();
    const channel = supabase.channel('roadmap_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, fetchTasks)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const fetchTasks = async () => {
    let { data } = await supabase.from('tasks').select('*').eq('user_id', userId);
    const stored = localStorage.getItem(`nova_local_tasks_${userId}`);
    let localTasks = stored ? JSON.parse(stored) : [];
    let allTasks = [...(data || []), ...localTasks] as Task[];
    allTasks = Array.from(new Map(allTasks.map(item => [item.id, item])).values());
    setTasks(allTasks);
  };

  const saveTaskPosition = async (id: string, x: number, y: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, x, y } : t));
    try {
      if(id.startsWith('local-')) {
         const stored = JSON.parse(localStorage.getItem(`nova_local_tasks_${userId}`) || '[]');
         const updated = stored.map((t: Task) => t.id === id ? { ...t, x, y } : t);
         localStorage.setItem(`nova_local_tasks_${userId}`, JSON.stringify(updated));
      } else {
         await supabase.from('tasks').update({ x, y }).eq('id', id);
      }
    } catch(e) {}
  };

  const handleConnect = async (targetId: string) => {
    if (!linkingNodeId || linkingNodeId === targetId) return;
    const sourceTask = tasks.find(t => t.id === linkingNodeId);
    if (!sourceTask) return;
    const newConnections = [...(sourceTask.connections || []), targetId];
    setTasks(prev => prev.map(t => t.id === linkingNodeId ? { ...t, connections: newConnections } : t));
    setLinkingNodeId(null);
    audioManager.playSfx('LEVEL_UP');
    try {
        if(sourceTask.id.startsWith('local-')) {
             // Local logic update
        } else {
             await supabase.from('tasks').update({ connections: newConnections }).eq('id', linkingNodeId);
        }
        addToast("NEURAL LINK ESTABLISHED", "success");
    } catch(e) {}
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if(e.target !== containerRef.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if(!rect) return;
    const x = (e.clientX - rect.left - pan.x) / scale;
    const y = (e.clientY - rect.top - pan.y) / scale;
    setModalSpawnPos({ x, y });
    setIsModalOpen(true);
    audioManager.playSfx('CLICK');
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      if(e.button === 0 && (e.target === containerRef.current)) {
          setIsDraggingCanvas(true);
          setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
      if (isDraggingCanvas) {
          setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
      if (linkingNodeId) {
          const rect = containerRef.current?.getBoundingClientRect();
          if(rect) {
              setMousePos({ x: (e.clientX - rect.left - pan.x) / scale, y: (e.clientY - rect.top - pan.y) / scale });
          }
      }
  };
  const handleMouseUp = () => {
      setIsDraggingCanvas(false);
      setLinkingNodeId(null);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#080808] select-none" onMouseUp={handleMouseUp}>
        <AtmosphericBackground scale={scale} pan={pan} />
        <div className="absolute top-4 right-4 z-50 flex gap-2">
            <button onClick={() => setScale(s => Math.min(s + 0.1, 2))} className="bg-white/10 p-2 rounded text-white border border-white/5 hover:bg-white/20">+</button>
            <button onClick={() => { setScale(1); setPan({x:0, y:0}); }} className="bg-white/10 p-2 rounded text-white text-xs border border-white/5 hover:bg-white/20">RESET</button>
            <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="bg-white/10 p-2 rounded text-white border border-white/5 hover:bg-white/20">-</button>
        </div>
        <div 
            ref={containerRef}
            className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onDoubleClick={handleCanvasDoubleClick}
            onWheel={(e) => setScale(s => Math.max(0.5, Math.min(2, s - e.deltaY * 0.001)))}
        >
            <motion.div
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: '0 0' }}
                className="w-full h-full relative"
            >
                <svg className="absolute top-0 left-0 w-[5000px] h-[5000px] overflow-visible pointer-events-none z-0">
                    <defs>
                        <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    </defs>
                    {tasks.map(task => {
                        if (!task.x) return null;
                        const linksToDraw = [];
                        // 1. Manual connections
                        if (task.connections) task.connections.forEach(id => linksToDraw.push(id));
                        // 2. Linked Asset ID (Modal logic): If THIS task links TO another via Modal, draw line
                        if (task.linked_asset_id) linksToDraw.push(task.linked_asset_id);

                        return linksToDraw.map(targetId => {
                            const target = tasks.find(t => t.id === targetId);
                            if (!target || !target.x) return null;
                            
                            // Line from THIS (child) -> TARGET (Parent/Dependency)
                            // Usually dependencies are drawn Parent -> Child or Child -> Parent.
                            // Let's assume Linked Asset is a Prerequisite (Parent). So draw Target -> This.
                            // OR simply draw a line between them.
                            // Standard: Output of A -> Input of B.
                            // If B depends on A (B links to A), line goes A -> B.
                            // So line from Target (A) -> This (B).
                            const d = getPath(target.x + 180, target.y + 45, task.x, task.y + 45);

                            return (
                                <g key={`${task.id}-${targetId}`}>
                                    <path d={d} fill="none" stroke={task.completed ? "#ef4444" : "#444"} strokeWidth={task.completed ? "3" : "1"} strokeDasharray={task.completed ? "none" : "5 5"} opacity={task.completed ? 0.8 : 0.4} />
                                    {task.completed && <circle r="4" fill="#fff" filter="url(#glow)"><animateMotion dur="2s" repeatCount="indefinite" path={d} /></circle>}
                                </g>
                            );
                        });
                    })}
                    {linkingNodeId && (() => {
                        const source = tasks.find(t => t.id === linkingNodeId);
                        if (source && source.x) {
                             const d = getPath(source.x + 180, source.y + 45, mousePos.x, mousePos.y);
                             return <path d={d} stroke="#ef4444" strokeWidth="2" fill="none" strokeDasharray="5 5" />;
                        }
                    })()}
                </svg>
                {tasks.map(task => (
                    <NodeCard 
                        key={task.id} 
                        task={task} 
                        scale={scale} 
                        onDragEnd={(x, y) => saveTaskPosition(task.id, x, y)}
                        onStartLink={() => setLinkingNodeId(task.id)}
                        onEndLink={() => handleConnect(task.id)}
                    />
                ))}
            </motion.div>
        </div>
        <AnimatePresence>
            {isModalOpen && (
                <QuestModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    initialCategory="ROADMAP"
                    categories={[]} 
                    userId={userId}
                    existingTasks={tasks} // Pass full list for linking
                />
            )}
        </AnimatePresence>
        <div className="absolute bottom-6 left-6 pointer-events-none">
            <h3 className="text-red-500 font-display text-4xl font-bold opacity-50 tracking-widest">ROADMAP EDITOR</h3>
            <p className="text-gray-500 font-mono text-xs">DOUBLE CLICK TO SPAWN NODE // DRAG HANDLE TO LINK</p>
        </div>
    </div>
  );
};

const NodeCard = ({ task, scale, onDragEnd, onStartLink, onEndLink }: { task: Task, scale: number, onDragEnd: (x: number, y: number) => void, onStartLink: () => void, onEndLink: () => void }) => {
    const x = task.x || 100;
    const y = task.y || 100;
    const styleData = ICON_DATA[task.icon_key || 'DEFAULT'] || ICON_DATA.DEFAULT;
    const Icon = styleData.icon;
    const gradient = styleData.gradient; // 'from-blue-400 to-yellow-400' etc
    
    const totalSub = task.subtasks?.length || 0;
    const doneSub = task.subtasks?.filter(s => s.completed).length || 0;
    const progress = totalSub > 0 ? (doneSub / totalSub) * 100 : (task.completed ? 100 : 0);

    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ x, y, opacity: 0, scale: 0.8 }}
            animate={{ x, y, opacity: 1, scale: 1 }}
            onDragEnd={(_, info) => onDragEnd(x + info.offset.x, y + info.offset.y)}
            onMouseUp={() => onEndLink()}
            className={`
                absolute w-[200px] min-h-[90px] rounded-xl flex flex-col justify-between
                backdrop-blur-xl shadow-2xl group overflow-hidden border
                transition-colors duration-500
            `}
            style={{ 
                cursor: 'grab',
                borderColor: task.completed ? styleData.color : 'rgba(255,255,255,0.1)',
                backgroundColor: task.completed ? 'rgba(0,0,0,0.8)' : 'rgba(5,5,5,0.9)',
                boxShadow: task.completed ? `0 0 30px ${styleData.color}40` : '0 10px 30px rgba(0,0,0,0.5)'
            }}
        >
            {/* Header Gradient Strip */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} opacity-50`} />
            
            {/* Input Node */}
            <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-700 border border-black z-50 hover:bg-white transition-colors" title="Input" />

            <div className="p-4 relative z-10 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                     <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded">
                        {task.temple_id}
                     </span>
                     {task.linked_asset_id && <span className="text-[10px] text-gray-400" title="Linked">🔗</span>}
                </div>

                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${gradient} text-black shadow-lg`}>
                        <div className="w-4 h-4">{Icon}</div>
                    </div>
                    <span className={`font-display font-bold leading-tight text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                        {task.title}
                    </span>
                </div>
                
                {/* Subtask Mini Bar */}
                {totalSub > 0 && (
                    <div className="w-full h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${gradient}`} style={{ width: `${progress}%` }} />
                    </div>
                )}
            </div>

            {/* Output Node */}
            <div 
                className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-600 border border-black cursor-crosshair z-50 hover:scale-150 transition-transform shadow-[0_0_10px_#ef4444]"
                onMouseDown={(e) => { e.stopPropagation(); onStartLink(); }}
                title="Drag to Link"
            />
        </motion.div>
    );
};

export default RoadmapEditor;
