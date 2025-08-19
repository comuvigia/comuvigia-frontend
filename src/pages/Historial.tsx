import React, { useEffect, useState } from 'react';
import { CameraModal } from '../components/CameraModal';
import { Navbar } from '../components/NavBar';
import { Camera } from '../types/Camera';
import { Alert } from '../types/Alert';
import {
    IonLabel,
    IonList,
    IonItem,
    IonPopover,
    IonContent,
    IonButton,
    IonModal,
    IonTitle,
    IonSpinner
} from '@ionic/react';
import { NotificacionesPopover } from '../components/Notificaciones';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Historial.css';

// URL del backend cargado desde archivo .env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(BACKEND_URL);

function Historial(){
    const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [event, setEvent] = useState<MouseEvent | undefined>(undefined);
    const [modalOpen, setModalOpen] = useState(false);
    const [alertaSeleccionada, setAlertaSeleccionada] = useState<Alert | null>(null);
    const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
    const [error, setError] = useState('');

    // Carga de camaras desde backend
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [loadingCameras, setLoadingCameras] = useState(true);
    const fetchCameras = async () => {
      try {
        setLoadingCameras(true);
        const response = await axios.get<Camera[]>(`${BACKEND_URL}/api/camaras/`);
        console.log('Respuesta de cámaras:', response.data);
        setCameras(response.data);
        if (response.data.length > 0) {
            setSelectedCamera(response.data[0]);
        }
      } catch (err) {
        setError('Error al cargar las cámaras');
        console.error(err);
      } finally {
        setLoadingCameras(false);
      }
    };

    // Carga de alertas desde backend
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loadingAlerts, setLoadingAlerts] = useState(true);
    const fetchAlerts = async (cameraId: number) => {
      try {
        console.log('Cargando alertas para cámara:', cameraId);
        setLoadingAlerts(true);
        const response = await axios.get<Alert[]>(`${BACKEND_URL}/api/alertas/camara/${cameraId}`);
        console.log('Respuesta de alertas:', response.data);
        //const filteredAlerts = response.data.filter(alert => alert.id_camara === cameraId);
        setAlerts(response.data);
      } catch (err) {
        setError('Error al cargar las alertas');
        console.error(err);
      } finally {
        setLoadingAlerts(false);
      }
    };

    // Carga de alertas no vistas desde backend
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

    // Handler para mostrar popover en el sitio del click (la campana)
    const handleShowNotifications = (e: React.MouseEvent) => {
        setEvent(e.nativeEvent);
        setPopoverOpen(true);
    };

    // Handler para ver descripción de alerta
    const handleVerDescripcion = (alerta: Alert) => {
        setPopoverOpen(false); // Cierra el popover
        setAlertaSeleccionada(alerta);
        setMostrarDescripcion(true); // Muestra la sección de detalle
    };

    // Handler para ver alertas de camara seleccionada
    const handleCameraClick = (camera: Camera) => {
        setSelectedCamera(camera);
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

    // Función para marcar alerta como vista o no vista
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

    // Mapeo de estados de alerta
    const estados: { [key: number]: string } = {
        0: "En Observación",
        1: "Confirmada",
        2: "Falso Positivo"
    };

    // Manejo WebSocket para recibir nuevas alertas
    useEffect(() => {
        socket.on('nueva-alerta', (alerta: Alert) => {
        // Agrega la nueva alerta a la lista general y no vistas
        setAlerts(prev => [alerta, ...prev]);
        setUnseenAlerts(prev => [alerta, ...prev]);
        // Incrementar contador de alertas de la cámara correspondiente
        setCameras(prevCameras =>
            prevCameras.map(c =>
            c.id === alerta.id_camara
                ? { ...c, total_alertas: (c.total_alertas ?? 0) + 1 }
                : c
            )
        );
        });

        return () => {
        socket.off('nueva-alerta');
        };
    }, []);

    // Cargar cámaras al montar el componente
    useEffect(() => {
      fetchCameras();
    }, []);

    // Cargar alertas cuando cambia la cámara seleccionada
    useEffect(() => {
      if (selectedCamera) {
        fetchAlerts(selectedCamera.id);
      }
    }, [selectedCamera]);

    return (
        <div>
            {loadingCameras || loadingAlerts ? (
                <div className="full-page-loading">
                    <IonSpinner name="crescent" />
                    <p>Cargando datos...</p>
                </div>
            ) : (
                <>
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
                          handleAccion={async (alert, accion) => {
                          const nuevoEstado = accion === "leida" ? 1 : 2;
                          await marcarVistaAlerta(alert, nuevoEstado, setAlerts, setUnseenAlerts);
                          }}
                          onVerDescripcion={(alerta) => handleVerDescripcion(alerta)}
                      />
                  </IonContent>
                  </IonPopover>
                  <CameraModal open={modalOpen} onClose={() => setModalOpen(false)} camera={selectedCamera} />
                  <IonModal isOpen={mostrarDescripcion} onDidDismiss={() => setMostrarDescripcion(false)}>
                      <IonContent className="ion-padding">
                          <h2>Alerta {alertaSeleccionada?.id}</h2>
                          <p>Score: {alertaSeleccionada?.score_confianza} &nbsp; | &nbsp; Cámara: {alertaSeleccionada?.id_camara} &nbsp; | &nbsp; Estado: {alertaSeleccionada?.estado !== undefined && estados[alertaSeleccionada.estado]}</p>
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
                                  borderRadius: '12px',
                                  '--background': '#1B4965',
                              }}
                          >
                              Editar descripción
                          </IonButton>
                          <br />
                          <IonButton color="medium"
                              expand="block"
                              onClick={() => setMostrarDescripcion(false)}
                              style={{
                              padding: '16px 24px',
                              fontSize: '1.1rem',
                              borderRadius: '12px',
                              }}
                          >
                              Cerrar
                          </IonButton>
                      </IonContent>
                  </IonModal>
                  <div className="containerHistorial">
                      <div style={{ width: '500px', paddingRight: '15px' }}>
                          <IonTitle>Cámaras</IonTitle>
                          {loadingCameras ? (
                          <div className="loading-container">
                              <IonSpinner name="crescent" />
                              <p>Cargando cámaras...</p>
                          </div>
                          ) : error ? (
                          <p className="error-message">{error}</p>
                          ) : (
                          <IonList>
                              {cameras.map((camera) => (
                              <IonItem 
                                  key={camera.id} 
                                  onClick={() => handleCameraClick(camera)}
                                  className={selectedCamera?.id === camera.id ? 'selected-camera' : 'camera-item'}
                              >
                                  <IonLabel>
                                  <h2>{camera.nombre}</h2>
                                  <p>{camera.direccion}</p>
                                  </IonLabel>
                              </IonItem>
                              ))}
                          </IonList>
                          )}
                      </div>
                  
                      <hr style={{ height: '500px', borderWidth: '1px' }} />
                  
                      <div style={{ 
                          width: '-moz-available',
                          display: 'flex',
                          flexDirection: 'column',
                          height: '500px'
                      }}>
                          <IonTitle style={{ flexShrink: 0 }}>
                          Alertas de {selectedCamera ? selectedCamera.nombre : 'Ninguna cámara seleccionada'}
                          </IonTitle>
                          
                          <div style={{
                            overflowY: 'auto',
                            flexGrow: 1,
                            marginTop: '10px',
                            paddingRight: '8px'
                          }}>
                          {loadingAlerts ? (
                              <div className="loading-container">
                              <IonSpinner name="crescent" />
                              <p>Cargando alertas...</p>
                              </div>
                          ) : error ? (
                              <p className="error-message">{error}</p>
                          ) : (
                              <IonList style={{ paddingBottom: '20px' }}>
                              {alerts.length > 0 ? (
                                  alerts.map((alert) => (
                                  <IonItem key={alert.id}>
                                      <IonLabel>
                                      <h2>Alerta {alert.id}</h2>
                                      <p>{new Date(alert.hora_suceso).toLocaleString()}</p>
                                      <p>{alert.mensaje}</p>
                                      </IonLabel>
                                  </IonItem>
                                  ))
                              ) : (
                                  <IonItem>
                                  <IonLabel>No hay alertas para esta cámara</IonLabel>
                                  </IonItem>
                              )}
                              </IonList>
                          )}
                          </div>
                      </div>
                  </div>
                </> 
            )}
        </div>
    );
}
export default Historial;