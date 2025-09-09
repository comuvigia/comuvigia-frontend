import React, { useEffect, useState } from 'react';
import { CameraModal } from '../components/CameraModal';
import { Navbar } from '../components/NavBar';
import { Camera } from '../types/Camera';
import { Alert } from '../types/Alert';
import {
    IonPopover,
    IonButton,
    IonModal,
    IonSpinner,
    IonContent,
    IonAlert,
    IonTitle,
    IonTextarea,
} from '@ionic/react';
import ReporteEstadisticas from '../components/ReporteEstadisticas';
import { NotificacionesPopover } from '../components/Notificaciones';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Reportes.css';

// URL del backend cargado desde archivo .env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CAMERA_URL = import.meta.env.VITE_CAMERA_URL;
const socket = io(BACKEND_URL);

function Reportes(){
    const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [event, setEvent] = useState<MouseEvent | undefined>(undefined);
    const [modalOpen, setModalOpen] = useState(false);
    const [alertaSeleccionada, setAlertaSeleccionada] = useState<Alert | null>(null);
    const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
    const [editandoDescripcion, setEditandoDescripcion] = useState(false);
    const [nuevaDescripcion, setNuevaDescripcion] = useState("");
    const [guardando, setGuardando] = useState(false)
    const guardarDescripcion = async () => {
    if (!alertaSeleccionada) return;
    
        setGuardando(true);
        
        try {
        await axios.put(`${BACKEND_URL}/api/alertas/editar-descripcion/${alertaSeleccionada.id}`, {
            descripcion_suceso: nuevaDescripcion
        });
        
        setAlerts(prev =>
            prev.map(a =>
            a.id === alertaSeleccionada.id
                ? { ...a, descripcion_suceso: nuevaDescripcion }
                : a
            )
        );
        
        setAlertaSeleccionada(prev =>
            prev ? { ...prev, descripcion_suceso: nuevaDescripcion } : prev
        );
        
        setEditandoDescripcion(false);
        } catch (error) {
        console.error("Error al guardar:", error);
        } finally {
        setGuardando(false);
        }
    };
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [downloadingClip, setDownloadingClip] = useState<string | null>(null);
    const [filtros, setFiltros] = useState({
        dias: 7,
        agrupacion: 'day'
    });

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        
        try {
            const resultado = await getEstadisticas(filtros.dias, filtros.agrupacion);
            setData(resultado);
        } catch (err) {
            setError('Error al cargar los datos');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const getEstadisticas = async (dias: number = 7, agrupacion: string = 'month') => {
    try {
        const fecha_inicio = '2025-08-01T03:51:24';
        const fecha_fin = '2025-08-30T04:51:44';
        const response = await fetch(
        `${BACKEND_URL}/api/alertas/estadisticas-totales?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}&group=${agrupacion}`
        );
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching estadísticas:', error);
        throw error;
    }
    };

    // Carga de camaras desde backend
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [loadingCameras, setLoadingCameras] = useState(true);
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
        setPopoverOpen(false);
        setAlertaSeleccionada(alerta);
        setMostrarDescripcion(true);
    };

    const formatearFecha = (fechaISO: string) => {
        const fecha = new Date(fechaISO);
        return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        }).format(fecha);
    };
    
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

    const estados: { [key: number]: string } = {
        0: "En Observación",
        1: "Confirmada",
        2: "Falso Positivo"
    };

    useEffect(() => {
        socket.on('nueva-alerta', (alerta: Alert) => {
        setAlerts(prev => [alerta, ...prev]);
        setUnseenAlerts(prev => [alerta, ...prev]);
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

    useEffect(() => {
      fetchCameras();
    }, []);

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

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            fontFamily: 'Arial, sans-serif'
        }}>
            <Navbar unseenCount={unseenCountAlerts} onShowNotifications={handleShowNotifications} />
            
            <IonPopover
                isOpen={popoverOpen}
                event={event}
                onDidDismiss={() => setPopoverOpen(false)}
                side="bottom"
                alignment="end"
            >
                <IonContent>
                    <NotificacionesPopover
                        alerts={
                            [...alerts].sort((a, b) => {
                                if (a.estado !== b.estado) {
                                return a.estado === 0 ? -1 : 1;
                                }
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
            
            <IonModal isOpen={mostrarDescripcion} onDidDismiss={() => setMostrarDescripcion(false)} className="modal-descripcion">
                    <IonContent className="ion-padding">
                      <h2>Alerta {alertaSeleccionada?.id}</h2>
                      <p>Score: {alertaSeleccionada?.score_confianza} &nbsp; | &nbsp; {alertaSeleccionada ? cameraNames[alertaSeleccionada.id_camara] ?? `ID ${alertaSeleccionada.id_camara}` : ''} &nbsp; | &nbsp; Estado: {alertaSeleccionada?.estado !== undefined && estados[alertaSeleccionada.estado]}</p>
                      <br />
                      {/* Sección de descripción */}
                      <h2>Descripción del suceso</h2>
                      {editandoDescripcion ? (
                        <div style={{ marginBottom: '15px' }}>
                          <IonTextarea
                            value={nuevaDescripcion}
                            onIonInput={(e) => setNuevaDescripcion(e.detail.value!)}
                            autoGrow={true}
                            rows={4}
                            placeholder="Escribe la descripción aquí..."
                            style={{
                              border: '1px solid #ddd',
                              borderRadius: '8px',
                              padding: '10px',
                              marginBottom: '10px'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <IonButton 
                              onClick={guardarDescripcion} 
                              disabled={guardando}
                              style={{ flex: 1 }}
                            >
                              {guardando ? <IonSpinner name="crescent" className='spinner-descarga' /> : 'Guardar'}
                            </IonButton>
                            <IonButton 
                              color="medium" 
                              onClick={() => {
                                setEditandoDescripcion(false);
                                setNuevaDescripcion(alertaSeleccionada?.descripcion_suceso || "");
                              }}
                              disabled={guardando}
                              style={{ flex: 1 }}
                            >
                              Cancelar
                            </IonButton>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {alertaSeleccionada?.descripcion_suceso ? (
                            <p>{alertaSeleccionada.descripcion_suceso}</p>
                          ) : (
                            <p style={{ fontStyle: 'italic', color: '#888' }}>Esta alerta no tiene descripción</p>
                          )}
                          <IonButton
                            expand="block"
                            onClick={() => {
                              setEditandoDescripcion(true);
                              setNuevaDescripcion(alertaSeleccionada?.descripcion_suceso || "");
                            }}
                            style={{
                              marginTop: '10px',
                              fontSize: '1.1rem',
                              '--border-radius': '15px',
                              '--background': '#1B4965'
                            }}
                          >
                            Editar descripción
                          </IonButton>
                        </div>
                      )}
            
                      <h2>Clip del suceso</h2>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        <video 
                          controls 
                          autoPlay 
                          className="video-clip"
                          src={ `${CAMERA_URL}/video/play?key=${alertaSeleccionada?.clip}&format=mp4` }
                        />
                      </div>
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
            
            {/* Contenedor principal con scroll */}
            <div style={{ 
                flex: 1, 
                overflow: 'auto', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className='containerReporte' style={{ 
                    minHeight: 'min-content',
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    {/* Header responsive */}
                    <div style={{ 
                        width: '100%', 
                        padding: '16px',
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        <IonTitle>
                            Reportes y Estadísticas
                        </IonTitle>
                    </div>
                    
                    

                    {/* Contenido con scroll interno */}
                    <div style={{ 
                        flex: 1, 
                        overflow: 'auto',
                        minHeight: '400px',
                        backgroundColor: '',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        {loading && (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '300px'
                        }}>
                            <IonSpinner 
                                style={{ 
                                    marginBottom: '20px',
                                    width: '40px',
                                    height: '40px',
                                    '--color': '#1B4965'
                                }} 
                            />
                            <p style={{ 
                                color: '#666',
                                fontSize: '1.1rem',
                                margin: 0
                            }}>
                                Cargando datos del reporte...
                            </p>
                        </div>
                        )}

                        {error && (
                        <IonAlert
                            isOpen={!!error}
                            header="Error"
                            message={error}
                            buttons={['OK']}
                            onDidDismiss={() => setError('')}
                        />
                        )}

                        {data && !loading && (
                        <div style={{ 
                            minHeight: 'min-content',
                            overflow: 'visible'
                        }}>
                            <ReporteEstadisticas data={data} />
                        </div>
                        )}

                        {!loading && !data && !error && (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px',
                            color: '#666'
                        }}>
                            <h3 style={{ marginBottom: '16px' }}>Selecciona los filtros y genera tu reporte</h3>
                            <p>Los datos se mostrarán aquí una vez que generes el reporte.</p>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Reportes;