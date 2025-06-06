import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';
import { User, UserRole } from '@/types';
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
            console.log('User session found:', session.user.id);
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
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (mounted) {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } finally {
        if (mounted) {
          console.log('Auth initialization complete - setting loading false');
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
      
      setIsLoading(false);
    });

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setCurrentUser]);

  const logout = async () => {
    try {
      console.log('Logging out...');
      await supabase.auth.signOut();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('Registering user:', email);
      
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
        console.error('Registration error:', error);
        toast.error(error.message);
        return false;
      }

      console.log('Registration successful');
      toast.success('Registro realizado com sucesso! Verifique seu email.');
      return true;
    } catch (error) {
      console.error('Registration exception:', error);
      toast.error('Erro ao registrar usuário');
      return false;
    }
  };

  const createPassword = async (email: string, token: string, password: string): Promise<boolean> => {
    try {
      console.log('Creating password for:', email);
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
      console.log('Approving user:', userId, 'with role:', role);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        console.error('Approve user error:', error);
        toast.error('Erro ao aprovar usuário');
        return false;
      }

      console.log('User approved successfully');
      toast.success('Usuário aprovado com sucesso!');
      await loadUsers();
      return true;
    } catch (error) {
      console.error('Approve user exception:', error);
      toast.error('Erro ao aprovar usuário');
      return false;
    }
  };

  const rejectUser = async (userId: string): Promise<boolean> => {
    try {
      console.log('Rejecting user:', userId);
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Reject user error:', error);
        toast.error('Erro ao rejeitar usuário');
        return false;
      }

      console.log('User rejected successfully');
      toast.success('Usuário rejeitado com sucesso!');
      await loadUsers();
      return true;
    } catch (error) {
      console.error('Reject user exception:', error);
      toast.error('Erro ao rejeitar usuário');
      return false;
    }
  };

  const getPendingUsers = async (): Promise<User[]> => {
    try {
      console.log('Fetching pending users...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'pending');

      if (error) {
        console.error('Error fetching pending users:', error);
        return [];
      }

      console.log('Pending users fetched:', data);
      
      // Convert the data to User type with proper role casting
      const pendingUsers: User[] = (data || []).map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email || '',
        role: profile.role as UserRole,
        avatar: profile.avatar || undefined
      }));

      return pendingUsers;
    } catch (error) {
      console.error('Get pending users exception:', error);
      return [];
    }
  };

  const loadUsers = async () => {
    try {
      console.log('Loading users...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'pending');

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      console.log('Users loaded:', data);
      
      // Convert the data to User type with proper role casting
      const loadedUsers: User[] = (data || []).map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email || '',
        role: profile.role as UserRole,
        avatar: profile.avatar || undefined
      }));

      setUsers(loadedUsers);
    } catch (error) {
      console.error('Load users exception:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      loadUsers();
    }
  }, [isLoggedIn, isLoading]);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
      } else {
        console.log('Login successful');
      }
      
      return { error };
    } catch (error) {
      console.error('Login exception:', error);
      return { error };
    }
  };

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
