
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { AppState, Task, UserProfile, XP_THRESHOLDS, DeepStats, BusinessVenture, SkillNode, Project } from '../types';
import { INITIAL_STATE, RANK_SYSTEM } from '../constants';

// FIXED: Define separate cache keys. The original key is now for the 'online' simulation.
const ONLINE_CACHE_KEY = 'nova_app_state_v6';
const OFFLINE_CACHE_KEY = 'nova_app_state_v6_offline';

export function useGameData(session: any | null) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(!isSupabaseConfigured());
  const [dbError, setDbError] = useState<string | null>(null);

  // FIXED: This effect now handles loading data from the correct cache (online or offline)
  // both on initial app load and when the user switches simulation modes.
  useEffect(() => {
    setLoading(true);
    // Determine which cache to use based on the current mode.
    const key = isOfflineMode ? OFFLINE_CACHE_KEY : ONLINE_CACHE_KEY;
    const cached = localStorage.getItem(key);
    
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setState({
            ...INITIAL_STATE,
            ...parsed,
            user: { ...INITIAL_STATE.user, ...parsed.user },
            deepStats: { ...INITIAL_STATE.deepStats, ...parsed.deepStats }
        });
      } catch (e) {
        console.error("Cache parse failed, resetting state for this mode.", e);
        setState(INITIAL_STATE); // Reset on corrupt cache
      }
    } else {
        // If no cache exists for the current mode, start with a fresh state.
        setState(INITIAL_STATE);
    }

    // Allow state to settle before marking loading as complete
    setTimeout(() => setLoading(false), 150);
  }, [isOfflineMode]); // This effect re-runs whenever the simulation mode changes.

  // FIXED: This effect persists state changes to the correct cache (online/offline)
  // and prevents overwriting an existing cache with a blank state during the loading phase.
  useEffect(() => {
    if (loading) return; // Prevent saving default state over existing cache on load/switch.
    const key = isOfflineMode ? OFFLINE_CACHE_KEY : ONLINE_CACHE_KEY;
    localStorage.setItem(key, JSON.stringify(state));
  }, [state, isOfflineMode, loading]); // Depends on state, mode, and loading status.


  // 3. Fetch Data from Supabase
  const fetchData = useCallback(async () => {
    if (isOfflineMode || !session?.user?.id || !supabase) {
        return;
    }

    setLoading(true);
    setDbError(null);
    
    try {
      const userId = session.user.id;
      
      let results = await Promise.allSettled([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('gamification').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('projects').select('*').eq('user_id', userId),
        supabase.from('skill_levels').select('*').eq('user_id', userId),
        supabase.from('business_fields').select('*').eq('user_id', userId),
        supabase.from('fitness_metrics').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('user_snapshots').select('*').eq('user_id', userId)
      ]);

      // Helper to extract data or default
      const getVal = (index: number, def: any) => {
          const res = results[index];
          if (res.status === 'fulfilled' && !res.value.error) {
              return res.value.data || def;
          }
          if (res.status === 'fulfilled' && res.value.error) {
              console.warn(`Fetch error for index ${index}:`, res.value.error.message);
              if (res.value.error.message.includes('relation') || res.value.error.code === '42P01') {
                  setDbError("Database tables missing. Please run the SQL setup script.");
              }
          }
          return def;
      };

      // --- Refactored Profile & Gamification Handling ---
      let profileData: any;
      let gamificationData: any;
      let isNewUser = false;
      const profileResult = results[0];

      if (profileResult.status === 'fulfilled' && profileResult.value.error) {
          console.warn(`Fetch error for profile:`, profileResult.value.error.message);
          if (profileResult.value.error.message.includes('relation') || profileResult.value.error.code === '42P01') {
              setDbError("Database tables missing. Please run the SQL setup script.");
              setLoading(false);
              return; // Critical error, stop execution.
          }
      }

      profileData = profileResult.status === 'fulfilled' ? profileResult.value.data : null;

      if (!profileData) {
          console.log("No profile found for user, creating one.");
          isNewUser = true;

          const emailName = session.user.email ? session.user.email.split('@')[0] : 'Player';
          const newProfilePayload = {
              id: userId,
              name: emailName,
              stats: INITIAL_STATE.user.stats,
              title: INITIAL_STATE.user.title,
              height: INITIAL_STATE.user.height,
              weight: INITIAL_STATE.user.weight,
              age: INITIAL_STATE.user.age,
              gender: INITIAL_STATE.user.gender,
              bio: INITIAL_STATE.user.bio,
              goals: INITIAL_STATE.user.goals,
          };
          
          const { data: insertedProfile, error: insertError } = await supabase
            .from('profiles').insert(newProfilePayload).select().single();

          if (insertError) {
              console.error('Failed to create profile:', insertError);
              setDbError("Failed to initialize user profile.");
              setLoading(false);
              return;
          }
          profileData = insertedProfile;

          // Also initialize gamification stats for the new user
          gamificationData = {
              level: INITIAL_STATE.user.level,
              rank: INITIAL_STATE.user.rank,
              streak_days: INITIAL_STATE.user.streak,
              progress_to_next: INITIAL_STATE.user.xp,
          };
          const { error: gamificationError } = await supabase
            .from('gamification').insert({ ...gamificationData, user_id: userId });
          
          if (gamificationError) {
              console.warn('Failed to create gamification entry:', gamificationError);
          }
      } else {
          gamificationData = getVal(1, {});
      }
      
      // --- MAPPING LOGIC ---
      const tasksDB = getVal(2, []);
      const projectsDB = getVal(3, []);
      const skillsDB = getVal(4, []);
      const bizDB = getVal(5, []);
      const fitData = getVal(6, {});
      const snapshots = getVal(7, []);
      
      const emailName = session.user.email ? session.user.email.split('@')[0] : 'Player';
      
      const user: UserProfile = {
        ...state.user,
        name: profileData.name || (state.user.name === 'Player' ? emailName : state.user.name),
        title: profileData.title || state.user.title,
        height: profileData.height || state.user.height,
        weight: profileData.weight || state.user.weight,
        age: profileData.age || state.user.age,
        gender: profileData.gender || state.user.gender,
        goals: profileData.goals || state.user.goals,
        bio: profileData.bio || state.user.bio,
        avatarUrl: profileData.avatar_url || state.user.avatarUrl,
        level: gamificationData.level || state.user.level || 1,
        xp: gamificationData.progress_to_next || state.user.xp || 0,
        rank: gamificationData.rank || state.user.rank || 'E-Rank',
        streak: gamificationData.streak_days || state.user.streak || 0,
        stats: profileData.stats || state.user.stats,
      };

      const tasks: Task[] = tasksDB.map((t: any) => ({
        id: t.id,
        user_id: t.user_id,
        projectId: t.project_id,
        title: t.title,
        category: t.category,
        complexity: t.complexity,
        xpReward: t.xp || XP_THRESHOLDS[t.complexity as any] || 10,
        isCompleted: t.done,
        description: t.note,
        dueDate: t.details?.dueDate,
        subtasks: t.details?.subtasks || [],
        tags: t.tags || [],
        createdAt: new Date(t.created_at).getTime()
      }));

      const projects: Project[] = projectsDB.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          status: p.status,
          xpBonus: p.xp_bonus,
          tags: p.tags,
          deadline: p.deadline,
          milestones: p.milestones || [], 
          createdAt: new Date(p.created_at).getTime()
      }));

      const skillsTree = {
          mind: skillsDB.filter((s:any) => s.domain === 'mind').map(mapSkillDB),
          communication: skillsDB.filter((s:any) => s.domain === 'communication').map(mapSkillDB),
          creative: skillsDB.filter((s:any) => s.domain === 'creative').map(mapSkillDB),
      };

      const business = bizDB.map((b:any) => ({
          id: b.id,
          name: b.name,
          type: b.type,
          status: b.status,
          revenue: b.revenue,
          efficiency: b.efficiency,
          subVentures: b.sub_ventures || []
      }));

      const fitness = {
          strength: fitData.strength || INITIAL_STATE.deepStats.fitness.strength,
          muscle: fitData.muscle || INITIAL_STATE.deepStats.fitness.muscle,
          aesthetics: fitData.aesthetics || INITIAL_STATE.deepStats.fitness.aesthetics,
          bodyFat: fitData.body_fat || 0
      };

      const financeSnap = snapshots.find((s:any) => s.category === 'Finance')?.data;
      const wellnessSnap = snapshots.find((s:any) => s.category === 'Wellness')?.data;

      const deepStats: DeepStats = {
          fitness,
          skills: skillsTree,
          business,
          finance: financeSnap || INITIAL_STATE.deepStats.finance,
          wellness: wellnessSnap || INITIAL_STATE.deepStats.wellness,
      };

      // Only update state if we actually got some data back (prevent wiping local state with empty DB on first load)
      if (tasks.length > 0 || projects.length > 0 || skillsDB.length > 0 || isNewUser) {
           setState({ user, tasks, deepStats, projects });
      } else if (user.name !== 'Player') {
           // We got a profile (or a mapped email name), so we can trust the state
           setState(prev => ({ ...prev, user, deepStats }));
      }
      
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
        setLoading(false);
    }
  }, [session, isOfflineMode]);

  useEffect(() => {
    if (!isOfflineMode && session) {
        fetchData();
    }
  }, [session, isOfflineMode, fetchData]);

  const toggleOfflineMode = () => {
    setIsOfflineMode(prev => !prev);
  };

  // --- ACTIONS (Write to Supabase) ---
  // All actions perform optimistic updates first, then try DB.

  const completeAllTasks = async (): Promise<string> => {
    const incompleteTasks = state.tasks.filter(t => !t.isCompleted);
    if (incompleteTasks.length === 0) {
      return "No pending tasks to complete.";
    }

    let totalXpGained = 0;
    const newStats = { ...state.user.stats };
    
    incompleteTasks.forEach(task => {
      totalXpGained += task.xpReward;
      newStats[task.category] = (newStats[task.category] || 1) + 1;
    });

    const newXp = state.user.xp + totalXpGained;
    const newLevel = Math.floor(newXp / 1000) + 1;
    const rankObj = RANK_SYSTEM.find(r => newLevel >= r.minLevel) || RANK_SYSTEM[RANK_SYSTEM.length - 1];
    const newRank = rankObj.rank;
    const newTitle = rankObj.title;
    const newStreak = state.user.streak + incompleteTasks.length; 

    const completedTaskIds = incompleteTasks.map(t => t.id);
    
    // Optimistic UI Update
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        xp: newXp,
        level: newLevel,
        rank: newRank,
        title: newTitle,
        streak: newStreak,
        stats: newStats
      },
      tasks: prev.tasks.map(t => completedTaskIds.includes(t.id) ? { ...t, isCompleted: true } : t)
    }));

    // DB Sync
    if (!isOfflineMode && session && supabase) {
      try {
        await supabase.from('tasks').update({ done: true, updated_at: new Date().toISOString() }).in('id', completedTaskIds);
        await supabase.from('gamification').upsert({ 
           user_id: session.user.id, 
           level: newLevel, 
           rank: newRank, 
           streak_days: newStreak,
           progress_to_next: newXp,
           last_activity: new Date().toISOString()
        }, { onConflict: 'user_id' });
        await supabase.from('profiles').update({ 
            stats: newStats, 
            title: newTitle 
        }).eq('id', session.user.id);
      } catch(e) {
        console.error("Batch completion sync failed", e);
        return "Local state updated, but failed to sync with the database.";
      }
    }
    
    return `Protocol Executed: ${incompleteTasks.length} tasks completed. +${totalXpGained} XP gained. System synchronized.`;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setState(prev => ({
        ...prev,
        user: { ...prev.user, ...updates }
    }));

    if (!isOfflineMode && session && supabase) {
        try {
            const { name, title, height, weight, age, gender, goals, bio, avatarUrl, stats } = updates;
            const dbPayload: any = { id: session.user.id, updated_at: new Date().toISOString() };
            
            if (name !== undefined) dbPayload.name = name;
            if (title !== undefined) dbPayload.title = title;
            if (height !== undefined) dbPayload.height = height;
            if (weight !== undefined) dbPayload.weight = weight;
            if (age !== undefined) dbPayload.age = age;
            if (gender !== undefined) dbPayload.gender = gender;
            if (goals !== undefined) dbPayload.goals = goals;
            if (bio !== undefined) dbPayload.bio = bio;
            if (avatarUrl !== undefined) dbPayload.avatar_url = avatarUrl;
            if (stats !== undefined) dbPayload.stats = stats;
            
            const { error } = await supabase.from('profiles').upsert(dbPayload, { onConflict: 'id' });
            if (error) throw error;
        } catch (e) {
            console.error("Failed to sync profile:", e);
        }
    }
  };

  const addTask = async (task: Task) => {
    setState(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));

    if (!isOfflineMode && session && supabase) {
      try {
        await supabase.from('tasks').upsert({
            id: task.id,
            user_id: session.user.id,
            project_id: task.projectId,
            title: task.title,
            category: task.category,
            complexity: task.complexity,
            xp: task.xpReward,
            done: task.isCompleted,
            note: task.description,
            details: { subtasks: task.subtasks, dueDate: task.dueDate },
            tags: task.tags,
            created_at: new Date(task.createdAt).toISOString()
        });
      } catch (e) { console.error("Task sync failed", e); }
    }
  };

  const updateTask = async (task: Task) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === task.id ? task : t)
    }));

    if (!isOfflineMode && session && supabase) {
      try {
          await supabase.from('tasks').update({
            title: task.title,
            project_id: task.projectId,
            category: task.category,
            complexity: task.complexity,
            xp: task.xpReward,
            done: task.isCompleted,
            note: task.description,
            details: { subtasks: task.subtasks, dueDate: task.dueDate },
            updated_at: new Date().toISOString()
          }).eq('id', task.id);
      } catch (e) { console.error("Task update failed", e); }
    }
  };

  const toggleTaskCompletion = async (taskId: string, isCompleted: boolean, newXp: number, newLevel: number, newRank: string, newTitle: string, newStreak: number, newStats: any) => {
    // Optimistic UI Update
    setState(prev => ({
      ...prev,
      user: { 
          ...prev.user, 
          xp: newXp, 
          level: newLevel, 
          rank: newRank, 
          title: newTitle, 
          streak: newStreak, 
          stats: newStats 
      },
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, isCompleted } : t)
    }));

    if (!isOfflineMode && session && supabase) {
      try {
        await Promise.all([
          supabase.from('tasks').update({ done: isCompleted }).eq('id', taskId),
          supabase.from('gamification').upsert({ 
             user_id: session.user.id, 
             level: newLevel, 
             rank: newRank, 
             streak_days: newStreak,
             progress_to_next: newXp,
             last_activity: new Date().toISOString()
          }, { onConflict: 'user_id' }),
          supabase.from('profiles').update({ 
              stats: newStats, 
              title: newTitle 
          }).eq('id', session.user.id)
        ]);
      } catch(e) { console.error("Completion sync failed", e); }
    }
  };

  const deleteTask = async (taskId: string) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
    if (!isOfflineMode && session && supabase) {
      try {
        await supabase.from('tasks').delete().eq('id', taskId);
      } catch(e) { console.error("Delete failed", e); }
    }
  };

  const updateProject = async (project: Project, isDelete: boolean = false) => {
      setState(prev => {
          if (isDelete) return { ...prev, projects: prev.projects.filter(p => p.id !== project.id) };
          const exists = prev.projects.find(p => p.id === project.id);
          const newProjects = exists 
            ? prev.projects.map(p => p.id === project.id ? project : p)
            : [project, ...prev.projects];
          return { ...prev, projects: newProjects };
      });

      if (!isOfflineMode && session && supabase) {
          try {
              if (isDelete) {
                  await supabase.from('projects').delete().eq('id', project.id);
              } else {
                  await supabase.from('projects').upsert({
                      id: project.id,
                      user_id: session.user.id,
                      title: project.title,
                      description: project.description,
                      status: project.status,
                      xp_bonus: project.xpBonus,
                      tags: project.tags,
                      deadline: project.deadline,
                      milestones: project.milestones,
                      updated_at: new Date().toISOString()
                  });
              }
          } catch(e) { console.error("Project sync failed", e); }
      }
  };

  const completeMilestone = async (projectId: string, milestoneId: string) => {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;
    
    const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
    if (milestoneIndex === -1) return;
    const milestone = project.milestones[milestoneIndex];
    if (milestone.isCompleted) return; 

    // Calculate Rewards
    const rewardXP = milestone.xpReward || 0;
    const currentXp = state.user.xp;
    const newXp = currentXp + rewardXP;
    const newLevel = Math.floor(newXp / 1000) + 1;
    const rankObj = RANK_SYSTEM.find(r => newLevel >= r.minLevel) || RANK_SYSTEM[RANK_SYSTEM.length - 1];
    
    const updatedMilestones = [...project.milestones];
    updatedMilestones[milestoneIndex] = { ...milestone, isCompleted: true };
    const updatedProject = { ...project, milestones: updatedMilestones };

    setState(prev => ({
        ...prev,
        user: { ...prev.user, xp: newXp, level: newLevel, rank: rankObj.rank, title: rankObj.title },
        projects: prev.projects.map(p => p.id === projectId ? updatedProject : p)
    }));

    if (!isOfflineMode && session && supabase) {
         try {
             await supabase.from('projects').update({ milestones: updatedProject.milestones }).eq('id', updatedProject.id);
             await supabase.from('gamification').update({ level: newLevel, rank: rankObj.rank, progress_to_next: newXp }).eq('user_id', session.user.id);
         } catch(e) { console.error("Milestone sync failed", e); }
    }
  };

  const updateBusiness = async (venture: BusinessVenture, isDelete: boolean = false) => {
    setState(prev => {
        const currentBiz = prev.deepStats.business || [];
        let newBiz;
        if (isDelete) {
            newBiz = currentBiz.filter(b => b.id !== venture.id);
        } else {
            const exists = currentBiz.find(b => b.id === venture.id);
            if (exists) newBiz = currentBiz.map(b => b.id === venture.id ? venture : b);
            else newBiz = [...currentBiz, venture];
        }
        return { ...prev, deepStats: { ...prev.deepStats, business: newBiz } };
    });

    if (!isOfflineMode && session && supabase) {
        try {
            if (isDelete) {
                await supabase.from('business_fields').delete().eq('id', venture.id);
            } else {
                await supabase.from('business_fields').upsert({
                    id: venture.id,
                    user_id: session.user.id,
                    name: venture.name,
                    type: venture.type,
                    status: venture.status,
                    revenue: venture.revenue,
                    efficiency: venture.efficiency,
                    sub_ventures: venture.subVentures,
                    updated_at: new Date().toISOString()
                });
            }
        } catch(e) { console.error("Business sync failed", e); }
    }
  };

  const updateSkill = async (skill: SkillNode, isDelete: boolean = false) => {
    setState(prev => {
        const skills = { ...prev.deepStats.skills };
        const d = skill.domain;
        if(isDelete) {
            skills[d] = skills[d].filter(s => s.id !== skill.id);
        } else {
            const exists = skills[d].find(s => s.id === skill.id);
            if (exists) skills[d] = skills[d].map(s => s.id === skill.id ? skill : s);
            else skills[d] = [...skills[d], skill];
        }
        return { ...prev, deepStats: { ...prev.deepStats, skills } };
    });

    if (!isOfflineMode && session && supabase) {
        try {
            if (isDelete) {
                await supabase.from('skill_levels').delete().eq('id', skill.id);
            } else {
                await supabase.from('skill_levels').upsert({
                    id: skill.id,
                    user_id: session.user.id,
                    domain: skill.domain,
                    name: skill.name,
                    level: skill.level,
                    mastery: skill.mastery,
                    rank: skill.rank,
                    techniques: skill.techniques,
                    updated_at: new Date().toISOString()
                });
            }
        } catch(e) { console.error("Skill sync failed", e); }
    }
  };

  const mapSkillDB = (s: any): SkillNode => ({
      id: s.id,
      domain: s.domain,
      name: s.name,
      level: s.level,
      mastery: s.mastery,
      rank: s.rank,
      techniques: s.techniques || []
  });

  return {
    state,
    loading,
    isOfflineMode,
    dbError,
    setDbError,
    toggleOfflineMode,
    actions: { addTask, updateTask, toggleTaskCompletion, deleteTask, updateBusiness, updateSkill, updateProject, completeMilestone, updateProfile, completeAllTasks }
  };
}
