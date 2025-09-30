import React from 'react';
import { Redirect } from 'react-router-dom';
import { useUser } from './UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, checkingAuth } = useUser();

  if (checkingAuth) return <div>Cargando...</div>;

  if (!user) return <Redirect to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Redirect to="/home" />;
  }

  return <>{children}</>;
};
