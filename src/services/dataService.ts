import { Player, Game, Goal, Transaction, PlayerPosition, RunningAbility, GameType, TransactionType } from '@/types';

// Mock data
const players: Player[] = [
  { id: '1', name: 'Ronaldo', position: 'atacante', running: 'sim', rating: 9, photo: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=150' },
  { id: '2', name: 'Roberto Carlos', position: 'defensor', running: 'sim', rating: 8.5 },
  { id: '3', name: 'Zidane', position: 'meia', running: 'medio', rating: 9.5, photo: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=150' },
  { id: '4', name: 'Cafu', position: 'defensor', running: 'sim', rating: 8 },
  { id: '5', name: 'Rivaldo', position: 'atacante', running: 'medio', rating: 8.7 },
  { id: '6', name: 'Ronaldinho', position: 'flexivel', running: 'sim', rating: 9.8 },
  { id: '7', name: 'Adriano', position: 'atacante', running: 'nao', rating: 8.2 },
  { id: '8', name: 'Júnior', position: 'defensor', running: 'medio', rating: 7.5 },
  { id: '9', name: 'Denílson', position: 'meia', running: 'sim', rating: 8.1 },
  { id: '10', name: 'Kaká', position: 'meia', running: 'sim', rating: 9.2 },
];

const games: Game[] = [
  { id: '1', date: '2023-04-15T18:00:00Z', type: 'pelada' },
  { id: '2', date: '2023-04-22T18:00:00Z', type: 'pelada' },
  { id: '3', date: '2023-04-29T18:00:00Z', type: 'pelada' },
  { id: '4', date: '2023-05-06T18:00:00Z', type: 'campeonato' },
  { id: '5', date: '2023-05-13T18:00:00Z', type: 'campeonato' },
];

const goals: Goal[] = [
  { id: '1', gameId: '1', playerId: '1', count: 3 },
  { id: '2', gameId: '1', playerId: '3', count: 1 },
  { id: '3', gameId: '1', playerId: '6', count: 2 },
  { id: '4', gameId: '2', playerId: '1', count: 2 },
  { id: '5', gameId: '2', playerId: '5', count: 1 },
  { id: '6', gameId: '3', playerId: '6', count: 3 },
  { id: '7', gameId: '3', playerId: '7', count: 1 },
  { id: '8', gameId: '4', playerId: '1', count: 2 },
  { id: '9', gameId: '4', playerId: '10', count: 2 },
  { id: '10', gameId: '5', playerId: '6', count: 4 },
];

const transactions: Transaction[] = [
  { id: '1', date: '2023-04-01T12:00:00Z', type: 'entrada', amount: 500, description: 'Mensalidade de Abril' },
  { id: '2', date: '2023-04-05T14:30:00Z', type: 'saida', amount: 200, description: 'Aluguel do campo' },
  { id: '3', date: '2023-04-12T10:00:00Z', type: 'entrada', amount: 100, description: 'Convidados' },
  { id: '4', date: '2023-04-19T15:45:00Z', type: 'saida', amount: 150, description: 'Novas bolas' },
  { id: '5', date: '2023-05-01T12:00:00Z', type: 'entrada', amount: 500, description: 'Mensalidade de Maio' },
];

// Player Service
export const getPlayers = (): Player[] => {
  return players;
};

export const getPlayer = (id: string): Player | undefined => {
  return players.find(player => player.id === id);
};

export const createPlayer = (player: Omit<Player, 'id'>): Player => {
  const newPlayer = { ...player, id: String(Date.now()) };
  players.push(newPlayer);
  return newPlayer;
};

export const updatePlayer = (id: string, updates: Partial<Player>): Player | undefined => {
  const index = players.findIndex(player => player.id === id);
  if (index !== -1) {
    players[index] = { ...players[index], ...updates };
    return players[index];
  }
  return undefined;
};

export const deletePlayer = (id: string): boolean => {
  const index = players.findIndex(player => player.id === id);
  if (index !== -1) {
    players.splice(index, 1);
    return true;
  }
  return false;
};

// Game Service
export const getGames = (): Game[] => {
  return games;
};

export const getGame = (id: string): Game | undefined => {
  return games.find(game => game.id === id);
};

export const createGame = (game: Omit<Game, 'id'>): Game => {
  const newGame = { ...game, id: String(Date.now()) };
  games.push(newGame);
  return newGame;
};

export const updateGame = (id: string, updates: Partial<Game>): Game | undefined => {
  const index = games.findIndex(game => game.id === id);
  if (index !== -1) {
    games[index] = { ...games[index], ...updates };
    return games[index];
  }
  return undefined;
};

export const deleteGame = (id: string): boolean => {
  const index = games.findIndex(game => game.id === id);
  if (index !== -1) {
    games.splice(index, 1);
    return true;
  }
  return false;
};

// Goal Service
export const getGoals = (): Goal[] => {
  return goals;
};

export const getGoalsByGame = (gameId: string): Goal[] => {
  return goals.filter(goal => goal.gameId === gameId);
};

export const getGoalsByPlayer = (playerId: string): Goal[] => {
  return goals.filter(goal => goal.playerId === playerId);
};

export const createGoal = (goal: Omit<Goal, 'id'>): Goal => {
  const existingGoal = goals.find(
    g => g.gameId === goal.gameId && g.playerId === goal.playerId
  );

  if (existingGoal) {
    existingGoal.count += goal.count;
    return existingGoal;
  }

  const newGoal = { ...goal, id: String(Date.now()) };
  goals.push(newGoal);
  return newGoal;
};

export const updateGoal = (id: string, updates: Partial<Goal>): Goal | undefined => {
  const index = goals.findIndex(goal => goal.id === id);
  if (index !== -1) {
    goals[index] = { ...goals[index], ...updates };
    return goals[index];
  }
  return undefined;
};

export const deleteGoal = (id: string): boolean => {
  const index = goals.findIndex(goal => goal.id === id);
  if (index !== -1) {
    goals.splice(index, 1);
    return true;
  }
  return false;
};

// Transaction Service
export const getTransactions = (): Transaction[] => {
  return transactions;
};

export const getTotalBalance = (): number => {
  return transactions.reduce((acc, transaction) => {
    if (transaction.type === 'entrada') {
      return acc + transaction.amount;
    } else {
      return acc - transaction.amount;
    }
  }, 0);
};

export const createTransaction = (transaction: Omit<Transaction, 'id'>): Transaction => {
  const newTransaction = { ...transaction, id: String(Date.now()) };
  transactions.push(newTransaction);
  return newTransaction;
};

// Top Scorers and Statistics
export const getTopScorers = (
  period?: { start: string; end: string },
  gameType?: GameType
): Array<{ player: Player; goals: number }> => {
  const filteredGoals = goals.filter(goal => {
    const game = games.find(g => g.id === goal.gameId);
    if (!game) return false;
    
    const gameDate = new Date(game.date);
    const matchesGameType = !gameType || game.type === gameType;
    const matchesPeriod = !period || 
      (gameDate >= new Date(period.start) && gameDate <= new Date(period.end));
    
    return matchesGameType && matchesPeriod;
  });

  const playerGoals = filteredGoals.reduce((acc, goal) => {
    const playerId = goal.playerId;
    if (!acc[playerId]) {
      acc[playerId] = 0;
    }
    acc[playerId] += goal.count;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(playerGoals)
    .map(([playerId, goals]) => {
      const player = players.find(p => p.id === playerId);
      return player ? { player, goals } : null;
    })
    .filter(Boolean as any)
    .sort((a, b) => b.goals - a.goals) as Array<{ player: Player; goals: number }>;
};

export const generateBalancedTeams = (playerIds: string[], numTeams: number): Player[][] => {
  // Simple implementation for team balancing
  const selectedPlayers = players.filter(p => playerIds.includes(p.id));
  
  // Sort by rating
  const sortedPlayers = [...selectedPlayers].sort((a, b) => b.rating - a.rating);
  
  // Initialize teams
  const teams: Player[][] = Array.from({ length: numTeams }, () => []);
  
  // First, assign defenders to ensure each team has at least one
  const defenders = sortedPlayers.filter(p => p.position === 'defensor');
  defenders.forEach((defender, index) => {
    if (index < numTeams) {
      teams[index % numTeams].push(defender);
    }
  });
  
  // Remove assigned defenders from the pool
  const remainingPlayers = sortedPlayers.filter(
    p => !defenders.slice(0, numTeams).includes(p)
  );
  
  // Use snake draft to balance teams
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
