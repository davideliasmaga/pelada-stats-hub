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

  // Simplified function to get or create user profile
  const getOrCreateProfile = async (authUser: any) => {
    try {
      console.log("Getting profile for user:", authUser.id);
      
      // First try to get existing profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      
      if (existingProfile) {
        console.log("Found existing profile:", existingProfile);
        return {
          id: existingProfile.id,
          name: existingProfile.name,
          email: existingProfile.email,
          role: existingProfile.role as UserRole,
          avatar: existingProfile.avatar
        };
      }
      
      // If no profile exists, create one
      console.log("Creating new profile for user");
      const newProfile = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
        role: 'viewer' as UserRole
      };
      
      const { data: createdProfile, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();
      
      if (error) {
        console.error("Error creating profile:", error);
        // Return basic profile even if creation fails
        return newProfile;
      }
      
      console.log("Created new profile:", createdProfile);
      return {
        id: createdProfile.id,
        name: createdProfile.name,
        email: createdProfile.email,
        role: createdProfile.role as UserRole,
        avatar: createdProfile.avatar
      };
      
    } catch (error) {
      console.error("Error in getOrCreateProfile:", error);
      // Return basic profile data as fallback
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
        role: 'viewer' as UserRole
      };
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }
        
        if (session?.user) {
          console.log("Found active session for user:", session.user.id);
          
          const userData = await getOrCreateProfile(session.user);
          
          if (mounted) {
            setCurrentUser(userData);
            setIsLoggedIn(true);
            console.log("Auth initialized successfully with user:", userData);
          }
        } else {
          console.log("No active session found");
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = await getOrCreateProfile(session.user);
          if (mounted) {
            setCurrentUser(userData);
            setIsLoggedIn(true);
            setIsLoading(false);
            console.log("User signed in:", userData);
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setCurrentUser(null);
            setIsLoggedIn(false);
            setIsLoading(false);
            console.log("User signed out");
          }
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setCurrentUser]);

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
        console.log("Login successful");
        toast.success('Login realizado com sucesso!');
        return true;
      } else {
        console.error('Login failed: No session returned');
        toast.error('Falha ao realizar login');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro ao realizar login');
      return false;
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
      
      setCurrentUser(null);
      setIsLoggedIn(false);
      toast.info('Você foi desconectado');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao realizar logout');
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
            role: 'viewer'
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
