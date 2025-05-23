
import { supabase } from '@/integrations/supabase/client';
import { Player, Game, Goal, Transaction, User, UserRole, PlayerPosition, RunningAbility, GameType, TransactionType } from '@/types';

/**
 * Funções para autenticação e gerenciamento de usuários
 */

// Registrar um novo usuário
export async function registerUser(email: string, password: string, name: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'viewer' as UserRole,
        }
      }
    });
    
    if (error) throw error;
    
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    throw error;
  }
}

// Fazer login
export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
}

// Fazer logout
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
}

// Verificar se o usuário está logado
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (!data.session) return null;
    
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single();
    
    if (userError) throw userError;
    
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role as UserRole,
      avatar: userData.avatar
    };
  } catch (error) {
    console.error('Erro ao verificar usuário logado:', error);
    return null;
  }
}

// Solicitar redefinição de senha
export async function requestPasswordReset(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/create-password',
    });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    throw error;
  }
}

// Atualizar senha
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    throw error;
  }
}

// Obter usuários pendentes de aprovação
export async function getPendingUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_approved', false);
    
    if (error) throw error;
    
    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      avatar: user.avatar
    }));
  } catch (error) {
    console.error('Erro ao obter usuários pendentes:', error);
    throw error;
  }
}

// Aprovar usuário
export async function approveUser(userId: string, role: UserRole) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true, role })
      .eq('id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Erro ao aprovar usuário:', error);
    throw error;
  }
}

// Rejeitar/remover usuário
export async function rejectUser(userId: string) {
  try {
    // O Supabase não permite deletar usuários da tabela auth.users via API
    // Então nós apenas desativaremos na tabela profiles
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Erro ao rejeitar usuário:', error);
    throw error;
  }
}

/**
 * Funções para gerenciamento de gols
 */

// Obter todos os gols
export async function getAllGoals(): Promise<Goal[]> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*');
    
    if (error) throw error;
    
    return data.map(goal => ({
      id: goal.id,
      gameId: goal.game_id,
      playerId: goal.player_id,
      count: goal.count
    }));
  } catch (error) {
    console.error('Erro ao obter gols:', error);
    return [];
  }
}

// Obter gols com informações do jogador
export async function getGoalsWithPlayerInfo(): Promise<Goal[]> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*, players(*)');
    
    if (error) throw error;
    
    return data.map(goal => ({
      id: goal.id,
      gameId: goal.game_id,
      playerId: goal.player_id,
      count: goal.count,
      player: goal.players ? {
        id: goal.players.id,
        name: goal.players.name,
        position: goal.players.position as PlayerPosition,
        running: goal.players.running as RunningAbility,
        rating: goal.players.rating,
        photo: goal.players.photo
      } : undefined
    }));
  } catch (error) {
    console.error('Erro ao obter gols com informações de jogador:', error);
    return [];
  }
}

// Obter gols com informações do jogo
export async function getGoalsWithGameInfo(): Promise<Goal[]> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*, games(*)');
    
    if (error) throw error;
    
    return data.map(goal => ({
      id: goal.id,
      gameId: goal.game_id,
      playerId: goal.player_id,
      count: goal.count,
      game: goal.games ? {
        id: goal.games.id,
        date: goal.games.date,
        type: goal.games.type as GameType,
        photo: goal.games.photo
      } : undefined
    }));
  } catch (error) {
    console.error('Erro ao obter gols com informações de jogo:', error);
    return [];
  }
}

// Obter gols por jogador
export async function getGoalsByPlayerId(playerId: string): Promise<Goal> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('player_id', playerId)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      gameId: data.game_id,
      playerId: data.player_id,
      count: data.count
    };
  } catch (error) {
    console.error(`Erro ao obter gols do jogador ${playerId}:`, error);
    throw error;
  }
}

// Obter gols por jogo
export async function getGoalsByGameId(gameId: string): Promise<Goal> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('game_id', gameId)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      gameId: data.game_id,
      playerId: data.player_id,
      count: data.count
    };
  } catch (error) {
    console.error(`Erro ao obter gols do jogo ${gameId}:`, error);
    throw error;
  }
}

// Adicionar gol
export async function addGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        game_id: goal.gameId,
        player_id: goal.playerId,
        count: goal.count
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      gameId: data.game_id,
      playerId: data.player_id,
      count: data.count
    };
  } catch (error) {
    console.error('Erro ao adicionar gol:', error);
    throw error;
  }
}

// Atualizar gol
export async function updateGoal(goal: Goal): Promise<Goal> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .update({
        game_id: goal.gameId,
        player_id: goal.playerId,
        count: goal.count
      })
      .eq('id', goal.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      gameId: data.game_id,
      playerId: data.player_id,
      count: data.count
    };
  } catch (error) {
    console.error(`Erro ao atualizar gol ${goal.id}:`, error);
    throw error;
  }
}

