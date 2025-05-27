
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@/types';

interface RequireRoleProps {
  children: React.ReactElement;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

const RequireRole = ({ children, allowedRoles, redirectTo = '/' }: RequireRoleProps) => {
  const { currentUser } = useUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RequireRole;
