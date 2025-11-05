import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/NavBar';
import { Camera } from '../types/Camera';
import { Alert } from '../types/Alert';
import { User } from '../types/User';
import {
  IonPopover,
  IonButton,
  IonSpinner,
  IonContent,
  IonModal,
  IonTextarea
} from '@ionic/react';
import FiltroPeriodo from '../components/Estadisticas/FiltroPeriodo';
import EstadisticasTotales from '../components/Estadisticas/EstadisticasTotales';
import GraficoSector from '../components/Estadisticas/GraficoSector';
import GraficoTipo from '../components/Estadisticas/GraficoTipo';
import GraficoHorarios from '../components/Estadisticas/GraficoHorarios';
import Ranking from '../components/Estadisticas/RankingCamaras';
import DetalleSectores from '../components/Estadisticas/DetalleSectores';
import InformeDescarga from '../components/InformeDescarga';
import { NotificacionesPopover } from '../components/Notificaciones';
import { useUser } from '../UserContext';
import { useToast } from "../components/ToastProvider";
import { io } from 'socket.io-client';
import axios from 'axios';
import './Reportes.css';
import '../components/ReporteEstadisticas.css'
import ReportesTutorial from '../components/ReportesTutorial';
import RankingCamaras from '../components/Estadisticas/RankingCamaras';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CAMERA_URL = import.meta.env.VITE_CAMERA_URL;
const socket = io(BACKEND_URL);

