import React, { useEffect, useState } from 'react';
import MapView from '../components/MapView';
import { CameraModal } from '../components/CameraModal';
import { Navbar } from '../components/NavBar';
import { Camera } from '../types/Camera';
import {
  IonPopover,
  IonContent
} from '@ionic/react';
import {NotificacionesPopover  } from '../components/Notificaciones';
// Yo
import axios from 'axios';
import { io } from 'socket.io-client';

// URL del backend cargado desde archivo .env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(BACKEND_URL);
//Claudio
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
  // Yo  
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
  }, []);

  const [ unseenAlerts,  setUnseenAlerts ] = useState<Alert[]>([])

  useEffect(() => {
    axios.get<Alert[]>(`${BACKEND_URL}/api/alertas/no-vistas`)
      .then(response => {
        setUnseenAlerts(response.data);
      })
      .catch(error => {
        console.error('Error al obtener alertas no vistas:', error);
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
  
  // Manejo WebSocket
  useEffect(() => {
    socket.on('nueva-alerta', (alerta: Alert) => {
      // Agrega la nueva alerta a la lista general y no vistas
      setAlerts(prev => [alerta, ...prev]);
      setUnseenAlerts(prev => [alerta, ...prev]);
    });

    return () => {
      socket.off('nueva-alerta');
    };
  }, []);

  if (loadingCameras || loadingAlerts) return <div>Cargando datos...</div>;
// Claudio
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


  // Calcular alertas no vistas (esto debe venir desde backend filtrado)
  //const unseenAlerts = alerts.filter(a => !a.estado).length;

  // Handler para mostrar popover en el sitio del click (la campana)
  const handleShowNotifications = (e: React.MouseEvent) => {
    setEvent(e.nativeEvent);
    setPopoverOpen(true);
    // Marcar todas como vistas
    //setUnseenAlerts([]);
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

  const marcarVistaAlerta = async (
    alerta: Alert,
    nuevoEstado: number,
    setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>,
    setUnseenAlerts: React.Dispatch<React.SetStateAction<Alert[]>>
  ) => {
    try {
      await axios.post(`${BACKEND_URL}/api/alertas/marcar-vista/${alerta.id}`, {
        estado: nuevoEstado,
      });

      setAlerts(prev =>
        prev.map(a =>
          a.id === alerta.id ? { ...a, estado: nuevoEstado } : a
        )
      );

      setUnseenAlerts(prev => prev.filter(a => a.id !== alerta.id));

    } catch (error) {
      console.error('Error al actualizar alerta:', error);
    }
  };

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
            alerts={
              [...alerts].sort((a, b) => {
                // Se ordena por estado: no vistas (estado === 0) primero
                if (a.estado !== b.estado) {
                  return a.estado === 0 ? -1 : 1;
                }
                // Si tienen el mismo estado, ordenamos por hora_suceso descendente
                return new Date(b.hora_suceso).getTime() - new Date(a.hora_suceso).getTime();
              })
            }
            formatearFecha={formatearFecha}
            // Yo
            handleAccion={async (alert, accion) => {
              const nuevoEstado = accion === "leida" ? 1 : 2;
              await marcarVistaAlerta(alert, nuevoEstado, setAlerts, setUnseenAlerts);
            }
/* Claudio
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
                */
            }
          />
        </IonContent>
      </IonPopover>
      <MapView cameras={ cameras } onShowModal={handleShowModal}/>
      <CameraModal open={modalOpen} onClose={() => setModalOpen(false)} camera={selectedCamera} />
    </div>
  );
}
export default Home;
