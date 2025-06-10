import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonBadge, IonIcon } from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';
import React from 'react';

export function Navbar({ unseenCount, onShowNotifications }) {
  return (
    <IonHeader>
      <IonToolbar>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="../../public/comuvigia.png" alt="Logo" style={{ height: '60px', paddingLeft: '10px', paddingBottom: '5px'}} />
            {/*<IonTitle style={{'color': '#095187', 'fontWeight': 'bold', 'padding': 0}}>ComuVigIA</IonTitle>*/}
        </div>
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
