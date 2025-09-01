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
    IonSelect,
    IonSelectOption,
    IonAlert,
    IonTitle,
    IonGrid,
    IonRow,
    IonCol
} from '@ionic/react';
import ReporteEstadisticas from '../components/ReporteEstadisticas';
import { NotificacionesPopover } from '../components/Notificaciones';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Reportes.css';

// URL del backend cargado desde archivo .env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const BACKEND_CAMERA_URL = import.meta.env.VITE_CAMERA_URL;
const socket = io(BACKEND_URL);

function Reportes(){
    const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [event, setEvent] = useState<MouseEvent | undefined>(undefined);
    const [modalOpen, setModalOpen] = useState(false);
    const [alertaSeleccionada, setAlertaSeleccionada] = useState<Alert | null>(null);
    const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [filtros, setFiltros] = useState({
        dias: 7,
        agrupacion: 'day'
    });

    const cargarDatos = async () => {
        setLoading(true);
        setError(null);
        
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

    useEffect(() => {
      fetchCameras();
    }, []);

    useEffect(() => {
      if (selectedCamera) {
        fetchAlerts(selectedCamera.id);
      }
    }, [selectedCamera]);

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
                        textAlign: { xs: 'center', md: 'left' }
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
                        backgroundColor: 'white',
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