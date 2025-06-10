import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonBadge, IonIcon } from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';
import React from 'react';

export function Navbar({ unseenCount, onShowNotifications }) {
  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>ComuVigIA</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={onShowNotifications}>
            <IonIcon icon={notificationsOutline} />
            {unseenCount > 0 && <IonBadge color="danger">{unseenCount}</IonBadge>}
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
}
