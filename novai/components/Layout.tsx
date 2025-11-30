
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Activity, PieChart, Users, Briefcase, Heart, Brain, FolderKanban, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-void text-gray-100 font-sans selection:bg-accent selection:text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary opacity-10 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent opacity-10 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 pb-24 md:pb-0 md:pl-24 pt-4 px-4 max-w-7xl mx-auto min-h-screen flex flex-col">
        {children}
      </div>

      <NavBar />
    </div>
  );
};

const NavBar = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, path: '/', label: 'Base' },
    { icon: Activity, path: '/category/Fitness', label: 'Fit' },
    { icon: FolderKanban, path: '/projects', label: 'Projects' },
    { icon: Brain, path: '/category/Skills', label: 'Skill' },
    { icon: Briefcase, path: '/category/Business', label: 'Biz' },
    { icon: PieChart, path: '/analytics', label: 'Data' },
    { icon: User, path: '/profile', label: 'ID' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full md:w-20 md:h-full md:flex-col glass-panel z-50 border-t md:border-t-0 md:border-r border-glassBorder flex justify-around items-center py-4 md:py-8">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.path} to={item.path} className="relative group p-2">
            {isActive && (
              <motion.div
                layoutId="navGlow"
                className="absolute inset-0 bg-primary/20 blur-md rounded-full"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <item.icon
              size={24}
              className={`transition-colors duration-300 relative z-10 ${
                isActive ? 'text-accent drop-shadow-[0_0_8px_rgba(255,45,149,0.8)]' : 'text-gray-400 group-hover:text-gray-200'
              }`}
            />
            <span className="sr-only">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