function Reportes() {
  const { user } = useUser();
  const {addToast, removeToast} = useToast();
  const [toastId, setToastId] = useState<number | null>(null);
  const [lastAlert, setLastAlert] = useState<Alert | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'cameras' | 'users' | 'alerts' | null>(null);
  const [event, setEvent] = useState<MouseEvent | undefined>(undefined);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
  const [downloadingClip, setDownloadingClip] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState<number | null>(null);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<Alert | null>(null);
  const [editandoDescripcion, setEditandoDescripcion] = useState(false);
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false)
  const [fechaInicio, setFechaInicio] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10)
  );
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().slice(0, 10));
  const [agrupacion, setAgrupacion] = useState('day');
  const [dataHorarios, setDataHorarios] = useState<any[]>([]);
  const [topHorarios, setTopHorarios] = useState<any>({});
  const [loadingHorarios, setLoadingHorarios] = useState(false);



  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/alertas/estadisticas-totales?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&group=${agrupacion}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('Error en la respuesta del servidor');
      const json = await res.json();
      console.log(json)
      setData(json);
      setDataHorarios(json.horarios || []);
      setTopHorarios(json.top_horarios || {});

          axios
      .get<Camera[]>(`${BACKEND_URL}/api/camaras/cantidad-alertas-fecha?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`, { withCredentials: true })
      .then(response => setCameras7d(response.data))
      .catch(error => console.error('Error al obtener cámaras (últimos 7 días):', error))
      .finally(() => setLoadingCameras7d(false));
      
    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    cargarDatos();
  }, []);

  // === Preparar datos para los gráficos ===
  const chartDataSectores = data
    ? {
        labels: data.sectores.map((s: any) => s.nombre_sector),
        datasets: [
          {
            label: 'Alertas por Sector',
            data: data.sectores.map((s: any) => s.total_alertas),
            backgroundColor: ['#10dc60', '#ff4961', '#ffc409', '#7044ff']
          }
        ]
      }
    : null;

  const chartDataTipos = data
    ? {
        labels: ['Merodeos', 'Portonazos', 'Asaltos Hogar', 'Falsos positivos'],
        datasets: [
          {
            label: '',
            data: [
              data.estadisticas_totales.merodeos,
              data.estadisticas_totales.portonazos,
              data.estadisticas_totales.asaltos_hogar,
              data.estadisticas_totales.falsos_positivos
            ],
            backgroundColor: ['#10dc60', '#ff4961', '#ffc409', '#7044ff']
          }
        ]
      }
    : null;

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

  // Carga de alertas desde backend
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  useEffect(() => {
    if(!user) return;
    
    if(user.rol == 1 || user.rol == 2){
      axios.get<Alert[]>(`${BACKEND_URL}/api/alertas`, { withCredentials: true })
        .then(response => {
          setAlerts(response.data);
        })
        .catch(error => {
          console.error('Error al obtener alertas:', error);
        })
    }
  }, []);

    const [cameras7d, setCameras7d] = useState<Camera[]>([]);
  const [loadingCameras7d, setLoadingCameras7d] = useState(true);

  // Carga de alertas no vistas desde backend
  const [ unseenAlerts,  setUnseenAlerts ] = useState<Alert[]>([])
  useEffect(() => {
    if(!user) return;
    
    if(user.rol == 1 || user.rol == 2){
      axios.get<Alert[]>(`${BACKEND_URL}/api/alertas/no-vistas`, { withCredentials: true })
        .then(response => {
          setUnseenAlerts(response.data);
        })
        .catch(error => {
          console.error('Error al obtener alertas no vistas:', error);
        })
        .finally(() => setLoadingAlerts(false));
    }
    else setLoadingAlerts(false)
  }, []);

  // Carga de camaras desde backend con cantidad de alertas
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loadingCameras, setLoadingCameras] = useState(true);
  useEffect(() => {
    if(!user) return;

    axios.get<Camera[]>(`${BACKEND_URL}/api/camaras/cantidad-alertas`, { withCredentials: true })
      .then(response => {
        //console.log("JSON recibido del backend:", response.data);
        setCameras(response.data);
      })
      .catch(error => {
        console.error('Error al obtener cámaras:', error);
      })
      .finally(() => setLoadingCameras(false));
  }, []);

  // Carga de nombre de camaras desde backend
  const [cameraNames, setCameraNames] = useState<{[key:number]:string}>({});
  const [loadingCameraNames, setLoadingCameraNames] = useState(true);
  useEffect(() => {
    axios.get<{[key:number]:string}>(`${BACKEND_URL}/api/camaras/nombre-camaras`, { withCredentials: true })
      .then(response => {
        setCameraNames(response.data);
      })
      .catch(error => {
        console.error('Error al obtener cámaras:', error);
      })
      .finally(() => setLoadingCameraNames(false));
  }, []);

  // Carga de usuarios desde backend
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  useEffect(() => {
    if(!user) return;
    
    if(user.rol == 2){
      axios.get<User[]>(`${BACKEND_URL}/api/usuarios`, { withCredentials: true })
        .then(response => {
          //console.log(response.data)
          setUsers(response.data);
        })
        .catch(error => {
          console.error('Error al obtener usuarios:', error);
        })
        .finally(() => setLoadingUsers(false));
    }
    else setLoadingUsers(false);
  }, []);

  const [showTutorial, setShowTutorial] = useState(false);

  const [tipoDelito, setTipoDelito] = useState<string>('todos');

  
  const handleShowTutorial = () => {
      setShowTutorial(true);
  };

  const handleFinishTutorial = () => {
      setShowTutorial(false);
  };

  // Manejo WebSocket para recibir nuevas alertas
  useEffect(() => {
    if(!user) return;

    if(user.rol == 1 || user.rol == 2){
      socket.on('nueva-alerta', (alerta: Alert) => {
        // Agrega la nueva alerta a la lista general y no vistas
        setAlerts(prev => [alerta, ...prev]);
        if (alerta.estado === 0){
          setUnseenAlerts(prev => [alerta, ...prev]);
          setLastAlert(alerta);

          // Muestra toast
          const id = addToast(`Alerta en ${cameraNames[alerta.id_camara]}`, alerta.score_confianza);
          setToastId(Number(id));
        }
  
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
    }
  }, [cameraNames]);
  
  // Manejo WebSocket para recibir nuevas descripciones
  useEffect(() => {
    if(!user) return;

    if(user.rol == 1 || user.rol == 2){
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
    }
  }, []);

  // Loading de camaras y alertas
  if (loadingCameras || loadingAlerts || loadingCameraNames || loadingUsers)
    return (
      <IonContent className="ion-padding ion-text-center home-loading-screen">
        <div className="home-loading-container">
          <img src="/comuvigia.png" alt="Logo" className="home-loading-logo" />
          <IonSpinner name="crescent" />
          <p>Cargando datos...</p>
        </div>
      </IonContent>
    );
  
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
      }, { withCredentials: true });

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

    // Función para marcar todas las alertas como vistas
  const marcarTodasComoVistas = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/alertas/marcar-todas-vistas`, {
        estado: 1, // Confirmadas
      }, { withCredentials: true });

      // Actualizar el estado local
      setAlerts(prev => prev.map(alert => ({ ...alert, estado: 1 })));
      setUnseenAlerts([]); // Limpiar las no vistas
      setPopoverOpen(false); // Cerrar el popover

    } catch (error) {
      console.error('Error al marcar todas las alertas como vistas:', error);
    }
  };
  
  // Mapeo de estados de alerta
  const estados: { [key: number]: string } = {
    0: "En Observación",
    1: "Confirmada",
    2: "Falso Positivo"
  };



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
      
    } catch (error: unknown) {
      console.error('Error al descargar clip:', error);
      
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { data?: unknown } }).response?.data instanceof Blob
      ) {
        try {
          const errorText = await (error as { response: { data: Blob } }).response.data.text();
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

  // Manejo de descarga de paquete de evidencia
  const downloadZip = async (alerta: Alert | null) => {
    if (!alerta) return;
    setDownloadingZip(alerta.id);

    try{
      // Buscar la cámara asociada a esta alerta
      const camara = cameras.find(c => c.id === alerta?.id_camara);
    
      // Si no se encuentra la cámara, prevenir error
      if (!camara) {
        alert("No se encontró la cámara asociada a la alerta.");
        return;
      }
    
      // Preparar datos para enviar al backend Flask
      const body = {
        key: alerta?.clip,
        descripcion: alerta?.descripcion_suceso,
        hora_suceso: alerta?.hora_suceso,
        ubicacion: camara.direccion,
        nombre_camara: camara.nombre
      };

      // Validar si el body tiene algún valor nulo o undefined
      if (!body.key || !body.descripcion || !body.hora_suceso || !body.ubicacion || !body.nombre_camara) {
        alert("No se puede realizar la descarga, inténtelo de nuevo más tarde");
        return;
        }
    
      // Hacer la petición al backend Flask para obtener el ZIP
      const response = await fetch(`${CAMERA_URL}/video/download_evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    
      if (!response.ok) {
        throw new Error('Error generando ZIP');
      }
    
      // Recibir el ZIP como blob y forzar descarga
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alerta_${alerta.id}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error al descargar ZIP');
    } finally {
      setDownloadingZip(null);
    }
  };
  

  return (
    <div className="reportes-page">
      <ReportesTutorial run={showTutorial} onFinish={handleFinishTutorial} />
      <Navbar unseenCount={unseenCountAlerts} onShowNotifications={handleShowNotifications} onShowTutorial={handleShowTutorial}/>

      {/* Popover de notificaciones */}
      <IonPopover
        isOpen={popoverOpen}
        event={event}
        onDidDismiss={() => setPopoverOpen(false)}
        side="bottom"
        alignment="end"
      >
        <IonContent class='custom-content'>
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
            mostrarCamarasCaidas={true}
            onMarcarTodasVistas={marcarTodasComoVistas}
            unseenCount={unseenCountAlerts}
          />
        </IonContent>
      </IonPopover>

      {/* Panel de descripción */}
      {/*mostrarDescripcion && alertaSeleccionada && (
        <div className="panel-descripcion card">
          <h2>Alerta {alertaSeleccionada.id}</h2>
          <p>Descripción: {alertaSeleccionada.descripcion_suceso || 'Sin descripción'}</p>
          <video
            controls
            src={`${CAMERA_URL}/video/play?key=${alertaSeleccionada.clip}&format=mp4`}
          />
          <div className="button-group">
            <IonButton onClick={() => setMostrarDescripcion(false)}>Cerrar</IonButton>
          </div>
        </div>
      )}*/}
      {/*<CameraModal open={modalOpen} onClose={() => setModalOpen(false)} camera={selectedCamera} />*/}
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
              {user && user.rol == 2 && (
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
              )}
            </div>
          )}

          <h2>Clip del suceso</h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            { alertaSeleccionada?.clip ? (
              <video 
                controls 
                autoPlay 
                className="video-clip"
                src={ `${CAMERA_URL}/video/play?key=${alertaSeleccionada?.clip}&format=mp4` }
              />
            ) : (
                  <p style={{fontStyle: 'italic'}}>No hay clip disponible para esta alerta </p>
                )
            }
            
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
            <IonButton 
              color="secondary"
              expand="block"
              onClick={() => downloadZip(alertaSeleccionada)}
              disabled={downloadingZip === alertaSeleccionada?.id}
              style={{
                padding: '0px 25px 15px',
                fontSize: '1.1rem',
                '--border-radius': '15px',
              }}
            >
              {downloadingZip === alertaSeleccionada?.id ? (
                <IonSpinner name="crescent" className='spinner-descarga' />
              ) : (
                'Descargar ZIP'
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

      {/* Contenedor de reportes */}
      <div className="grid-container">
        {loading && (
          <div className="loading-container card">
            <IonSpinner
              style={{ '--color': '#1B4965', width: '40px', height: '40px' }}
            />
            <p>Cargando datos del reporte...</p>
          </div>
        )}

        {!loading && data && (
          <>
            {/* === Sección 1: Filtros === */}
            <div className="card"   style={{
                  gridColumn: '3 / 4', // columna 2
                  gridRow: '1 / 2',    // fila 1
                }}>
              <FiltroPeriodo
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
                setFechaInicio={setFechaInicio}
                setFechaFin={setFechaFin}
                agrupacion={agrupacion}
                setAgrupacion={setAgrupacion}
                onGenerarReporte={cargarDatos}
              />
            </div>

            {/* === Sección 2: Estadísticas === */}
            <div className="card"   style={{
                  gridColumn: '1 / 3', // columna 2
                  gridRow: '1 / 2',    // fila 1
                }}>
              <EstadisticasTotales
                estadisticas_totales={data.estadisticas_totales}
              />
            </div>

            {/* === Sección 3: Gráfico por sector === */}
            {chartDataSectores && (
            <div className="card"   style={{
                  gridColumn: '1 / 2', // columna 2
                  gridRow: '2 / 4',    // fila 1
                }}>
                <GraficoSector data={chartDataSectores} />
              </div>
            )}

            {/* === Sección 4: Gráfico por tipo === */}
            {chartDataTipos && (
            <div className="card"   style={{
                  gridColumn: '2 / 3', // columna 2
                  gridRow: '2 / 4',    // fila 1
                }}>
                <GraficoTipo data={chartDataTipos} />
              </div>
            )}

            {/* === Sección 5: Detalle por sectores === */}
            <div className="card"   style={{
                  gridColumn: '3 / 4', // columna 2
                  gridRow: '2 / 3',    // fila 1
                }}>
              <DetalleSectores sectores={data.sectores} />
            </div>

            {/* Descarga de informe */}
            <div className="card"   style={{
                  gridColumn: '3 / 4', // columna 2
                  gridRow: '3 / 4',    // fila 1 
                }}>
              <InformeDescarga />
            </div>

            {/* === Sección 6: Gráfico por Horarios === */}
            {dataHorarios.length > 0 && (
              <div className="card" style={{ gridColumn: "1 / 2", gridRow: "4 / 5" }}>
                <GraficoHorarios horarios={dataHorarios} />
                {/* Mostrar también los top horarios si existen */}
                {topHorarios && (
                  <div style={{ marginTop: '12px', fontSize: '0.9rem' }}>
                    <strong>🕒 Horarios más críticos:</strong><br />
                    Merodeos: {topHorarios.merodeos?.join(', ') || '—'}<br />
                    Portonazos: {topHorarios.portonazos?.join(', ') || '—'}<br />
                    Asaltos Hogar: {topHorarios.asaltos_hogar?.join(', ') || '—'}
                  </div>
                )}
              </div>
            )}
            {dataHorarios.length <= 0 && (
              <p>No hay datos que mostrar</p>
            )}

            {/* === Sección 7: Ranking de Cámaras === */}
            <div
              className="card"
              style={{
                gridColumn: "2 / 3", // segunda columna
                gridRow: "4 / 5",    // misma fila
              }}
            >
              <RankingCamaras cameras={cameras7d} />
            </div>
          </>
        )}

        {!loading && !data && !error && (
          <div className="card card-full">
            <h3>Selecciona los filtros y genera tu reporte</h3>
            <p>Los datos se mostrarán aquí una vez que generes el reporte.</p>
          </div>
        )}

        {error && (
          <div className="card card-full" style={{ color: 'red' }}>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reportes;
