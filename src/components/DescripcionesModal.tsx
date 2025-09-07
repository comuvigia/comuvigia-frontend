import React, { useState } from 'react';
import { IonModal, IonContent, IonButton } from '@ionic/react';
import { Camera } from '../types/Camera';
import { Alert } from '../types/Alert';
import axios from 'axios';

interface CameraModalProps {
    camera: Camera | null;
    open: boolean;
    onClose: () => void;
}

export function DescripcionesModal({ open, onClose }: CameraModalProps) {
    const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
    const [alertaSeleccionada, setAlertaSeleccionada] = useState<Alert | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; 

    return (
        <IonModal isOpen={open} onDidDismiss={onClose}>
            <IonContent className="ion-padding">
            <h2>Alerta {alertaSeleccionada?.id}</h2>
            <p>Score: {alertaSeleccionada?.score_confianza} &nbsp; | &nbsp; Cámara: {alertaSeleccionada?.id_camara} &nbsp; | &nbsp; Estado: {alertaSeleccionada?.estado}</p>
            <h2>Descripción del Suceso</h2>
            {alertaSeleccionada?.descripcion_suceso ? (
                <p>{alertaSeleccionada.descripcion_suceso}</p>
            ) : (
                <p style={{ fontStyle: 'italic', color: '#888' }}>Esta alerta no tiene descripción</p>
            )}
            <br />
            <IonButton
                expand="block"
                onClick={() => {
                const nueva = prompt(
                    "Editar descripción:",
                    alertaSeleccionada?.descripcion_suceso || ""
                );
                if (nueva !== null && alertaSeleccionada) {
                    axios
                    .put(`${BACKEND_URL}/api/alertas/editar-descripcion/${alertaSeleccionada.id}`, {
                        descripcion_suceso: nueva
                    })
                    .then(() => {
                        setAlerts(prev =>
                        prev.map(a =>
                            a.id === alertaSeleccionada.id
                            ? { ...a, descripcion_suceso: nueva }
                            : a
                        )
                        );
                        setAlertaSeleccionada(prev =>
                        prev ? { ...prev, descripcion_suceso: nueva } : prev
                        );
                    });
                }
                }}
                style={{
                padding: '16px 24px',
                fontSize: '1.1rem',
                borderRadius: '15px',
                '--background': '#1B4965'
                }}
            >
                Editar descripción
            </IonButton>
            
            <IonButton color="medium"
                expand="block"
                onClick={() => setMostrarDescripcion(false)}
                style={{
                padding: '16px 24px',
                fontSize: '1.1rem',
                borderRadius: '15px',
                }}
            >
                Cerrar
            </IonButton>
            </IonContent>
        </IonModal>
    );
}
