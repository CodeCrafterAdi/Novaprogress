
import { AppState } from './types';

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

// Progression System Definitions
export const RANK_SYSTEM = [
  { minLevel: 100, rank: 'National Level', title: 'Shadow Monarch' },
  { minLevel: 80, rank: 'S-Rank', title: 'S-Class Hunter' },
  { minLevel: 60, rank: 'A-Rank', title: 'High Ranker' },
  { minLevel: 40, rank: 'B-Rank', title: 'Guild Master' },
  { minLevel: 20, rank: 'C-Rank', title: 'Veteran Hunter' },
  { minLevel: 10, rank: 'D-Rank', title: 'Rookie' },
  { minLevel: 1, rank: 'E-Rank', title: 'Novice' }
];

export const INITIAL_STATE: AppState = {
  user: {
    name: "Player",
    level: 1,
    xp: 0,
    rank: "E-Rank",
    streak: 0,
    title: "Novice",
    avatarState: 'idle',
    height: 0,
    weight: 0,
    age: 0,
    gender: 'Male',
    bio: 'The system has initialized. Awaiting user input.',
    goals: [],
    stats: {
        Fitness: 1,
        Skills: 1,
        Business: 1,
        Family: 1,
        Finance: 1,
        Wellness: 1
    }
  },
  projects: [], // Clean slate
  deepStats: {
      fitness: {
        strength: { upper: 0, lower: 0, core: 0, grip: 0, functional: 0 },
        muscle: { mass_score: 0, symmetry: 0, weak_points: [] },
        aesthetics: { face: 0, vascularity: 0, posture: 0, appeal: 0 },
        bodyFat: 0
      },
      skills: {
        mind: [],
        communication: [],
        creative: []
      },
      business: [],
      finance: {
        monthlyIncome: 0,
        savingsRate: 0,
        emergencyFundMonths: 0,
        portfolioValue: 0,
        debt: 0
      },
      wellness: {
        sleepAvg: 0,
        waterIntake: 0,
        mentalClarity: 0,
        skinHealth: 0
      }
  },
  tasks: [] // Clean slate - user must create tasks
};

export const CATEGORY_COLORS: Record<string, string> = {
  Fitness: '#ef4444', 
  Skills: '#3b82f6', 
  Business: '#eab308',
  Family: '#10b981', 
  Finance: '#8b5cf6', 
  Wellness: '#ec4899',
};
