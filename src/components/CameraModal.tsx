import React from 'react';
import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButton } from '@ionic/react';

export function CameraModal({ open, onClose, camera }) {
  if (!camera) return null;
  return (
    <IonModal isOpen={open} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{camera.nombre}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <p>{camera.direccion}</p>
        {/* Aquí va el player de video */}
        <video controls autoPlay style={{ width: '100%' }} src={camera.linkCamara || "https://www.w3schools.com/html/mov_bbb.mp4"} />
        <IonButton onClick={onClose}>Cerrar</IonButton>
      </IonContent>
    </IonModal>
  );
}
