
import { supabase } from '@/integrations/supabase/client';
import { Game, Player, Goal, Transaction, User, UserRole, PlayerPosition, RunningAbility, GameType, TransactionType } from '@/types';

// Função de helper para converter tipos de string para enum
const toUserRole = (role: string): UserRole => {
  switch(role) {
    case 'admin': return 'admin';
    case 'mensalista': return 'mensalista';
    default: return 'viewer';
  }
};

const toPlayerPosition = (position: string): PlayerPosition => {
  switch(position) {
    case 'atacante': return 'atacante';
    case 'defensor': return 'defensor';
    case 'meia': return 'meia';
    default: return 'flexivel';
  }
};

const toRunningAbility = (running: string): RunningAbility => {
  switch(running) {
    case 'sim': return 'sim';
    case 'nao': return 'nao';
    default: return 'medio';
  }
};

const toGameType = (type: string): GameType => {
  return type === 'campeonato' ? 'campeonato' : 'pelada';
};

const toTransactionType = (type: string): TransactionType => {
  return type === 'entrada' ? 'entrada' : 'saida';
};

// Mapeamento de dados do Supabase para tipos da aplicação
type SupabasePlayer = {
  id: string;
  name: string;
  position: string;
  running: string;
  rating: number;
  photo: string | null;
  created_at: string;
};

type SupabaseGame = {
  id: string;
  date: string;
  type: string;
  photo: string | null;
  created_at: string;
};

type SupabaseGoal = {
  id: string;
  game_id: string;
  player_id: string;
  count: number;
  created_at: string;
  players?: SupabasePlayer;
  games?: SupabaseGame;
};

type SupabaseTransaction = {
  id: string;
  date: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
};

type SupabaseUser = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  avatar: string | null;
  created_at: string;
};

// Funções de mapeamento
const mapSupabasePlayerToPlayer = (player: SupabasePlayer): Player => ({
  id: player.id,
  name: player.name,
  position: toPlayerPosition(player.position),
  running: toRunningAbility(player.running),
  rating: player.rating,
  photo: player.photo || undefined
});

const mapSupabaseGameToGame = (game: SupabaseGame): Game => ({
  id: game.id,
  date: game.date,
  type: toGameType(game.type),
  photo: game.photo || undefined
});

const mapSupabaseGoalToGoal = (goal: SupabaseGoal): Goal => ({
  id: goal.id,
  gameId: goal.game_id,
  playerId: goal.player_id,
  count: goal.count
});

const mapSupabaseTransactionToTransaction = (transaction: SupabaseTransaction): Transaction => ({
  id: transaction.id,
  date: transaction.date,
  type: toTransactionType(transaction.type),
  amount: transaction.amount,
  description: transaction.description
});

const mapSupabaseUserToUser = (user: SupabaseUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email || '',
  role: toUserRole(user.role),
  avatar: user.avatar || undefined
});

// Serviço para jogadores
export const playerService = {
  async getPlayers(): Promise<Player[]> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar jogadores:', error);
        return [];
      }

      return (data as SupabasePlayer[]).map(mapSupabasePlayerToPlayer);
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error);
      return [];
    }
  },

  async getPlayer(id: string): Promise<Player | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Erro ao buscar jogador:', error);
        return null;
      }

      return mapSupabasePlayerToPlayer(data as SupabasePlayer);
    } catch (error) {
      console.error('Erro ao buscar jogador:', error);
      return null;
    }
  },

  async createPlayer(player: Omit<Player, 'id'>): Promise<Player | null> {
    try {
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

      if (error || !data) {
        console.error('Erro ao criar jogador:', error);
        return null;
      }

      return mapSupabasePlayerToPlayer(data as SupabasePlayer);
    } catch (error) {
      console.error('Erro ao criar jogador:', error);
      return null;
    }
  },

  async updatePlayer(id: string, player: Partial<Player>): Promise<Player | null> {
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
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        console.error('Erro ao atualizar jogador:', error);
        return null;
      }

      return mapSupabasePlayerToPlayer(data as SupabasePlayer);
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      return null;
    }
  },

  async deletePlayer(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir jogador:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao excluir jogador:', error);
      return false;
    }
  }
};

// Serviço para jogos
export const gameService = {
  async getGames(): Promise<Game[]> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar jogos:', error);
        return [];
      }

      return (data as SupabaseGame[]).map(mapSupabaseGameToGame);
    } catch (error) {
      console.error('Erro ao buscar jogos:', error);
      return [];
    }
  },

  async getGame(id: string): Promise<Game | null> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Erro ao buscar jogo:', error);
        return null;
      }

      return mapSupabaseGameToGame(data as SupabaseGame);
    } catch (error) {
      console.error('Erro ao buscar jogo:', error);
      return null;
    }
  },

  async createGame(game: Omit<Game, 'id'>): Promise<Game | null> {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert([{
          date: game.date,
          type: game.type,
          photo: game.photo
        }])
        .select()
        .single();

      if (error || !data) {
        console.error('Erro ao criar jogo:', error);
        return null;
      }

      return mapSupabaseGameToGame(data as SupabaseGame);
    } catch (error) {
      console.error('Erro ao criar jogo:', error);
      return null;
    }
  },

  async updateGame(id: string, game: Partial<Game>): Promise<Game | null> {
    try {
      const { data, error } = await supabase
        .from('games')
        .update({
          date: game.date,
          type: game.type,
          photo: game.photo
        })
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        console.error('Erro ao atualizar jogo:', error);
        return null;
      }

      return mapSupabaseGameToGame(data as SupabaseGame);
    } catch (error) {
      console.error('Erro ao atualizar jogo:', error);
      return null;
    }
  },

  async deleteGame(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir jogo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao excluir jogo:', error);
      return false;
    }
  }
};

