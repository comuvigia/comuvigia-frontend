import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useUser } from './UserContext';
import { IonContent, IonSpinner } from '@ionic/react';

interface PublicRouteProps {
  children: React.ReactNode;
  path: string;
  exact?: boolean;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children, ...rest }) => {
  const { user, checkingAuth } = useUser();

  if (checkingAuth)
    return (
      <IonContent className="ion-padding ion-text-center auth-loading-screen">
        <div className="auth-loading-container">
          <img src="/comuvigia.png" alt="Logo" className="auth-loading-logo" />
          <IonSpinner name="crescent" />
          <p>Verificando autenticación...</p>
        </div>
      </IonContent>
    );

  if (user) return <Redirect to="/home" />;

  return <Route {...rest}>{children}</Route>;
};
