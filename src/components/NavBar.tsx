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
              <img src="/comuvigia.png" alt="Logo" style={{ height: '60px'}}/>
            </div>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem routerLink='/home'>Inicio</IonItem>
            <IonItem routerLink='/historial'>Historial</IonItem>
            <IonItem routerLink='/grabaciones'>Grabaciones</IonItem>
            <IonItem routerLink='/reportes'>Reportes</IonItem>
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
              <img onClick={() => history.push('/home')} src="/comuvigia.png" alt="Logo" style={{ height: '60px', paddingLeft: '10px', paddingBottom: '5px', cursor: 'pointer'}} />
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