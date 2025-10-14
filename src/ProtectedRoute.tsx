import React from 'react';
import { Redirect } from 'react-router-dom';
import { useUser } from './UserContext';
import { IonContent, IonSpinner } from '@ionic/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, checkingAuth } = useUser();

  if (checkingAuth)
    return (
      <IonContent className="ion-padding ion-text-center loading-screen">
        <div className="loading-container">
          <img src="/public/comuvigia.png" alt="Logo" className="loading-logo" />
          <IonSpinner name="crescent" />
          <p>Verificando autenticación...</p>
        </div>
      </IonContent>
    );

  if (!user) return <Redirect to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Redirect to="/home" />;
  }

  return <>{children}</>;
};
