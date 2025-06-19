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
  const CAMERA_URL = import.meta.env.VITE_CAMERA_URL; 
  return (
    <IonModal isOpen={open} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{camera.nombre}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <p>{camera.direccion}</p>
        {/*<video controls autoPlay style={{ width: '100%' }} src={camera.link_camara || "https://www.w3schools.com/html/mov_bbb.mp4"} />
        <IonButton onClick={onClose}>Cerrar</IonButton>*/}
        <img
          style={{ width: '100%', maxHeight: 400, objectFit: 'contain', background: '#000' }}
          src={camera.link_camara || `${CAMERA_URL}/video_feed`}
          
        />
        <IonButton onClick={onClose}>Cerrar</IonButton>
      </IonContent>
    </IonModal>
  );
}
