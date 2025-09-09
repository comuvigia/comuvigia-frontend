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
    IonSpinner,
    IonChip,
    IonIcon
} from '@ionic/react';
import {
  alertCircle,
  time,
  refreshCircle,
  checkmarkCircle,
  closeCircleOutline,
  filter,
  checkmarkDoneCircle,
  trash
} from 'ionicons/icons';
import { NotificacionesPopover } from '../components/Notificaciones';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Historial.css';

// URL del backend cargado desde archivo .env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CAMERA_URL = import.meta.env.VITE_CAMERA_URL;
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
    const [downloadingClip, setDownloadingClip] = useState<string | null>(null);
    const fetchCameras = async () => {
        try {
            setLoadingCameras(true);
            const response = await axios.get<Camera[]>(`${BACKEND_URL}/api/camaras/`);
            //console.log('Respuesta de cámaras:', response.data);
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
    useEffect(() => {
        axios.get<Alert[]>(`${BACKEND_URL}/api/alertas`)
        .then(response => {
            setAlerts(response.data);
        })
        .catch(error => {
            console.error('Error al obtener alertas:', error);
        })
    }, []);
    const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
    const [loadingFilteredAlerts, setLoadingFilteredAlerts] = useState(true);
    const fetchFilteredAlerts = async (cameraId: number) => {
        try {
            //console.log('Cargando alertas para cámara:', cameraId);
            setLoadingFilteredAlerts(true);
            const response = await axios.get<Alert[]>(`${BACKEND_URL}/api/alertas/camara/${cameraId}`);
            //console.log('Respuesta de alertas:', response.data);
            //const filteredAlerts = response.data.filter(alert => alert.id_camara === cameraId);
            setFilteredAlerts(response.data);
        } catch (err) {
            setError('Error al cargar las alertas');
            console.error(err);
        } finally {
            setLoadingFilteredAlerts(false);
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

    // Carga de nombre de camaras desde backend
    const [cameraNames, setCameraNames] = useState<{[key:number]:string}>({});
    const [loadingCameraNames, setLoadingCameraNames] = useState(true);
    useEffect(() => {
    axios.get<{[key:number]:string}>(`${BACKEND_URL}/api/camaras/nombre-camaras`)
        .then(response => {
        setCameraNames(response.data);
        })
        .catch(error => {
        console.error('Error al obtener cámaras:', error);
        })
        .finally(() => setLoadingCameraNames(false));
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

    // Manejo WebSocket para recibir nuevas descripciones
      useEffect(() => {
        socket.on('nueva-descripcion', (alerta: Alert) => {
          // Actualiza alerta con descripcion nueva
          setAlerts(prev =>
            prev.map(a => a.id === alerta.id ? { ...a, descripcion_suceso: alerta.descripcion_suceso } : a)
          );
    
          // Si esa alerta estaba en no vistas, también la actualiza
          setUnseenAlerts(prev =>
            prev.map(a => a.id === alerta.id ? { ...a, descripcion_suceso: alerta.descripcion_suceso } : a)
          );
    
          // Si justo la alerta seleccionada es la que llegó por socket, también la refresca en el modal
          setAlertaSeleccionada(prev =>
            prev && prev.id === alerta.id ? { ...prev, descripcion_suceso: alerta.descripcion_suceso } : prev
          );
        });
    
        return () => {
          socket.off('nueva-descripcion');
        };
      }, []);

    // Cargar cámaras al montar el componente
    useEffect(() => {
      fetchCameras();
    }, []);

    // Cargar alertas cuando cambia la cámara seleccionada
    useEffect(() => {
      if (selectedCamera) {
        fetchFilteredAlerts(selectedCamera.id);
      }
    }, [selectedCamera]);

    // Función para descargar clip
    const downloadClip = async (key: string) => {
        setDownloadingClip(key); // Iniciar loading
        try {
        const response = await axios.post(`${CAMERA_URL}/video/download`, 
            { key: key },
            {
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json'
            }
            }
        );

        // Crear y disparar la descarga
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const contentDisposition = response.headers['content-disposition'];
        let fileName = `clip_${new Date().getTime()}.mp4`;
        
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (fileNameMatch && fileNameMatch[1]) {
            fileName = fileNameMatch[1];
            }
        }
        
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        } catch (error: any) {
        console.error('Error al descargar clip:', error);
        
        if (error.response?.data instanceof Blob) {
            try {
            const errorText = await error.response.data.text();
            console.error('Error del servidor:', errorText);
            } catch (blobError) {
            console.error('No se pudo leer el error del servidor', blobError);
            }
        }
        
        throw error;
        } finally {
        setDownloadingClip(null); // Finalizar loading siempre
        }
    };

    // Función para determinar la clase del score
    const getScoreClass = (score: number) => {
        if (score >= 0.6) return 'score-high';
        if (score >= 0.4) return 'score-medium';
        return 'score-low';
    };

    // Función para determinar la clase del estado
    const getStateClass = (estado: number) => {
        if (estado === 0) return 'state-resolved';
        if (estado === 1) return 'state-in-progress';
        if (estado === 2) return 'state-pending';
        return 'state-resolved';
    };

    // Función para obtener el icono según el estado
    const getStateIcon = (estado: number) => {
        if (estado === 0) return checkmarkCircle;
        if (estado === 1) return time;
        if (estado === 2) return closeCircleOutline;
        return checkmarkCircle;
    };

    // Función para obtener el color del indicador
    const getIndicatorColor = (score: number) => {
        if (score >= 0.6) return '#c53030';
        if (score >= 0.4) return '#e67700';
        return '#137547';
    };

    // Función para formatear el estado
    const formatEstado = (estado: number) => {
        if (estado === 0) return 'Resuelta';
        if (estado === 1) return 'En progreso';
        if (estado === 2) return 'Falso positivo';
        return 'Resuelta';
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
                        cameraNames={cameraNames}
                        variant="sidebar"
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
                <p>Score: {alertaSeleccionada?.score_confianza} &nbsp; | &nbsp; {alertaSeleccionada ? cameraNames[alertaSeleccionada.id_camara] ?? `ID ${alertaSeleccionada.id_camara}` : ''} &nbsp; | &nbsp; Estado: {alertaSeleccionada?.estado !== undefined && estados[alertaSeleccionada.estado]}</p>
                <h2>Descripción del suceso</h2>
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
                    padding: '0px 100px 15px',
                    fontSize: '1.1rem',
                    '--border-radius': '15px',
                    '--background': '#1B4965'
                    }}
                >
                    Editar descripción
                </IonButton>

                <h2>Clip del suceso</h2>
                <video 
                    controls 
                    autoPlay 
                    style={{ width: '100%' }} 
                    src={ `${CAMERA_URL}/video/play?key=${alertaSeleccionada?.clip}&format=mp4` }
                    />
                    <div style={{display: 'flex', justifyContent: 'center', padding: '10px'}}>
                    <IonButton 
                        color="danger"
                        expand="block"
                        onClick={() => downloadClip(alertaSeleccionada?.clip || '')}
                        disabled={downloadingClip === alertaSeleccionada?.clip}
                        style={{
                        padding: '0px 25px 15px',
                        fontSize: '1.1rem',
                        '--border-radius': '15px',
                        }}
                    >
                        {downloadingClip === alertaSeleccionada?.clip ? (
                        <IonSpinner name="crescent" className='spinner-descarga' />
                        ) : (
                        'Descargar'
                        )}
                    </IonButton>
                    <IonButton color="medium"
                        expand="block"
                        onClick={() => setMostrarDescripcion(false)}
                        style={{
                        padding: '0px 25px 15px',
                        fontSize: '1.1rem',
                        '--border-radius': '15px',
                        }}
                    >
                        Cerrar
                    </IonButton>
                    </div>
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
                    <IonList style={{ padding: 0, marginTop: '20px'}}>
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
            
                <hr className='hr-vertical' />
                
                <div className={`mi-clase${filteredAlerts.length === 0 ? '-oculto' : '-visible'}`}>
                    <IonTitle style={{ flexShrink: 0 }}>
                    Alertas de {selectedCamera ? selectedCamera.nombre : 'Ninguna cámara seleccionada'}
                    </IonTitle>
                    
                    <div style={{
                        overflowY: 'auto',
                        flexGrow: 1,
                        marginTop: '10px',
                        paddingRight: '8px'
                    }}>
                    {loadingFilteredAlerts ? (
                        <div className="loading-container">
                        <IonSpinner name="crescent" />
                        <p>Cargando alertas...</p>
                        </div>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <IonList style={{ padding: 0, marginTop: '20px'}}>
                        {filteredAlerts.length > 0 ? (
                            filteredAlerts.map((alert) => (
                            <IonItem key={alert.id} className='camera-item'>
                                <div 
                                    slot="start" 
                                    className="alert-color-indicator"
                                    style={{ backgroundColor: getIndicatorColor(alert.score_confianza) }}
                                />  
                                {/*<IonLabel>
                                <h2>Alerta {alert.id}</h2>
                                <p>{new Date(alert.hora_suceso).toLocaleString()}</p>
                                <p>{alert.mensaje}</p>
                                </IonLabel>*/}
                                <IonLabel>
                                    <div className="alert-header">
                                        <h2 className="alert-title">Alerta {alert.id}</h2>
                                        <p className="alert-time">
                                        {formatearFecha(alert.hora_suceso)}
                                        </p>
                                    </div>
                                    
                                    <p className="alert-message">{alert.mensaje}</p>
                                    
                                    <div className="alert-footer">
                                        <IonChip className={`alert-score ${getScoreClass(alert.score_confianza)}`}>
                                        <IonIcon icon={alertCircle} color='gray' />
                                        <IonLabel>Score: {alert.score_confianza}</IonLabel>
                                        </IonChip>
                                        
                                        <IonChip className={`alert-state ${getStateClass(alert.estado)}`}>
                                        <IonIcon icon={getStateIcon(alert.estado)} color='gray' />
                                        <IonLabel>{formatEstado(alert.estado)}</IonLabel>
                                        </IonChip>
                                    </div>
                                    </IonLabel>
                            </IonItem>
                            ))
                        ) : (
                            <IonItem className='camera-item'>
                            <IonLabel>No hay alertas para esta cámara</IonLabel>
                            </IonItem>
                        )}
                        </IonList>
                    )}
                    </div>
                </div>
            </div> 
        </div>
    );
}
export default Historial;