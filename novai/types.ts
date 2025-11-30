
export type Complexity = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export type Category = 'Fitness' | 'Skills' | 'Business' | 'Family' | 'Finance' | 'Wellness';

export type SkillDomain = 'mind' | 'communication' | 'creative';

// Matches 'profiles' table
export interface UserProfile {
  id?: string;
  name: string;
  level: number;
  xp: number;
  rank: string;
  streak: number;
  title: string;
  avatarState: 'idle' | 'combat' | 'levelUp';
  avatarUrl?: string; // Custom uploaded photo base64 or url
  height: number;
  weight: number;
  age: number;
  gender: string;
  goals?: string[];
  bio?: string;
  // JSONB fields in DB mapped here
  stats: Record<string, number>; 
}

export interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  xpReward: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'On Hold' | 'Completed';
  deadline?: string;
  tags: string[];
  xpBonus: number;
  milestones: Milestone[]; // Key checkpoints
  createdAt: number;
}

// Matches 'tasks' table with 'details' JSONB
export interface Task {
  id: string;
  user_id?: string;
  projectId?: string; // Links task to a Project
  title: string;
  category: Category;
  complexity: Complexity;
  xpReward: number; // Mapped from 'xp'
  isCompleted: boolean; // Mapped from 'done'
  dueDate?: string;
  description?: string; // Mapped from 'note'
  // 'details' JSONB content
  subtasks: { id: string; title: string; completed: boolean }[];
  tags?: string[];
  createdAt: number;
}

export interface SubVenture {
  id: string;
  name: string;
  status: 'Planned' | 'Active' | 'Done';
}

export interface BusinessVenture {
  id: string;
  name: string;
  type: 'Digital' | 'Service' | 'Trading' | 'Venue';
  revenue: number;
  status: 'Idea' | 'Setup' | 'Active' | 'Scaling';
  efficiency: number; 
  subVentures: SubVenture[];
}

export interface SkillTechnique {
  id: string;
  name: string;
  acquired: boolean;
}

export interface SkillNode {
  id: string;
  domain: SkillDomain;
  name: string;
  level: number; 
  mastery: number; 
  rank: Complexity;
  techniques: SkillTechnique[];
}

// Matches 'gamification' table structure for deep stats
export interface DeepStats {
  fitness: {
    strength: { upper: number; lower: number; core: number; grip: number; functional: number };
    muscle: { mass_score: number; symmetry: number; weak_points: string[] };
    aesthetics: { face: number; vascularity: number; posture: number; appeal: number };
    bodyFat: number;
  };
  skills: {
    mind: SkillNode[];
    communication: SkillNode[];
    creative: SkillNode[];
  };
  business: BusinessVenture[];
  finance: FinanceStats;
  wellness: WellnessStats;
}

export interface FinanceStats {
  monthlyIncome: number;
  savingsRate: number;
  emergencyFundMonths: number;
  portfolioValue: number;
  debt: number;
}

export interface WellnessStats {
  sleepAvg: number;
  waterIntake: number;
  mentalClarity: number;
  skinHealth: number;
}

export interface AppState {
  user: UserProfile;
  tasks: Task[];
  projects: Project[]; 
  deepStats: DeepStats; 
}

export interface PhysiqueAnalysis {
  rank: string; 
  estimatedBodyFat: string;
  muscleSymmetry: string; 
  aestheticsScore: number; 
  potentialClass: string; 
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string[];
}

export interface AnalysisReport {
  hunterClass: string; 
  summary: string;
  vitalStatus: { status: 'Optimal' | 'Stable' | 'Critical' | 'Fatigued'; message: string };
  keyStrengths: string[];
  weaknesses: string[];
  recommendedFocus: string; 
  tacticalAdvice: string[]; 
  projectedRankUp: string; 
  physiqueAnalysis?: PhysiqueAnalysis;
}

export const XP_THRESHOLDS: Record<Complexity, number> = {
  E: 10, D: 25, C: 50, B: 100, A: 250, S: 500, SS: 1000, SSS: 5000
};
