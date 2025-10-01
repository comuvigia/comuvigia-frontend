import React from 'react';
import { 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonButton, 
  IonBadge, 
  IonIcon, 
  IonMenu, 
  IonContent, 
  IonList, 
  IonItem, 
  IonTitle,
  IonMenuButton
} from '@ionic/react';
import { notificationsOutline, personOutline, menuOutline, addCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import './NavBar.css';
import { useUser } from '../UserContext';
import axios from 'axios';

interface NavBarProps {
    unseenCount: number;
    onShowNotifications?: (e: React.MouseEvent) => void;
    onShowMantenedores?: (e: React.MouseEvent) => void;
}

export function Navbar({ unseenCount, onShowNotifications, onShowMantenedores }: NavBarProps) {
  const history = useHistory();
  const { user, setUser } = useUser();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      history.replace('/login');
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      {/* Menú Hamburguesa */}
      {user && (user.rol == 1 || user.rol == 2) && (
        <IonMenu side="start" contentId="main-content">
          <IonHeader>
            <IonToolbar>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/comuvigia.png" alt="Logo" style={{ height: '50px'}}/>
              </div>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList style={{ padding: 0, marginTop: '20px' }}>
              <IonItem routerLink='/home' className='item-nav'>Inicio</IonItem>
              <IonItem routerLink='/historial' className='item-nav'>Historial</IonItem>
              <IonItem routerLink='/grabaciones' className='item-nav'>Grabaciones</IonItem>
              <IonItem routerLink='/reportes' className='item-nav'>Reportes</IonItem>
              {/*<IonItem>Perfil</IonItem>
              <IonItem>Cerrar sesión</IonItem>*/}
            </IonList>
          </IonContent>
        </IonMenu>
      )}

      {/* Navbar */}
      <IonHeader translucent={true} id="main-content">
        <IonToolbar>
          <IonButtons slot="start">
            {/* Botón del menú hamburguesa */}
            {user && (user.rol == 1 || user.rol == 2) && (
              <IonMenuButton autoHide={false}>
                <IonIcon slot="icon-only" icon={menuOutline} />
              </IonMenuButton>
            )}
          </IonButtons>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
              <img onClick={() => history.push('/home')} src="/comuvigia.png" alt="Logo" style={{ height: '50px', paddingLeft: '10px', cursor: 'pointer'}} />
          </div>
          
          <IonButtons slot="end">
            {/*
            <IonButton onClick={onShowMantenedores}>
              <IonIcon icon={addCircleOutline} />
            </IonButton>
            */}
            <IonButton 
              color="danger" 
              size="small"
              onClick={handleLogout} 
            >
              Cerrar sesión
            </IonButton>
            {user && (user.rol == 1 || user.rol == 2) && (
              <IonButton onClick={onShowNotifications}>
                <IonIcon icon={notificationsOutline} />
                {unseenCount > 0 && <IonBadge color="danger">{unseenCount}</IonBadge>}
              </IonButton>
            )}
          </IonButtons>
        
        </IonToolbar>
      </IonHeader>
    </>
  );
}