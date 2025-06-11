import React from 'react';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonBadge, IonIcon } from '@ionic/react';
import { notificationsOutline, personOutline } from 'ionicons/icons';

interface NavBarProps {
    unseenCount: number;
    onShowNotifications: (e: React.MouseEvent) => void;
}
export function Navbar({ unseenCount, onShowNotifications }: NavBarProps) {
  return (
    <IonHeader translucent={true}>
      <IonToolbar>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="../../public/comuvigia.png" alt="Logo" style={{ height: '60px', paddingLeft: '10px', paddingBottom: '5px'}} />
        </div>
        <IonButtons slot="end">
          <IonButton onClick={onShowNotifications}>
            <IonIcon icon={notificationsOutline} />
            {unseenCount > 0 && <IonBadge color="danger">{unseenCount}</IonBadge>}
          </IonButton>
        </IonButtons>
        <IonButtons slot="end">
          <IonButton>
            <IonIcon icon={personOutline} />
            
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
}