// Serviço para gols
export const goalService = {
  async getGoals(): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*');

      if (error) {
        console.error('Erro ao buscar gols:', error);
        return [];
      }

      return (data as SupabaseGoal[]).map(mapSupabaseGoalToGoal);
    } catch (error) {
      console.error('Erro ao buscar gols:', error);
      return [];
    }
  },

  async getGoalsByPlayer(playerId: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*, players(*)')
        .eq('player_id', playerId);

      if (error) {
        console.error('Erro ao buscar gols por jogador:', error);
        return [];
      }

      return (data as SupabaseGoal[]).map(mapSupabaseGoalToGoal);
    } catch (error) {
      console.error('Erro ao buscar gols por jogador:', error);
      return [];
    }
  },

  async getGoalsByGame(gameId: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*, games(*)')
        .eq('game_id', gameId);

      if (error) {
        console.error('Erro ao buscar gols por jogo:', error);
        return [];
      }

      return (data as SupabaseGoal[]).map(mapSupabaseGoalToGoal);
    } catch (error) {
      console.error('Erro ao buscar gols por jogo:', error);
      return [];
    }
  },

  async getGoal(id: string): Promise<Goal | null> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Erro ao buscar gol:', error);
        return null;
      }

      return mapSupabaseGoalToGoal(data as SupabaseGoal);
    } catch (error) {
      console.error('Erro ao buscar gol:', error);
      return null;
    }
  },

  async createGoal(goal: Omit<Goal, 'id'>): Promise<Goal | null> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          game_id: goal.gameId,
          player_id: goal.playerId,
          count: goal.count
        }])
        .select()
        .single();

      if (error || !data) {
        console.error('Erro ao criar gol:', error);
        return null;
      }

      return mapSupabaseGoalToGoal(data as SupabaseGoal);
    } catch (error) {
      console.error('Erro ao criar gol:', error);
      return null;
    }
  },

  async updateGoal(id: string, goal: Partial<Goal>): Promise<Goal | null> {
    try {
      const updateData: any = {};
      if (goal.gameId) updateData.game_id = goal.gameId;
      if (goal.playerId) updateData.player_id = goal.playerId;
      if (goal.count !== undefined) updateData.count = goal.count;

      const { data, error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        console.error('Erro ao atualizar gol:', error);
        return null;
      }

      return mapSupabaseGoalToGoal(data as SupabaseGoal);
    } catch (error) {
      console.error('Erro ao atualizar gol:', error);
      return null;
    }
  },

  async deleteGoal(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir gol:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao excluir gol:', error);
      return false;
    }
  }
};

// Serviço para transações
export const transactionService = {
  async getTransactions(): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar transações:', error);
        return [];
      }

      return (data as SupabaseTransaction[]).map(mapSupabaseTransactionToTransaction);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return [];
    }
  },

  async getTransaction(id: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Erro ao buscar transação:', error);
        return null;
      }

      return mapSupabaseTransactionToTransaction(data as SupabaseTransaction);
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      return null;
    }
  },

  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
    try {
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

      if (error || !data) {
        console.error('Erro ao criar transação:', error);
        return null;
      }

      return mapSupabaseTransactionToTransaction(data as SupabaseTransaction);
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      return null;
    }
  },

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          date: transaction.date,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description
        })
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        console.error('Erro ao atualizar transação:', error);
        return null;
      }

      return mapSupabaseTransactionToTransaction(data as SupabaseTransaction);
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return null;
    }
  },

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir transação:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      return false;
    }
  }
};

// Serviço para usuários
export const userService = {
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
      }

      return (data as SupabaseUser[]).map(mapSupabaseUserToUser);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  },

  async getPendingUsers(): Promise<User[]> {
    try {
      // Para implementar este método corretamente, precisaríamos criar uma função RPC no Supabase
      // Para agora, retornamos uma lista vazia
      return [];
    } catch (error) {
      console.error('Erro ao buscar usuários pendentes:', error);
      return [];
    }
  },

  async approveUser(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: role })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao aprovar usuário:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      return false;
    }
  },

  async rejectUser(userId: string): Promise<boolean> {
    try {
      // Esta operação precisaria de uma função RPC no Supabase para ser implementada corretamente
      // Pois envolve excluir o usuário do auth.users
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      return false;
    }
  }
};

export default {
  playerService,
  gameService,
  goalService,
  transactionService,
  userService
};
