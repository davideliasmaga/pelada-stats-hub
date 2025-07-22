import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mensalista' | 'viewer';
  created_at: string;
}

export const createUser = async (name: string, email: string, password: string): Promise<User> => {
  try {
    // 1. Create user in auth system
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (authError) {
      throw new Error(`Erro ao criar usuário: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Erro ao criar usuário');
    }

    // 2. Create profile with viewer role (will be handled by trigger)
    // The trigger will automatically create the profile, but we can also manually ensure it
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        name: name,
        email: email,
        role: 'viewer'
      })
      .select()
      .single();

    if (profileError) {
      throw new Error(`Erro ao criar perfil: ${profileError.message}`);
    }

    return profileData as User;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }

    return (data || []) as User[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: 'admin' | 'mensalista' | 'viewer'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // First delete the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      throw new Error(`Erro ao deletar perfil: ${profileError.message}`);
    }

    // Then delete from auth (this might require admin privileges)
    // For now, we'll just delete the profile and the auth user will remain
    // In a real scenario, you'd need to use admin functions to delete auth users

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};