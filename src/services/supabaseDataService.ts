import { supabase } from '@/integrations/supabase/client';
import { Player, Game, Goal, Transaction, PlayerPosition, RunningAbility, GameType, TransactionType } from '@/types';

// Transaction Service
export const createSupabaseTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  try {
    console.log('=== STARTING TRANSACTION CREATION ===');
    console.log('Transaction data received:', transaction);
    
    // Preparar dados da transação
    const transactionToInsert = {
      date: transaction.date,
      type: transaction.type,
      amount: Number(transaction.amount),
      description: transaction.description.trim()
    };
    
    console.log('Data to insert:', transactionToInsert);
    
    // Inserir transação
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionToInsert])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw new Error(`Erro ao criar transação: ${error.message}`);
    }

    console.log('Transaction created successfully:', data);

    return {
      id: data.id,
      date: data.date,
      type: data.type as TransactionType,
      amount: Number(data.amount),
      description: data.description
    } as Transaction;
  } catch (error) {
    console.error('=== ERROR IN createSupabaseTransaction ===');
    console.error('Error details:', error);
    throw error;
  }
};

export const getSupabaseTransactions = async (): Promise<Transaction[]> => {
  try {
    console.log('=== FETCHING TRANSACTIONS ===');
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw new Error(`Erro ao buscar transações: ${error.message}`);
    }

    console.log('Transactions fetched successfully:', data?.length || 0);

    return (data || []).map(transaction => ({
      id: transaction.id,
      date: transaction.date,
      type: transaction.type as TransactionType,
      amount: Number(transaction.amount),
      description: transaction.description
    }));
  } catch (error) {
    console.error('Error in getSupabaseTransactions:', error);
    throw error;
  }
};

export const clearSupabaseTransactions = async (): Promise<boolean> => {
  try {
    console.log('=== CLEARING TRANSACTIONS ===');
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error clearing transactions:', error);
      throw new Error(`Erro ao limpar transações: ${error.message}`);
    }

    console.log('Transactions cleared successfully');
    return true;
  } catch (error) {
    console.error('Error in clearSupabaseTransactions:', error);
    return false;
  }
};

// Player Service
export const createSupabasePlayer = async (player: Omit<Player, 'id'>) => {
  try {
    console.log('Creating player:', player);
    
    const { data, error } = await supabase
      .from('players')
      .insert([{
        name: player.name,
        position: player.position,
        running: player.running,
        rating: player.rating,
        photo: player.photo || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating player:', error);
      throw new Error(`Erro ao criar jogador: ${error.message}`);
    }

    console.log('Player created successfully:', data);

    return {
      id: data.id,
      name: data.name,
      position: data.position as PlayerPosition,
      running: data.running as RunningAbility,
      rating: Number(data.rating),
      photo: data.photo
    } as Player;
  } catch (error) {
    console.error('Error in createSupabasePlayer:', error);
    throw error;
  }
};

export const getSupabasePlayers = async (): Promise<Player[]> => {
  try {
    console.log('Fetching players...');
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching players:', error);
      throw new Error(`Erro ao buscar jogadores: ${error.message}`);
    }

    console.log('Players fetched successfully:', data);

    return (data || []).map(player => ({
      id: player.id,
      name: player.name,
      position: player.position as PlayerPosition,
      running: player.running as RunningAbility,
      rating: Number(player.rating),
      photo: player.photo
    }));
  } catch (error) {
    console.error('Error in getSupabasePlayers:', error);
    throw error;
  }
};

export const deleteSupabasePlayer = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting player:', id);
    
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting player:', error);
      throw new Error(`Erro ao deletar jogador: ${error.message}`);
    }

    console.log('Player deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteSupabasePlayer:', error);
    return false;
  }
};

