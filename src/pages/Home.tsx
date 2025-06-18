import React, { useEffect, useState }from 'react';
import MapView from '../components/MapView';
import { CameraModal } from '../components/CameraModal';
import { Navbar } from '../components/NavBar';
import { Camera } from '../types/Camera';
import {
  IonPopover,
  IonContent
} from '@ionic/react';
import {NotificacionesPopover  } from '../components/Notificaciones';
import { fetchCameras } from '../services/cameraService';
import { useAlertStore } from '../stores/useAlertStore';
import { fetchUltimasAlertas, fetchUnseenAlertas, marcarAlertaVista } from '../services/alertaService';
import { useRealtimeAlert } from '../hooks/useRealtimeAlert';

function Home() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [event, setEvent] = useState<MouseEvent | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingC, setLoadingC] = useState(true);
  const [errorC, setErrorC] = useState<string | null>(null);
  const { alerts, unseenAlerts, setAlerts, setUnseenAlerts, markAsSeen } = useAlertStore();
  useRealtimeAlert();

  // Carga las alertas al montar
  useEffect(() => {
    fetchUltimasAlertas().then(setAlerts).catch(console.error);
    fetchUnseenAlertas().then(setUnseenAlerts).catch(console.error);
  }, [setAlerts, setUnseenAlerts]);

  // Marcar alerta como vista
  const handleMarkAsSeen = (id: number) => {
    marcarAlertaVista(id).then(() => markAsSeen(id));
  };

  // Listado de camaras
  useEffect(() => {
    setLoadingC(true);
    fetchCameras()
      .then(setCameras)
      .catch(err => setErrorC(err.message))
      .finally(() => setLoadingC(false));
  }, []);
  
  // Si hay error en las cámaras o alertas, mostrar mensaje
  if (loadingC) return <div>Cargando cámaras...</div>;
  if (errorC) return <div style={{ color: 'red' }}>Error: {errorC}</div>;

  const handleShowModal = (camera: Camera) => {
    setSelectedCamera(camera);
    setModalOpen(true);
  };

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
  // Calcular alertas no vistas
  const unseenCountAlerts = unseenAlerts.length;

  return (
    <div>
      <Navbar unseenCount={unseenCountAlerts} onShowNotifications={handleShowNotifications} />
      
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
                handleMarkAsSeen(alert.id)
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
