
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

  // Don't redirect to login here - that's RequireAuth's job
  // If there's no currentUser, just show a loading state and let RequireAuth handle it
  if (!currentUser) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Verificando permissões...</p>
      </div>
    </div>;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RequireRole;
