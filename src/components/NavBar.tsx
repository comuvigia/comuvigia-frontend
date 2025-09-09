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
import { notificationsOutline, personOutline, menuOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import './NavBar.css';

interface NavBarProps {
    unseenCount: number;
    onShowNotifications: (e: React.MouseEvent) => void;
}

export function Navbar({ unseenCount, onShowNotifications }: NavBarProps) {
  const history = useHistory();
  return (
    <>
      {/* Menú Hamburguesa */}
      <IonMenu side="start" contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/comuvigia.png" alt="Logo" style={{ height: '35px'}}/>
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

      {/* Navbar */}
      <IonHeader translucent={true} id="main-content">
        <IonToolbar>
          <IonButtons slot="start">
            {/* Botón del menú hamburguesa */}
            <IonMenuButton autoHide={false}>
              <IonIcon slot="icon-only" icon={menuOutline} />
            </IonMenuButton>
          </IonButtons>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
              <img onClick={() => history.push('/home')} src="/comuvigia.png" alt="Logo" style={{ height: '35px', paddingLeft: '10px', cursor: 'pointer'}} />
          </div>
          
          <IonButtons slot="end">
            <IonButton onClick={onShowNotifications}>
              <IonIcon icon={notificationsOutline} />
              {unseenCount > 0 && <IonBadge color="danger">{unseenCount}</IonBadge>}
            </IonButton>
          </IonButtons>
        
        </IonToolbar>
      </IonHeader>
    </>
  );
}