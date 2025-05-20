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
  register: (name: string, email: string, password: string) => Promise<boolean>;
  approveUser: (userId: string, role: UserRole) => Promise<boolean>;
  rejectUser: (userId: string) => Promise<boolean>;
  getPendingUsers: () => Promise<User[]>;
}

// Mock users database with passwords
interface UserAuth {
  email: string;
  password: string;
  userId: string;
  resetToken?: string;
  role: UserRole;
  isApproved: boolean;
}

// Initial mock auth data
const initialAuthUsers: UserAuth[] = [
  { email: 'admin@example.com', password: 'admin123', userId: '1', role: 'admin', isApproved: true },
  { email: 'mensalista@example.com', password: 'mensalista123', userId: '2', role: 'mensalista', isApproved: true },
  { email: 'viewer@example.com', password: 'viewer123', userId: '3', role: 'viewer', isApproved: true },
  { email: 'davideliasmagalhaes@gmail.com', password: 'admin123', userId: '6', role: 'admin', isApproved: true },
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authUsers, setAuthUsers] = useState<UserAuth[]>(initialAuthUsers);
  const [users, setUsers] = useState<User[]>(initialUsers);
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
      user => user.email.toLowerCase() === email.toLowerCase() && 
             user.password === password &&
             user.isApproved
    );

    if (!userAuth) {
      if (authUsers.find(user => user.email.toLowerCase() === email.toLowerCase() && !user.isApproved)) {
        toast.error('Sua conta ainda está aguardando aprovação');
      } else {
        toast.error('Email ou senha inválidos');
      }
      return false;
    }

    const userData = users.find(user => user.id === userAuth.userId);
    
    if (userData) {
      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setIsLoggedIn(true);
      toast.success('Login realizado com sucesso!');
      return true;
    }

    toast.error('Erro ao recuperar dados do usuário');
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if email already exists
    if (authUsers.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      toast.error('Este email já está cadastrado');
      return false;
    }

    // Generate a new user ID
    const newUserId = (Math.max(...users.map(u => parseInt(u.id))) + 1).toString();

    // Create new user
    const newUser: User = {
      id: newUserId,
      name,
      email,
      role: 'viewer', // Default role, will be changed upon approval
    };

    // Create new auth entry
    const newAuthUser: UserAuth = {
      userId: newUserId,
      email,
      password,
      role: 'viewer',
      isApproved: false,
    };

    // Add to our mock database
    setUsers([...users, newUser]);
    setAuthUsers([...authUsers, newAuthUser]);

    return true;
  };

  const approveUser = async (userId: string, role: UserRole): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const userIndex = users.findIndex(u => u.id === userId);
    const authIndex = authUsers.findIndex(u => u.userId === userId);

    if (userIndex === -1 || authIndex === -1) {
      toast.error('Usuário não encontrado');
      return false;
    }

    // Update user role and approval status
    const updatedUsers = [...users];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], role };

    const updatedAuthUsers = [...authUsers];
    updatedAuthUsers[authIndex] = { ...updatedAuthUsers[authIndex], role, isApproved: true };

    setUsers(updatedUsers);
    setAuthUsers(updatedAuthUsers);

    toast.success('Usuário aprovado com sucesso');
    return true;
  };

  const rejectUser = async (userId: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const userIndex = users.findIndex(u => u.id === userId);
    const authIndex = authUsers.findIndex(u => u.userId === userId);

    if (userIndex === -1 || authIndex === -1) {
      toast.error('Usuário não encontrado');
      return false;
    }

    // Remove user from both arrays
    const updatedUsers = users.filter(u => u.id !== userId);
    const updatedAuthUsers = authUsers.filter(u => u.userId !== userId);

    setUsers(updatedUsers);
    setAuthUsers(updatedAuthUsers);

    toast.success('Usuário rejeitado com sucesso');
    return true;
  };

  const getPendingUsers = async (): Promise<User[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const pendingUserIds = authUsers
      .filter(u => !u.isApproved)
      .map(u => u.userId);

    return users.filter(u => pendingUserIds.includes(u.id));
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
