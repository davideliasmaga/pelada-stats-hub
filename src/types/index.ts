
export type UserRole = 'admin' | 'mensalista' | 'viewer';

export type PlayerPosition = 'atacante' | 'defensor' | 'meia' | 'flexivel';
export type RunningAbility = 'sim' | 'nao' | 'medio';
export type GameType = 'pelada' | 'campeonato';
export type TransactionType = 'entrada' | 'saida';

export interface Player {
  id: string;
  name: string;
  position: PlayerPosition;
  running: RunningAbility;
  rating: number; // 0 to 10
  photo?: string;
}

export interface Game {
  id: string;
  date: string; // ISO date string
  type: GameType;
  photo?: string;
}

export interface Goal {
  id: string;
  gameId: string;
  playerId: string;
  count: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO date string
  type: TransactionType;
  amount: number;
  description: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}
