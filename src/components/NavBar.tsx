import React, { useState, useEffect } from 'react';
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
  IonMenuButton,
  IonAlert
} from '@ionic/react';
import { notificationsOutline, personOutline, menuOutline, addCircleOutline, exitOutline, helpCircleOutline  } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router';
import './NavBar.css';
import { useUser } from '../UserContext';
import axios from 'axios';
import CameraSearch from './CameraSearch';
import { Camera } from '../types/Camera';

interface NavBarProps {
  unseenCount: number;
  onShowNotifications?: (e: React.MouseEvent) => void;
  onShowMantenedores?: (e: React.MouseEvent) => void;
  onShowTutorial?: () => void;
  searchText?: string;
  onSearchChange?: (text: string, results: Camera[]) => void;
  searchContainerRef?: React.RefObject<HTMLDivElement | null>;
  cameras?: Camera[];
}

export function Navbar({ unseenCount, onShowNotifications, onShowMantenedores, onShowTutorial, cameras, searchText, onSearchChange, searchContainerRef}: NavBarProps) {
  const history = useHistory();
  const location = useLocation();
  const { user, setUser } = useUser();
  const [showExitUser, setShowExitUser] = useState(false);
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
              <IonItem routerLink='/feed_camaras' className='item-nav'>Feed Cámaras</IonItem>
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
              <IonMenuButton id='navbar-menu' autoHide={false}>
                <IonIcon slot="icon-only" icon={menuOutline} />
              </IonMenuButton>
            )}
          </IonButtons>
          
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flex: 1, gap: '16px' }}>
              <img onClick={() => history.push('/home')} src="/comuvigia.png" alt="Logo" style={{ height: '50px', paddingLeft: '10px', cursor: 'pointer'}} />
            <div ref={searchContainerRef}
            style={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center',
              position: 'relative'
            }}>
            { (location.pathname === '/home' || location.pathname.startsWith('/home')) && (
              <>
                <CameraSearch 
                  cameras={cameras ?? []}
                  searchText={searchText ?? ''}
                  onSearchChange={onSearchChange ?? (() => {})}
                />
              </>
            )}

            </div>
          </div>
          <IonButtons slot="end">
            {/*
            <IonButton onClick={onShowMantenedores}>
              <IonIcon icon={addCircleOutline} />
            </IonButton>
            */}
            {user && (user.rol == 1 || user.rol == 2) && (
              <IonButton onClick={onShowNotifications}>
                <IonIcon id='notifications-icon' icon={notificationsOutline} />
                {unseenCount > 0 && <IonBadge color="danger">{unseenCount}</IonBadge>}
              </IonButton>
            )}
            {user && (user.rol == 1 || user.rol == 2) && (
              <IonButton onClick={onShowTutorial}>
                <IonIcon icon={helpCircleOutline} />
              </IonButton>
            )}
            <IonButton 
              //color="danger" 
              //size="large"
              style={{fontSize: '19px'}}
              onClick={() => {setShowExitUser(true)}} 
            >
              <IonIcon icon={exitOutline} size='medium'/>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonAlert
        isOpen={showExitUser}
        onDidDismiss={() => {
          setShowExitUser(false);
        }}
        header={'Salir del sistema'}
        message={`¿Estás seguro de salir del sistema?.`}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'alert-button-confirm',
          },
          {
            text: 'Salir',
            role: 'destructive',
            handler: handleLogout,
            cssClass: 'alert-button-cancel',
          }
        ]}
      />
    </>
  );
}