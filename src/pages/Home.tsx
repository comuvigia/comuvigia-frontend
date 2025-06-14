import React, { useEffect, useState } from 'react';
import MapView from '../components/MapView';
import { CameraModal } from '../components/CameraModal';
import { Navbar } from '../components/NavBar';
import { Camera } from '../types/Camera';
import {
  IonPopover,
  IonContent
} from '@ionic/react';
import { Alert } from '../types/Alert';
import {NotificacionesPopover  } from '../components/Notificaciones';
import axios from 'axios';

// URL del backend cargado desde archivo .env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Home() {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [event, setEvent] = useState<MouseEvent | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Carga de alertas desde backend
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    axios.get<Alert[]>(`${BACKEND_URL}/api/alertas`)
      .then(response => {
        setAlerts(response.data);
      })
      .catch(error => {
        console.error('Error al obtener alertas:', error);
      })
      .finally(() => setLoadingAlerts(false));
  }, []);

  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loadingCameras, setLoadingCameras] = useState(true);

  // Carga de camaras desde backend
  useEffect(() => {
    axios.get<Camera[]>(`${BACKEND_URL}/api/camaras`)
      .then(response => {
        setCameras(response.data);
      })
      .catch(error => {
        console.error('Error al obtener cámaras:', error);
      })
      .finally(() => setLoadingCameras(false));
  }, []);

  if (loadingCameras || loadingAlerts) return <div>Cargando datos...</div>;

  const handleShowModal = (camera: Camera) => {
    setSelectedCamera(camera);
    setModalOpen(true);
  };

  // Calcular alertas no vistas (esto debe venir desde backend filtrado)
  const unseenAlerts = alerts.filter(a => !a.estado).length;

  // Handler para mostrar popover en el sitio del click (la campana)
  const handleShowNotifications = (e: React.MouseEvent) => {
    setEvent(e.nativeEvent);
    setPopoverOpen(true);
    // Marcar todas como vistas
    setAlerts(alerts.map(a => ({ ...a, estado: true })));
  };

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true, // Formato 12h (AM/PM)
    }).format(fecha);
  };

  return (
    <div>
      <Navbar unseenCount={unseenAlerts} onShowNotifications={handleShowNotifications} />
      
      <IonPopover
        isOpen={popoverOpen}
        event={event}
        onDidDismiss={() => setPopoverOpen(false)}
        side="bottom"  // Aparece debajo del icono
        alignment="end" // Ajusta al lado derecho del botón
      >
        <IonContent>
          <NotificacionesPopover
            alerts={alerts}
            formatearFecha={formatearFecha}
            handleAccion={(alert, accion) => {
              // Aquí actualiza el estado de la alerta según la acción
              if (accion === "leida") {
                // Cambiar estado a leído
                console.log('Leída:', alert.id);
              } else if (accion === "falso_positivo") {
                // Cambiar estado a falso positivo, o eliminar
                console.log('Falso positivo:', alert.id);
              }
            }}
          />
        </IonContent>
      </IonPopover>
      <MapView cameras={ cameras } onShowModal={handleShowModal}/>
      <CameraModal open={modalOpen} onClose={() => setModalOpen(false)} camera={selectedCamera} />
    </div>
  );
}
export default Home;
