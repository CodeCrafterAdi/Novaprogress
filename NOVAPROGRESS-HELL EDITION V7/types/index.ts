
export type UserLevel = {
  level: number;
  xp: number;
  max_xp: number;
  rank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';
};

// Relaxed to string to allow custom user categories
export type TempleType = string;

export type Complexity = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface Category {
  id: string;
  label: string;
  icon: string | React.ReactNode;
  color: string;
  isCustom?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  created_at: string;
  title: string;
  description?: string;
  temple_id: TempleType;
  complexity: Complexity;
  xp_value: number;
  due_date?: string;
  completed: boolean;
  subtasks: Subtask[]; // stored as JSONB in Supabase
  link?: string;
  user_id: string;
  
  // Visual coordinates for Roadmap/Node Editor
  x?: number;
  y?: number;
  
  // Roadmap specific
  connections?: string[]; // Array of IDs this node points TO
  linked_asset_id?: string; // ID of a task in another category this node represents/depends on
  icon_key?: string; // Specific icon selection
}

export interface Post {
  id: string;
  content: string;
  created_at: string;
  ai_analysis?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  avatar_url?: string;
  username: string;
  height: string;
  weight: string;
  age: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string;
  bio: string;
  posts?: Post[]; // Array of journal entries
  stats?: any;
  api_key?: string; // Local storage for Gemini Key
  ai_credits?: number;
  is_premium?: boolean; // $299 Lifetime Access
}
