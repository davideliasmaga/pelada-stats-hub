
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'mensalista' | 'viewer';

interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
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
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: '1',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjE3Nzg0fQ'
  });

  const isAdmin = currentUser?.role === 'admin';
  const isMensalista = currentUser?.role === 'mensalista' || isAdmin;
  const isViewer = currentUser?.role === 'viewer' || isMensalista || isAdmin;

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