// Deletar gol
export async function deleteGoal(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Erro ao deletar gol ${id}:`, error);
    throw error;
  }
}

/**
 * Funções para gerenciamento de jogadores
 */

// Obter todos os jogadores
export async function getAllPlayers(): Promise<Player[]> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data.map(player => ({
      id: player.id,
      name: player.name,
      position: player.position as PlayerPosition,
      running: player.running as RunningAbility,
      rating: player.rating,
      photo: player.photo
    }));
  } catch (error) {
    console.error('Erro ao obter jogadores:', error);
    return [];
  }
}

// Obter jogador por ID
export async function getPlayerById(id: string): Promise<Player | null> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      position: data.position as PlayerPosition,
      running: data.running as RunningAbility,
      rating: data.rating,
      photo: data.photo
    };
  } catch (error) {
    console.error(`Erro ao obter jogador ${id}:`, error);
    return null;
  }
}

// Adicionar jogador
export async function addPlayer(player: Omit<Player, 'id'>): Promise<Player> {
  try {
    const { data, error } = await supabase
      .from('players')
      .insert({
        name: player.name,
        position: player.position,
        running: player.running,
        rating: player.rating,
        photo: player.photo
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      position: data.position as PlayerPosition,
      running: data.running as RunningAbility,
      rating: data.rating,
      photo: data.photo
    };
  } catch (error) {
    console.error('Erro ao adicionar jogador:', error);
    throw error;
  }
}

// Atualizar jogador
export async function updatePlayer(player: Player): Promise<Player> {
  try {
    const { data, error } = await supabase
      .from('players')
      .update({
        name: player.name,
        position: player.position,
        running: player.running,
        rating: player.rating,
        photo: player.photo
      })
      .eq('id', player.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      position: data.position as PlayerPosition,
      running: data.running as RunningAbility,
      rating: data.rating,
      photo: data.photo
    };
  } catch (error) {
    console.error(`Erro ao atualizar jogador ${player.id}:`, error);
    throw error;
  }
}

// Deletar jogador
export async function deletePlayer(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Erro ao deletar jogador ${id}:`, error);
    throw error;
  }
}

/**
 * Funções para gerenciamento de jogos
 */

// Obter todos os jogos
export async function getAllGames(): Promise<Game[]> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(game => ({
      id: game.id,
      date: game.date,
      type: game.type as GameType,
      photo: game.photo
    }));
  } catch (error) {
    console.error('Erro ao obter jogos:', error);
    return [];
  }
}

// Obter jogo por ID
export async function getGameById(id: string): Promise<Game | null> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      date: data.date,
      type: data.type as GameType,
      photo: data.photo
    };
  } catch (error) {
    console.error(`Erro ao obter jogo ${id}:`, error);
    return null;
  }
}

// Adicionar jogo
export async function addGame(game: Omit<Game, 'id'>): Promise<Game> {
  try {
    const { data, error } = await supabase
      .from('games')
      .insert({
        date: game.date,
        type: game.type,
        photo: game.photo
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      date: data.date,
      type: data.type as GameType,
      photo: data.photo
    };
  } catch (error) {
    console.error('Erro ao adicionar jogo:', error);
    throw error;
  }
}

// Atualizar jogo
export async function updateGame(game: Game): Promise<Game> {
  try {
    const { data, error } = await supabase
      .from('games')
      .update({
        date: game.date,
        type: game.type,
        photo: game.photo
      })
      .eq('id', game.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      date: data.date,
      type: data.type as GameType,
      photo: data.photo
    };
  } catch (error) {
    console.error(`Erro ao atualizar jogo ${game.id}:`, error);
    throw error;
  }
}

// Deletar jogo
export async function deleteGame(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Erro ao deletar jogo ${id}:`, error);
    throw error;
  }
}

/**
 * Funções para gerenciamento de transações
 */

// Obter todas as transações
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(transaction => ({
      id: transaction.id,
      date: transaction.date,
      type: transaction.type as TransactionType,
      amount: transaction.amount,
      description: transaction.description
    }));
  } catch (error) {
    console.error('Erro ao obter transações:', error);
    return [];
  }
}

// Obter transação por ID
export async function getTransactionById(id: string): Promise<Transaction | null> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      date: data.date,
      type: data.type as TransactionType,
      amount: data.amount,
      description: data.description
    };
  } catch (error) {
    console.error(`Erro ao obter transação ${id}:`, error);
    return null;
  }
}

// Adicionar transação
export async function addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        date: transaction.date,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      date: data.date,
      type: data.type as TransactionType,
      amount: data.amount,
      description: data.description
    };
  } catch (error) {
    console.error('Erro ao adicionar transação:', error);
    throw error;
  }
}

// Atualizar transação
export async function updateTransaction(transaction: Transaction): Promise<Transaction> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        date: transaction.date,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description
      })
      .eq('id', transaction.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      date: data.date,
      type: data.type as TransactionType,
      amount: data.amount,
      description: data.description
    };
  } catch (error) {
    console.error(`Erro ao atualizar transação ${transaction.id}:`, error);
    throw error;
  }
}

// Deletar transação
export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Erro ao deletar transação ${id}:`, error);
    throw error;
  }
}
