import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { useUser } from './UserContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createPassword: (email: string, token: string, password: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  approveUser: (userId: string, role: UserRole) => Promise<boolean>;
  rejectUser: (userId: string) => Promise<boolean>;
  getPendingUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const { setCurrentUser } = useUser();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Fetch user profile from the profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          const userData: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role as UserRole,
            avatar: profile.avatar
          };
          
          setCurrentUser(userData);
          setIsLoggedIn(true);
        } else {
          // If no profile, create one
          const userData: User = {
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: 'viewer'
          };
          
          const { error } = await supabase.from('profiles').insert([
            {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role
            }
          ]);
          
          if (!error) {
            setCurrentUser(userData);
            setIsLoggedIn(true);
          }
        }
      }
      
      setIsLoading(false);
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            const userData: User = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as UserRole,
              avatar: profile.avatar
            };
            
            setCurrentUser(userData);
            setIsLoggedIn(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      }
    );

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [setCurrentUser]);

  // Adicionar função para carregar usuários
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Error loading users:', error);
        return;
      }
      
      setUsers(data as User[]);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Carregar usuários quando o componente montar
  useEffect(() => {
    loadUsers();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro ao realizar login');
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'viewer' // Default role
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success('Registro realizado com sucesso! Por favor, verifique seu email.');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Erro ao realizar cadastro');
      return false;
    }
  };

  const approveUser = async (userId: string, role: UserRole): Promise<boolean> => {
    try {
      // In a real implementation, we would call a Supabase Edge Function to approve the user
      // For now, we'll just update the profile's role
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      
      if (error) {
        toast.error('Erro ao aprovar usuário');
        return false;
      }
      
      toast.success('Usuário aprovado com sucesso');
      return true;
    } catch (error) {
      console.error('Approve user error:', error);
      toast.error('Erro ao aprovar usuário');
      return false;
    }
  };

  const rejectUser = async (userId: string): Promise<boolean> => {
    try {
      // In a real implementation, we would call a Supabase Edge Function to reject the user
      // For now, simulate success
      toast.success('Usuário rejeitado com sucesso');
      return true;
    } catch (error) {
      console.error('Reject user error:', error);
      toast.error('Erro ao rejeitar usuário');
      return false;
    }
  };

  const getPendingUsers = async (): Promise<User[]> => {
    try {
      // In a real implementation, we would call a Supabase Edge Function to get pending users
      // For now, return an empty array
      return [];
    } catch (error) {
      console.error('Get pending users error:', error);
      return [];
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      setIsLoggedIn(false);
      toast.info('Você foi desconectado');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao realizar logout');
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/create-password`,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success('Se este email estiver cadastrado, você receberá um link para redefinir sua senha.');
      return true;
    } catch (error) {
      console.error('Password reset request error:', error);
      toast.error('Erro ao solicitar redefinição de senha');
      return false;
    }
  };

  const createPassword = async (email: string, token: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        toast.error('Link inválido ou expirado');
        return false;
      }

      toast.success('Senha criada com sucesso! Agora você pode fazer login.');
      return true;
    } catch (error) {
      console.error('Create password error:', error);
      toast.error('Erro ao criar senha');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      isLoading,
      users,
      login,
      logout,
      createPassword,
      requestPasswordReset,
      register,
      approveUser,
      rejectUser,
      getPendingUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
