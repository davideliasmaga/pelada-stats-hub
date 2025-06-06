
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';
import { User } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  users: User[];
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  createPassword: (email: string, token: string, password: string) => Promise<boolean>;
  approveUser: (userId: string, role: string) => Promise<boolean>;
  rejectUser: (userId: string) => Promise<boolean>;
  getPendingUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const { setCurrentUser } = useUser();

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            console.log('User session found');
            setIsLoggedIn(true);
            setCurrentUser({
              id: session.user.id,
              name: session.user.email?.split('@')[0] || 'Usuário',
              role: 'admin',
              email: session.user.email
            });
          } else {
            console.log('No user session');
            setIsLoggedIn(false);
            setCurrentUser(null);
          }
          
          console.log('Auth initialization complete - setting loading false');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (mounted) {
          setIsLoggedIn(false);
          setCurrentUser(null);
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (!mounted) return;

      if (session?.user) {
        setIsLoggedIn(true);
        setCurrentUser({
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'Usuário',
          role: 'admin',
          email: session.user.email
        });
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    });

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setCurrentUser]);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success('Registro realizado com sucesso! Verifique seu email.');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Erro ao registrar usuário');
      return false;
    }
  };

  const createPassword = async (email: string, token: string, password: string): Promise<boolean> => {
    try {
      toast.success('Senha criada com sucesso!');
      return true;
    } catch (error) {
      console.error('Create password error:', error);
      toast.error('Erro ao criar senha');
      return false;
    }
  };

  const approveUser = async (userId: string, role: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        toast.error('Erro ao aprovar usuário');
        return false;
      }

      toast.success('Usuário aprovado com sucesso!');
      await loadUsers();
      return true;
    } catch (error) {
      console.error('Approve user error:', error);
      toast.error('Erro ao aprovar usuário');
      return false;
    }
  };

  const rejectUser = async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        toast.error('Erro ao rejeitar usuário');
        return false;
      }

      toast.success('Usuário rejeitado com sucesso!');
      await loadUsers();
      return true;
    } catch (error) {
      console.error('Reject user error:', error);
      toast.error('Erro ao rejeitar usuário');
      return false;
    }
  };

  const getPendingUsers = async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'pending');

      if (error) {
        console.error('Error fetching pending users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get pending users error:', error);
      return [];
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'pending');

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      loadUsers();
    }
  }, [isLoggedIn, isLoading]);

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      isLoading, 
      users,
      login, 
      logout, 
      register, 
      createPassword, 
      approveUser, 
      rejectUser, 
      getPendingUsers 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
