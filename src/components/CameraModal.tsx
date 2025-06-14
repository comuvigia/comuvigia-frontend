import React from 'react';
import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButton } from '@ionic/react';
import { Camera } from '../types/Camera';

interface CameraModalProps {
    camera: Camera | null;
    open: boolean;
    onClose: () => void;
}
export function CameraModal({ open, onClose, camera }: CameraModalProps) {
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
        <video controls autoPlay style={{ width: '100%' }} src={camera.link_camara || "https://www.w3schools.com/html/mov_bbb.mp4"} />
        <IonButton onClick={onClose}>Cerrar</IonButton>
      </IonContent>
    </IonModal>
  );
}
