
import React from 'react';
import { useApp } from '../App';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { CATEGORY_COLORS } from '../constants';
import { FolderCheck } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { state } = useApp();

  const radarData = Object.keys(state.user.stats).map(key => ({
    subject: key,
    A: state.user.stats[key as keyof typeof state.user.stats],
    fullMark: 100,
  }));

  const tasksPerCategory = Object.keys(state.user.stats).map(key => ({
    name: key,
    completed: state.tasks.filter(t => t.category === key && t.isCompleted).length,
    pending: state.tasks.filter(t => t.category === key && !t.isCompleted).length,
  }));

  const completedProjects = state.projects?.filter(p => p.status === 'Completed').length || 0;
  const activeProjects = state.projects?.filter(p => p.status === 'Active').length || 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-display font-bold">System Analytics</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Radar Chart: Balance */}
        <div className="glass-panel p-6 rounded-2xl h-[400px]">
          <h3 className="text-lg font-bold mb-4 text-center">Life Balance Matrix</h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 20]} stroke="transparent" />
              <Radar
                name="Stats"
                dataKey="A"
                stroke="#FF2D95"
                strokeWidth={3}
                fill="#5B21B6"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Task Distribution */}
        <div className="glass-panel p-6 rounded-2xl h-[400px]">
          <h3 className="text-lg font-bold mb-4 text-center">Quest Completion</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tasksPerCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F0D13', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
              <Bar dataKey="pending" fill="#333" radius={[4, 4, 0, 0]} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-lg font-bold mb-4">Hunter Records</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-accent">{state.tasks.filter(t => t.isCompleted).length}</div>
                <div className="text-xs text-gray-500 uppercase">Quests Completed</div>
            </div>
             <div className="p-4 bg-white/5 rounded-xl border border-primary/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-2 text-2xl font-bold text-primaryLight">
                        {completedProjects} <FolderCheck size={20} />
                    </div>
                    <div className="text-xs text-gray-500 uppercase mt-1">Projects Completed</div>
                    <div className="text-[10px] text-gray-600 mt-1">{activeProjects} Active</div>
                </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-yellow-500">{(state.tasks.length * 12.5).toFixed(0)}</div>
                <div className="text-xs text-gray-500 uppercase">Est. Hours</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-blue-500">Top 5%</div>
                <div className="text-xs text-gray-500 uppercase">Global Ranking</div>
            </div>
        </div>
      </div>
    </div>
  );
};
