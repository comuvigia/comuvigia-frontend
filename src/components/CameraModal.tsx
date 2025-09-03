import React from 'react';
import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButton } from '@ionic/react';
import { Camera } from '../types/Camera';
import axios from 'axios';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(BACKEND_URL);
const IA_URL = import.meta.env.VITE_IA_URL;

interface CameraModalProps {
    camera: Camera | null;
    open: boolean;
    onClose: () => void;
}


export function CameraModal({ open, onClose, camera }: CameraModalProps) {
  if (!camera) return null;
  const CAMERA_URL = import.meta.env.VITE_CAMERA_URL; 
  const url_camara = CAMERA_URL+`/video_feed/${camera.id}`;

  const esExterna = (url: string) => url.startsWith("http://") || url.startsWith("https://");

    // Función para cerrar con llamada al backend
  const handleRevisarWhitBackend = async () => {
    try {
      
      await axios.post(`${IA_URL}/api/casos_prueba`, {
        delito: camera.nombre,
      });
    } catch (error) {
      console.error('Error al notificar al backend', error);
    }
    onClose();
  };

  const casosPrueba = []
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
        {(!esExterna(camera.link_camara || "https://www.w3schools.com/html/mov_bbb.mp4")) && <IonButton onClick={handleRevisarWhitBackend}>Revisar</IonButton> }
        {/*
        <img
          style={{ width: '100%', maxHeight: 350, objectFit: 'contain', background: '#fff', border: '3px solid #000', borderLeft: 'none', borderRight: 'none' }}
          src={url_camara || 'video_no_disponible_3.png'}
        />*/}
        <IonButton onClick={onClose}>Cerrar</IonButton>
      </IonContent>
    </IonModal>
  );
}
