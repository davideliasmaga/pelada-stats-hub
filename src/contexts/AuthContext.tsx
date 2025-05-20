import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { useUser } from './UserContext';
import { toast } from 'sonner';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createPassword: (email: string, token: string, password: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
}

// Mock users database with passwords
interface UserAuth {
  email: string;
  password: string;
  userId: string;
  resetToken?: string;
  role: UserRole;
}

// Initial mock auth data
const initialAuthUsers: UserAuth[] = [
  { email: 'admin@example.com', password: 'admin123', userId: '1', role: 'admin' },
  { email: 'mensalista@example.com', password: 'mensalista123', userId: '2', role: 'mensalista' },
  { email: 'viewer@example.com', password: 'viewer123', userId: '3', role: 'viewer' },
  { email: 'davideliasmagalhaes@gmail.com', password: 'admin123', userId: '6', role: 'admin' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authUsers, setAuthUsers] = useState<UserAuth[]>(initialAuthUsers);
  const { setCurrentUser } = useUser();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        setIsLoggedIn(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [setCurrentUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const userAuth = authUsers.find(
      user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
    );

    if (!userAuth) {
      toast.error('Email ou senha inválidos');
      return false;
    }

    // Find user data from our mock database
    const mockUsers = [
      { id: '1', name: 'Admin User', role: 'admin' as const, avatar: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjE3Nzg0fQ' },
      { id: '2', name: 'Mensalista User', role: 'mensalista' as const },
      { id: '3', name: 'Viewer User', role: 'viewer' as const },
      { id: '4', name: 'John Doe', role: 'mensalista' as const },
      { id: '5', name: 'Jane Smith', role: 'viewer' as const },
      { id: '6', name: 'David Elias', role: 'admin' as const },
    ];

    const userData = mockUsers.find(user => user.id === userAuth.userId);
    
    if (userData) {
      // Store in context and localStorage
      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setIsLoggedIn(true);
      toast.success('Login realizado com sucesso!');
      return true;
    }

    toast.error('Erro ao recuperar dados do usuário');
    return false;
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsLoggedIn(false);
    toast.info('Você foi desconectado');
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Find user by email
    const userIndex = authUsers.findIndex(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (userIndex === -1) {
      // Don't reveal if email exists or not for security
      toast.success('Se este email estiver cadastrado, você receberá um link para redefinir sua senha.');
      return true;
    }

    // Generate a random token
    const token = Math.random().toString(36).substring(2, 15);
    
    // Update user with reset token
    const updatedAuthUsers = [...authUsers];
    updatedAuthUsers[userIndex] = {
      ...updatedAuthUsers[userIndex],
      resetToken: token
    };

    setAuthUsers(updatedAuthUsers);

    // In a real app, this would send an email with the reset link
    const baseUrl = window.location.origin;
    const resetLink = `${baseUrl}/create-password?email=${encodeURIComponent(email)}&token=${token}`;
    console.log('Reset link (in real app, this would be sent via email):', resetLink);

    toast.success('Se este email estiver cadastrado, você receberá um link para redefinir sua senha.');
    return true;
  };

  const createPassword = async (email: string, token: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Find user with matching email and token
    const userIndex = authUsers.findIndex(
      user => user.email.toLowerCase() === email.toLowerCase() && user.resetToken === token
    );

    if (userIndex === -1) {
      toast.error('Link inválido ou expirado');
      return false;
    }

    // Update user with new password and remove reset token
    const updatedAuthUsers = [...authUsers];
    updatedAuthUsers[userIndex] = {
      ...updatedAuthUsers[userIndex],
      password,
      resetToken: undefined
    };

    setAuthUsers(updatedAuthUsers);
    toast.success('Senha criada com sucesso! Agora você pode fazer login.');
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      isLoading, 
      login, 
      logout, 
      createPassword,
      requestPasswordReset 
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
