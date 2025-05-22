
import { supabase } from '@/integrations/supabase/client';
import { Player, Game, Goal, Transaction, User } from '@/types';

// Player Service
export const getPlayers = async (): Promise<Player[]> => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
  
  return data as Player[];
};

export const getPlayer = async (id: string): Promise<Player | null> => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching player:', error);
    return null;
  }
  
  return data as Player;
};

export const createPlayer = async (player: Omit<Player, 'id'>): Promise<Player> => {
  const { data, error } = await supabase
    .from('players')
    .insert([player])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating player:', error);
    throw error;
  }
  
  return data as Player;
};

export const updatePlayer = async (id: string, updates: Partial<Player>): Promise<Player | null> => {
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating player:', error);
    return null;
  }
  
  return data as Player;
};

export const deletePlayer = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting player:', error);
    return false;
  }
  
  return true;
};

// Game Service
export const getGames = async (): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
  
  return data as Game[];
};

export const getGame = async (id: string): Promise<Game | null> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching game:', error);
    return null;
  }
  
  return data as Game;
};

export const createGame = async (game: Omit<Game, 'id'>): Promise<Game> => {
  const { data, error } = await supabase
    .from('games')
    .insert([game])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating game:', error);
    throw error;
  }
  
  return data as Game;
};

export const updateGame = async (id: string, updates: Partial<Game>): Promise<Game | null> => {
  const { data, error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating game:', error);
    return null;
  }
  
  return data as Game;
};

export const deleteGame = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting game:', error);
    return false;
  }
  
  return true;
};

// Goal Service
export const getGoals = async (): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*');
  
  if (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
  
  return data as Goal[];
};

export const getGoalsByGame = async (gameId: string): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*, players(*)')
    .eq('game_id', gameId);
  
  if (error) {
    console.error('Error fetching goals by game:', error);
    throw error;
  }
  
  return data as Goal[];
};

export const getGoalsByPlayer = async (playerId: string): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*, games(*)')
    .eq('player_id', playerId);
  
  if (error) {
    console.error('Error fetching goals by player:', error);
    throw error;
  }
  
  return data as Goal[];
};

export const createGoal = async (goal: Omit<Goal, 'id'>): Promise<Goal> => {
  // Check if a goal for this game and player already exists
  const { data: existingGoal } = await supabase
    .from('goals')
    .select('*')
    .eq('game_id', goal.gameId)
    .eq('player_id', goal.playerId)
    .single();
  
  if (existingGoal) {
    // Update the existing goal
    const { data, error } = await supabase
      .from('goals')
      .update({ count: existingGoal.count + goal.count })
      .eq('id', existingGoal.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating existing goal:', error);
      throw error;
    }
    
    return data as Goal;
  } else {
    // Create a new goal
    const { data, error } = await supabase
      .from('goals')
      .insert([goal])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
    
    return data as Goal;
  }
};

export const updateGoal = async (id: string, updates: Partial<Goal>): Promise<Goal | null> => {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating goal:', error);
    return null;
  }
  
  return data as Goal;
};

export const deleteGoal = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting goal:', error);
    return false;
  }
  
  return true;
};

// Transaction Service
export const getTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
  
  return data as Transaction[];
};

export const getTotalBalance = async (): Promise<number> => {
  const { data, error } = await supabase.from('transactions').select('*');
  
  if (error) {
    console.error('Error calculating balance:', error);
    throw error;
  }
  
  return data.reduce((acc, transaction) => {
    if (transaction.type === 'entrada') {
      return acc + transaction.amount;
    } else {
      return acc - transaction.amount;
    }
  }, 0);
};

export const createTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
  
  return data as Transaction;
};

export const clearTransactions = async (): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .not('id', 'is', null);
  
  if (error) {
    console.error('Error clearing transactions:', error);
    throw error;
  }
};

// Top Scorers and Statistics
export const getTopScorers = async (
  period?: { start: string; end: string },
  gameType?: string
): Promise<Array<{ player: Player; goals: number }>> => {
  let query = supabase
    .from('goals')
    .select(`
      count,
      player_id,
      players!inner(*),
      games!inner(*)
    `);
  
  if (period) {
    query = query.gte('games.date', period.start).lte('games.date', period.end);
  }
  
  if (gameType) {
    query = query.eq('games.type', gameType);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching top scorers:', error);
    throw error;
  }
  
  // Group by player and sum goals
  const playerGoals: Record<string, { player: Player; goals: number }> = {};
  
  data.forEach((item: any) => {
    const playerId = item.player_id;
    const count = item.count;
    const player = item.players as Player;
    
    if (!playerGoals[playerId]) {
      playerGoals[playerId] = { player, goals: 0 };
    }
    
    playerGoals[playerId].goals += count;
  });
  
  return Object.values(playerGoals).sort((a, b) => b.goals - a.goals);
};

// User Profile Service
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    avatar: data.avatar
  };
};

export const getPendingUsers = async (): Promise<User[]> => {
  // In a real Supabase setup, we would need to query auth.users through a function
  // For now we'll just return an empty array as this will be implemented later
  return [];
};

// Team Generation
export const generateBalancedTeams = async (playerIds: string[], numTeams: number = 4): Promise<Player[][]> => {
  // Get selected players
  const { data: selectedPlayers, error } = await supabase
    .from('players')
    .select('*')
    .in('id', playerIds);
  
  if (error) {
    console.error('Error fetching players for team generation:', error);
    throw error;
  }
  
  if (selectedPlayers.length < numTeams) {
    return [];
  }
  
  // Initialize teams
  const teams: Player[][] = Array.from({ length: numTeams }, () => []);
  
  // First, distribute defenders to ensure each team has at least one
  const defenders = selectedPlayers.filter(p => p.position === 'defensor');
  defenders.forEach((defender, index) => {
    if (index < numTeams) {
      teams[index % numTeams].push(defender);
    }
  });
  
  // Remove assigned defenders from the pool
  const assignedDefenders = defenders.slice(0, numTeams);
  let remainingPlayers = selectedPlayers.filter(
    p => !assignedDefenders.some(d => d.id === p.id)
  );
  
  // Segregate players who don't run
  const nonRunners = remainingPlayers.filter(p => p.running === 'nao');
  remainingPlayers = remainingPlayers.filter(p => p.running !== 'nao');
  
  // Sort remaining players by rating (high to low)
  remainingPlayers.sort((a, b) => b.rating - a.rating);
  
  // Distribute non-runners across teams (at most 1 per team if possible)
  nonRunners.forEach((player, index) => {
    teams[index % numTeams].push(player);
  });
  
  // Use snake draft to distribute the rest to balance team strength
  // Order: Team 0 -> 1 -> 2 -> 3 -> 3 -> 2 -> 1 -> 0 -> 0 -> ...
  let direction = 1;
  let currentTeam = 0;
  
  remainingPlayers.forEach(player => {
    teams[currentTeam].push(player);
    
    currentTeam += direction;
    if (currentTeam === numTeams) {
      direction = -1;
      currentTeam = numTeams - 1;
    } else if (currentTeam < 0) {
      direction = 1;
      currentTeam = 0;
    }
  });
  
  return teams;
};
