import { supabase } from '@/integrations/supabase/client';
import { Championship } from '@/types';

export const createSupabaseChampionship = async (championship: Omit<Championship, 'id'>): Promise<Championship> => {
  try {
    const { data, error } = await supabase
      .from('championships')
      .insert([{
        player_id: championship.playerId,
        year: championship.year,
        date: championship.date,
        game_id: championship.gameId || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar campeonato:', error);
      throw error;
    }

    return {
      id: data.id,
      playerId: data.player_id,
      gameId: data.game_id,
      year: data.year,
      date: data.date
    };
  } catch (error) {
    console.error('Erro ao criar campeonato:', error);
    throw error;
  }
};

export const getSupabaseChampionships = async (): Promise<Championship[]> => {
  try {
    const { data, error } = await supabase
      .from('championships')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar campeonatos:', error);
      throw error;
    }

    return data.map(championship => ({
      id: championship.id,
      playerId: championship.player_id,
      gameId: championship.game_id,
      year: championship.year,
      date: championship.date
    }));
  } catch (error) {
    console.error('Erro ao buscar campeonatos:', error);
    throw error;
  }
};