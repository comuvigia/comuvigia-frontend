import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useUser } from './UserContext';

interface PublicRouteProps {
  children: React.ReactNode;
  path: string;
  exact?: boolean;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children, ...rest }) => {
  const { user, checkingAuth } = useUser();

  if (checkingAuth) return <div>Cargando...</div>;

  if (user) return <Redirect to="/home" />;

  return <Route {...rest}>{children}</Route>;
};
