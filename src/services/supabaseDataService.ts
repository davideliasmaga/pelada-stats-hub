
import { supabase } from '@/lib/supabase';
import { Player, Game, Goal, Transaction, PlayerPosition, RunningAbility, GameType, TransactionType } from '@/types';

// Player Service
export const createSupabasePlayer = async (player: Omit<Player, 'id'>) => {
  const { data, error } = await supabase
    .from('players')
    .insert([{
      name: player.name,
      position: player.position,
      running: player.running,
      rating: player.rating,
      photo: player.photo
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating player:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    position: data.position as PlayerPosition,
    running: data.running as RunningAbility,
    rating: data.rating,
    photo: data.photo
  } as Player;
};

export const getSupabasePlayers = async (): Promise<Player[]> => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching players:', error);
    throw error;
  }

  return data.map(player => ({
    id: player.id,
    name: player.name,
    position: player.position as PlayerPosition,
    running: player.running as RunningAbility,
    rating: player.rating,
    photo: player.photo
  }));
};

export const deleteSupabasePlayer = async (id: string): Promise<boolean> => {
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
export const createSupabaseGame = async (game: Omit<Game, 'id'>, playerIds: string[] = []) => {
  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .insert([{
      date: game.date,
      type: game.type,
      players_present: playerIds,
      photo: game.photo
    }])
    .select()
    .single();

  if (gameError) {
    console.error('Error creating game:', gameError);
    throw gameError;
  }

  // Adicionar jogadores presentes na tabela game_players
  if (playerIds.length > 0) {
    const gamePlayerRecords = playerIds.map(playerId => ({
      game_id: gameData.id,
      player_id: playerId
    }));

    const { error: gamePlayersError } = await supabase
      .from('game_players')
      .insert(gamePlayerRecords);

    if (gamePlayersError) {
      console.error('Error adding game players:', gamePlayersError);
    }
  }

  return {
    id: gameData.id,
    date: gameData.date,
    type: gameData.type as GameType,
    photo: gameData.photo
  } as Game;
};

export const getSupabaseGames = async (): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching games:', error);
    throw error;
  }

  return data.map(game => ({
    id: game.id,
    date: game.date,
    type: game.type as GameType,
    photo: game.photo
  }));
};

export const getGamePlayers = async (gameId: string): Promise<Player[]> => {
  const { data, error } = await supabase
    .from('game_players')
    .select(`
      players (
        id,
        name,
        position,
        running,
        rating,
        photo
      )
    `)
    .eq('game_id', gameId);

  if (error) {
    console.error('Error fetching game players:', error);
    throw error;
  }

  return data.map(item => ({
    id: (item.players as any).id,
    name: (item.players as any).name,
    position: (item.players as any).position as PlayerPosition,
    running: (item.players as any).running as RunningAbility,
    rating: (item.players as any).rating,
    photo: (item.players as any).photo
  }));
};

// Transaction Service
export const createSupabaseTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      date: transaction.date,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }

  return {
    id: data.id,
    date: data.date,
    type: data.type as TransactionType,
    amount: data.amount,
    description: data.description
  } as Transaction;
};

export const getSupabaseTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }

  return data.map(transaction => ({
    id: transaction.id,
    date: transaction.date,
    type: transaction.type as TransactionType,
    amount: transaction.amount,
    description: transaction.description
  }));
};

export const clearSupabaseTransactions = async (): Promise<boolean> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

  if (error) {
    console.error('Error clearing transactions:', error);
    return false;
  }

  return true;
};

// Goal Service
export const createSupabaseGoal = async (goal: Omit<Goal, 'id'>) => {
  // Verificar se já existe um gol para este jogador neste jogo
  const { data: existingGoal, error: fetchError } = await supabase
    .from('goals')
    .select('*')
    .eq('game_id', goal.gameId)
    .eq('player_id', goal.playerId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error checking existing goal:', fetchError);
    throw fetchError;
  }

  if (existingGoal) {
    // Atualizar o gol existente
    const { data, error } = await supabase
      .from('goals')
      .update({ count: existingGoal.count + goal.count })
      .eq('id', existingGoal.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      throw error;
    }

    return {
      id: data.id,
      gameId: data.game_id,
      playerId: data.player_id,
      count: data.count
    } as Goal;
  } else {
    // Criar novo gol
    const { data, error } = await supabase
      .from('goals')
      .insert([{
        game_id: goal.gameId,
        player_id: goal.playerId,
        count: goal.count
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      throw error;
    }

    return {
      id: data.id,
      gameId: data.game_id,
      playerId: data.player_id,
      count: data.count
    } as Goal;
  }
};

export const getSupabaseGoals = async (): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*');

  if (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }

  return data.map(goal => ({
    id: goal.id,
    gameId: goal.game_id,
    playerId: goal.player_id,
    count: goal.count
  }));
};
