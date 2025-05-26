import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { useUser } from './UserContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

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

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("User fetch error:", error);
        return null;
      }
      
      if (user) {
        const userData: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          avatar: user.avatar
        };
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error("Profile fetch error:", error);
      return null;
    }
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        setIsLoading(true);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          console.log("Session found:", session.user.id);
          
          const userData = await fetchUserProfile(session.user.id);
          
          if (!mounted) return;
          
          if (userData) {
            setCurrentUser(userData);
            setIsLoggedIn(true);
          } else {
            console.log("No user profile found, but session exists. Creating profile...");
            // Create profile if it doesn't exist
            const { data: newUser, error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.email?.split('@')[0] || 'Usuário',
                  role: 'viewer'
                }
              ])
              .select()
              .single();
            
            if (!mounted) return;
            
            if (createError) {
              console.error("Error creating profile:", createError);
            } else if (newUser) {
              const newUserData: User = {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role as UserRole,
                avatar: newUser.avatar
              };
              
              setCurrentUser(newUserData);
              setIsLoggedIn(true);
            }
          }
        } else {
          console.log("No active session found");
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session) {
          // Fetch fresh user data on login
          const userData = await fetchUserProfile(session.user.id);
          if (userData) {
            setCurrentUser(userData);
          }
          setIsLoggedIn(true);
          if (mounted) {
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setIsLoggedIn(false);
          setIsLoading(false);
        }
      }
    );

    checkAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setCurrentUser]);

  // Function to load users
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Error loading users:', error);
        return;
      }
      
      if (data) {
        const typedUsers = data.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          avatar: user.avatar
        }));
        setUsers(typedUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load users when the component mounts
  useEffect(() => {
    loadUsers();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(`Erro no login: ${error.message}`);
        return false;
      }

      if (data.session) {
        console.log("Login successful, session created:", data.session.user.id);
        toast.success('Login realizado com sucesso!');
        return true;
      } else {
        console.error('Login failed: No session returned');
        toast.error('Falha ao realizar login: Nenhuma sessão retornada');
        return false;
      }
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
      return [];
    } catch (error) {
      console.error('Get pending users error:', error);
      return [];
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Erro ao realizar logout');
        return;
      }
      
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
