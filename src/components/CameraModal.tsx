import React, { useState, useEffect } from 'react';
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
    const [esStreaming, setEsStreaming] = useState(false);
    const CAMERA_URL = import.meta.env.VITE_CAMERA_URL; 
    
    // Mover los hooks antes de cualquier condicional
    useEffect(() => {
        if (camera && camera.link_camara_externo) {
            // Detectar si es un streaming (basado en la extensión o patrón de URL)
            const esStreamingUrl = (url: string) => {
                // Extensiones comunes de video (no streaming)
                const extensionesVideo = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv'];
                
                // Patrones comunes de streaming
                const patronesStreaming = [
                    '/stream',
                    '/live',
                    '/hls',
                    '.m3u8',
                    '/dash',
                    '.mpd',
                    'rtsp://',
                    'http://',
                    'https://'
                ];

                const urlLower = url.toLowerCase();
                
                // Si tiene extensión de video común, no es streaming
                if (extensionesVideo.some(ext => urlLower.includes(ext))) {
                    return false;
                }
                
                // Si coincide con patrones de streaming
                return patronesStreaming.some(patron => urlLower.includes(patron));
            };

            setEsStreaming(esStreamingUrl(camera.link_camara_externo));
        }
    }, [camera]);

    if (!camera) return null;

    const url_camara = CAMERA_URL + `/video_feed/${camera.id}`;
    const videoUrl = camera.link_camara_externo || "https://www.w3schools.com/html/mov_bbb.mp4";

    const esExterna = (url: string) => url.startsWith("http://") || url.startsWith("https://");

    // Función para cerrar con llamada al backend
    const handleRevisarWhitBackend = async () => {
        try {
            // Usando fetch (recomendado si ya estás usando fetch en el backend)
            const response = await fetch(`${BACKEND_URL}/casos_prueba?delito=${encodeURIComponent(camera.link_camara)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            });

            if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success) {
            console.log('Notificación exitosa al backend:', result);
            } else {
            console.warn('La solicitud no fue exitosa:', result.message);
            }

        } catch (error) {
            console.error('Error al notificar al backend', error);
            
            // Opcional: Mostrar alerta al usuario
            // alert('Error al conectar con el servidor. Intente nuevamente.');
        } finally {
            onClose();
        }
        };

    return (
        <IonModal isOpen={open} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{camera.nombre}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <p>{camera.direccion}</p>
                
                {/* Mostrar imagen para streaming HTTP */}
                {camera.link_camara_externo !== "" ? (
                  // Caso con streaming externo: mostrar imagen
                  <>
                    <img
                        style={{ 
                        width: '100%', 
                        maxHeight: 350, 
                        objectFit: 'contain', 
                        background: '#fff', 
                        border: '3px solid #000', 
                        borderLeft: 'none', 
                        borderRight: 'none' 
                        }}
                        src={camera.link_camara_externo}
                        alt="Streaming de cámara"
                    /><IonButton onClick={onClose}>Cerrar</IonButton>
                  </>
                ) : (
                  // Caso sin externo: usar link_camara en <video>
                  <>
                    <video 
                    controls 
                    autoPlay 
                    style={{ width: '100%' }} 
                    src={camera.link_camara}
                    />
                    <IonButton onClick={handleRevisarWhitBackend}>Revisar</IonButton>
                    <IonButton onClick={onClose}>Cerrar</IonButton>
                  </>
                  
                )}
            </IonContent>
        </IonModal>
    );
}