// Game Service
export const createSupabaseGame = async (game: Omit<Game, 'id'>, playerIds: string[] = []) => {
  try {
    console.log('Creating game:', game, 'with players:', playerIds);
    
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert([{
        date: game.date,
        type: game.type,
        photo: game.photo || null
      }])
      .select()
      .single();

    if (gameError) {
      console.error('Error creating game:', gameError);
      throw new Error(`Erro ao criar jogo: ${gameError.message}`);
    }

    console.log('Game created successfully:', gameData);

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
        console.warn('Game created but failed to add players');
      } else {
        console.log('Game players added successfully');
      }
    }

    return {
      id: gameData.id,
      date: gameData.date,
      type: gameData.type as GameType,
      photo: gameData.photo
    } as Game;
  } catch (error) {
    console.error('Error in createSupabaseGame:', error);
    throw error;
  }
};

export const getSupabaseGames = async (): Promise<Game[]> => {
  try {
    console.log('Fetching games...');
    
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching games:', error);
      throw new Error(`Erro ao buscar jogos: ${error.message}`);
    }

    console.log('Games fetched successfully:', data);

    return (data || []).map(game => ({
      id: game.id,
      date: game.date,
      type: game.type as GameType,
      photo: game.photo
    }));
  } catch (error) {
    console.error('Error in getSupabaseGames:', error);
    throw error;
  }
};

export const getGamePlayers = async (gameId: string): Promise<Player[]> => {
  try {
    console.log('Fetching game players for game:', gameId);
    
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
      throw new Error(`Erro ao buscar jogadores do jogo: ${error.message}`);
    }

    console.log('Game players fetched successfully:', data);

    return (data || []).map(item => ({
      id: (item.players as any).id,
      name: (item.players as any).name,
      position: (item.players as any).position as PlayerPosition,
      running: (item.players as any).running as RunningAbility,
      rating: Number((item.players as any).rating),
      photo: (item.players as any).photo
    }));
  } catch (error) {
    console.error('Error in getGamePlayers:', error);
    throw error;
  }
};

// Goal Service
export const createSupabaseGoal = async (goal: Omit<Goal, 'id'>) => {
  try {
    console.log('Creating goal:', goal);
    
    const { data: existingGoal, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('game_id', goal.gameId)
      .eq('player_id', goal.playerId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking existing goal:', fetchError);
      throw new Error(`Erro ao verificar gol existente: ${fetchError.message}`);
    }

    if (existingGoal) {
      const { data, error } = await supabase
        .from('goals')
        .update({ count: existingGoal.count + goal.count })
        .eq('id', existingGoal.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating goal:', error);
        throw new Error(`Erro ao atualizar gol: ${error.message}`);
      }

      console.log('Goal updated successfully:', data);

      return {
        id: data.id,
        gameId: data.game_id,
        playerId: data.player_id,
        count: data.count
      } as Goal;
    } else {
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
        throw new Error(`Erro ao criar gol: ${error.message}`);
      }

      console.log('Goal created successfully:', data);

      return {
        id: data.id,
        gameId: data.game_id,
        playerId: data.player_id,
        count: data.count
      } as Goal;
    }
  } catch (error) {
    console.error('Error in createSupabaseGoal:', error);
    throw error;
  }
};

export const getSupabaseGoals = async (): Promise<Goal[]> => {
  try {
    console.log('Fetching goals...');
    
    const { data, error } = await supabase
      .from('goals')
      .select('*');

    if (error) {
      console.error('Error fetching goals:', error);
      throw new Error(`Erro ao buscar gols: ${error.message}`);
    }

    console.log('Goals fetched successfully:', data);

    return (data || []).map(goal => ({
      id: goal.id,
      gameId: goal.game_id,
      playerId: goal.player_id,
      count: goal.count
    }));
  } catch (error) {
    console.error('Error in getSupabaseGoals:', error);
    throw error;
  }
};

// Delete functions
export const deleteSupabaseGame = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting game:', id);
    
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting game:', error);
      throw new Error(`Erro ao deletar jogo: ${error.message}`);
    }

    console.log('Game deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteSupabaseGame:', error);
    return false;
  }
};

export const deleteSupabaseTransaction = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting transaction:', id);
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw new Error(`Erro ao deletar transação: ${error.message}`);
    }

    console.log('Transaction deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteSupabaseTransaction:', error);
    return false;
  }
};
