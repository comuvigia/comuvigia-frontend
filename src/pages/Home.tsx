import React, { useState } from 'react';
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

const initialAlerts: Alert[] = [
    { idAlerta: 1, idCamara: 1, mensaje: 'Merodeo detectado en Calle 1', horaSuceso: "2025-06-08T16:39:00Z", scoreConfianza: 70.5, estado: false },
    { idAlerta: 2, idCamara: 1, mensaje: 'Merodeo detectado en Calle 2', horaSuceso: "2025-06-09T17:31:00Z", scoreConfianza: 75.3, estado: false},
    { idAlerta: 3, idCamara: 1, mensaje: 'Merodeo detectado en Calle 3', horaSuceso: "2025-06-06T19:35:00Z", scoreConfianza: 80.5, estado: true},
  ];

function Home() {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [event, setEvent] = useState<MouseEvent | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);

  // Listado de camaras
  const cameras: Camera[] = [
    { idCamara: 1, posicion: [-33.52, -70.603], estadoCamara: true, nombre: 'Cámara Plaza', linkCamara: '', direccion: 'Avenida 123', ultimaConexion : "2024-06-09T19:30:00Z" },
    { idCamara: 2, posicion: [-33.525, -70.6], estadoCamara: false, nombre: 'Cámara Sur', linkCamara: '', direccion: 'Avenida 123', ultimaConexion : "2024-06-09T19:30:00Z" },
    { idCamara: 3, posicion: [-33.511, -70.59], estadoCamara: true, nombre: 'Cámara Centro', linkCamara: '', direccion: 'Avenida 123', ultimaConexion : "2024-06-09T19:30:00Z" },
  ];

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
                console.log('Leída:', alert.idAlerta);
              } else if (accion === "falso_positivo") {
                // Cambiar estado a falso positivo, o eliminar
                console.log('Falso positivo:', alert.idAlerta);
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
