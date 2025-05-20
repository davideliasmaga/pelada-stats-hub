import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useUser } from './UserContext';
import { toast } from 'sonner';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createPassword: (email: string, token: string, password: string) => Promise<boolean>;
}

// Mock users database with passwords
interface UserAuth {
  email: string;
  password: string;
  userId: string;
  inviteToken?: string;
}

// Initial mock auth data
const initialAuthUsers: UserAuth[] = [
  { email: 'admin@example.com', password: 'admin123', userId: '1' },
  { email: 'mensalista@example.com', password: 'mensalista123', userId: '2' },
  { email: 'viewer@example.com', password: 'viewer123', userId: '3' },
  { email: 'davideliasmagalhaes@gmail.com', password: 'admin123', userId: '6' },
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

  const createPassword = async (email: string, token: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Find user invitation with matching email and token
    const userIndex = authUsers.findIndex(
      user => user.email.toLowerCase() === email.toLowerCase() && user.inviteToken === token
    );

    if (userIndex === -1) {
      toast.error('Link de convite inválido ou expirado');
      return false;
    }

    // Update user with new password and remove invite token
    const updatedAuthUsers = [...authUsers];
    updatedAuthUsers[userIndex] = {
      ...updatedAuthUsers[userIndex],
      password,
      inviteToken: undefined
    };

    setAuthUsers(updatedAuthUsers);
    toast.success('Senha criada com sucesso! Agora você pode fazer login.');
    return true;
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout, createPassword }}>
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
