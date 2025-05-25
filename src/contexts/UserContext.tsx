
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@/types';

interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email?: string;
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAdmin: boolean;
  isMensalista: boolean;
  isViewer: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // User role checks
  // isAdmin = user has admin role
  // isMensalista = user has mensalista OR admin role
  // isViewer = all users have at least viewer access
  const isAdmin = currentUser?.role === 'admin';
  const isMensalista = currentUser?.role === 'mensalista' || isAdmin;
  const isViewer = currentUser !== null; // All authenticated users have at least viewer access

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, isAdmin, isMensalista, isViewer }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
