import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { useUser } from './UserContext';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserAuth | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  approveUser: (userId: string, role: UserRole) => Promise<boolean>;
  rejectUser: (userId: string) => Promise<boolean>;
  getPendingUsers: () => Promise<User[]>;
  handlePasswordReset: (email: string) => Promise<boolean>;
}

interface UserAuth extends User {
  password: string;
  isApproved: boolean;
}

// Initial mock authentication data
const initialAuthUsers: UserAuth[] = [
  {
    id: "1",
    name: "Admin User",
    email: "davideliasmagalhaes@gmail.com",
    role: "admin",
    password: "admin123",
    isApproved: true,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Admin+User"
  },
  {
    id: "2",
    name: "Mensalista User",
    email: "mensalista@example.com",
    role: "mensalista",
    password: "mensalista123",
    isApproved: true,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Mensalista+User"
  },
  {
    id: "3",
    name: "Viewer User",
    email: "viewer@example.com",
    role: "viewer",
    password: "viewer123",
    isApproved: true,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Viewer+User"
  }
];

// Mock users data
const initialUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', avatar: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjE3Nzg0fQ' },
  { id: '2', name: 'Mensalista User', email: 'mensalista@example.com', role: 'mensalista' },
  { id: '3', name: 'Viewer User', email: 'viewer@example.com', role: 'viewer' },
  { id: '4', name: 'John Doe', email: 'john@example.com', role: 'mensalista' },
  { id: '5', name: 'Jane Smith', email: 'jane@example.com', role: 'viewer' },
  { id: '6', name: 'David Elias', email: 'davideliasmagalhaes@gmail.com', role: 'admin' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'pelada_stats_users',
  AUTH_USERS: 'pelada_stats_auth_users'
};

// Helper functions to manage localStorage
const getStoredData = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const setStoredData = <T,>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [users, setUsers] = useState<User[]>(() => getStoredData(STORAGE_KEYS.USERS, initialUsers));
  const [authUsers, setAuthUsers] = useState<UserAuth[]>(() => getStoredData(STORAGE_KEYS.AUTH_USERS, initialAuthUsers));
  const { setCurrentUser } = useUser();

  // Update localStorage when users or authUsers change
  useEffect(() => {
    setStoredData(STORAGE_KEYS.USERS, users);
  }, [users]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.AUTH_USERS, authUsers);
  }, [authUsers]);

  useEffect(() => {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      setCurrentUser(user);
      setUser(user);
    }
  }, [setCurrentUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const userAuth = authUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!userAuth) {
      toast.error('Email ou senha inválidos');
      return false;
    }

    if (!userAuth.isApproved) {
      toast.error('Sua conta ainda não foi aprovada por um administrador');
      return false;
    }

    const userData: User = {
      id: userAuth.id,
      name: userAuth.name,
      email: userAuth.email,
      role: userAuth.role,
      avatar: userAuth.avatar,
    };

    setCurrentUser(userData);
    setUser(userAuth);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    toast.success('Login realizado com sucesso!');
    return true;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      throw new Error("Email já cadastrado");
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      role: "viewer",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    };

    const newUserAuth: UserAuth = {
      ...newUser,
      password,
      isApproved: false,
    };

    const newUsers = [...users, newUser];
    const newAuthUsers = [...authUsers, newUserAuth];
    
    setUsers(newUsers);
    setAuthUsers(newAuthUsers);
    return true;
  };

  const approveUser = async (userId: string, role: UserRole): Promise<boolean> => {
    const updatedAuthData = authUsers.map(user => {
      if (user.id === userId) {
        return { ...user, isApproved: true, role };
      }
      return user;
    });

    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, role };
      }
      return user;
    });

    setAuthUsers(updatedAuthData);
    setUsers(updatedUsers);
    return true;
  };

  const rejectUser = async (userId: string): Promise<boolean> => {
    const updatedAuthData = authUsers.filter(user => user.id !== userId);
    const updatedUsers = users.filter(user => user.id !== userId);
    setAuthUsers(updatedAuthData);
    setUsers(updatedUsers);
    return true;
  };

  const getPendingUsers = async (): Promise<User[]> => {
    const pendingUserIds = authUsers
      .filter(user => !user.isApproved)
      .map(user => user.id);
    return users.filter(user => pendingUserIds.includes(user.id));
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setUser(null);
    toast.info('Você foi desconectado');
  };

  const handlePasswordReset = async (email: string): Promise<boolean> => {
    const userAuth = authUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!userAuth) {
      toast.error('Email não encontrado');
      return false;
    }

    // For now, we'll just show a success message
    // In a real application, you would send a reset email
    toast.success('Se este email estiver cadastrado, você receberá as instruções para redefinir sua senha');
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      users,
      login,
      logout,
      register,
      approveUser,
      rejectUser,
      getPendingUsers,
      handlePasswordReset,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
