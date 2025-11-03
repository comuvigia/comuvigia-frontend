import React, { useEffect, useState, useRef } from "react";
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import axios from "axios";
import "./FeedCamaras.css";
import { Navbar } from '../components/NavBar';
import { Alert } from '../types/Alert';
import { Camera } from "../types/Camera";
import {
  IonPopover,
  IonButton,
  IonModal,
  IonSpinner,
  IonTextarea,
} from '@ionic/react';
import { NotificacionesPopover } from '../components/Notificaciones';
import { io } from 'socket.io-client';
import { useUser } from '../UserContext';
import { useToast } from "../components/ToastProvider";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const BUCKET_URL = import.meta.env.VITE_BUCKET_URL;
const CAMERA_URL = import.meta.env.VITE_CAMERA_URL;
const socket = io(BACKEND_URL);

const FeedCamaras: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loadingCameras, setLoadingCameras] = useState(true);
  const [numFeed, setNumFeed] = useState<1 | 2 | 4>(4);
  const [seleccionadas, setSeleccionadas] = useState<(Camera | null)[]>([null, null, null, null]);
  // Carga de camaras desde backend con cantidad de alertas
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

  const handleCamChange = (index: number, camId: number) => {
    const cam = cameras.find((c) => c.id === camId) || null;
    setSeleccionadas((prev) => {
      const nuevas = [...prev];
      nuevas[index] = cam;
      return nuevas;
    });
  };

  const handleNumFeedChange = (n: 1 | 2 | 4) => {
    setNumFeed(n);
    setSeleccionadas((prev) => {
      const nuevas = [...prev];
      for (let i = n; i < 4; i++) {
        nuevas[i] = null;
      }
      return nuevas;
    });
  };

  const idsSeleccionados = seleccionadas.filter((c) => c !== null).map((c) => c!.id);
  const grids = seleccionadas.slice(0, numFeed);
  const colSize = numFeed === 1 ? "12" : numFeed === 2 ? "6" : "6";

  const { user } = useUser();
  const {addToast, removeToast} = useToast();
  const [toastId, setToastId] = useState<number | null>(null);
  
  const [lastAlert, setLastAlert] = useState<Alert | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverOpenMantenedores, setPopoverOpenMantenedores] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<React.MouseEvent | null>(null);
  const [activeModal, setActiveModal] = useState<'cameras' | 'users' | 'alerts' | null>(null);
  const [event, setEvent] = useState<MouseEvent | undefined>(undefined);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<Alert | null>(null);
  const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
  const [downloadingClip, setDownloadingClip] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState<number | null>(null);
  const [editandoDescripcion, setEditandoDescripcion] = useState(false);
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false)
  const fabButtonRef = useRef<HTMLIonFabButtonElement>(null);

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
          console.log(response.data)
        })
        .catch(error => {
          console.error('Error al obtener alertas:', error);
        })
    }
  }, []);

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
  if (loadingCameras || loadingAlerts || loadingCameraNames)
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
  // Handler para mostrar popover en el sitio del click (el icono de mantenedores)
  const handleShowMantenedores = (e: React.MouseEvent) => {
    // Prevenir comportamiento por defecto
    e.preventDefault();
    e.stopPropagation();
    
    setPopoverEvent(e); 
    setPopoverOpenMantenedores(true);
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
    <div className="feed-page">
      <Navbar
        unseenCount={unseenCountAlerts}
        onShowNotifications={handleShowNotifications}
        onShowMantenedores={handleShowMantenedores}
      />

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
            mostrarCamarasCaidas={true}
            onMarcarTodasVistas={marcarTodasComoVistas} // <- Agregar esta prop
            unseenCount={unseenCountAlerts} // <- Pasar el contador de no vistas
          />
        </IonContent>
      </IonPopover>

      <IonModal isOpen={mostrarDescripcion} onDidDismiss={() => setMostrarDescripcion(false)} className="modal-descripcion">
        <IonContent className="ion-padding">
          <h2>Alerta {alertaSeleccionada?.id}</h2>
          <p>Score: {alertaSeleccionada?.score_confianza} &nbsp; | &nbsp; {alertaSeleccionada ? cameraNames[alertaSeleccionada.id_camara] ?? `ID ${alertaSeleccionada.id_camara}` : ''} &nbsp; | &nbsp; Sector: {alertaSeleccionada?.sector} &nbsp; | &nbsp; Estado: {alertaSeleccionada?.estado !== undefined && estados[alertaSeleccionada.estado]}</p>
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

      <div className="feed-content ion-padding">
        <div className="segment-container">
          <IonLabel>Vista:</IonLabel>
          <IonSegment
            value={String(numFeed)}
            onIonChange={(e) =>
              handleNumFeedChange(Number(e.detail.value) as 1 | 2 | 4)
            }
          >
            <IonSegmentButton value="1">1</IonSegmentButton>
            <IonSegmentButton value="2">2</IonSegmentButton>
            <IonSegmentButton value="4">4</IonSegmentButton>
          </IonSegment>
        </div>

        <IonGrid>
          <IonRow>
            {grids.map((cam, index) => (
              <IonCol key={index} size={colSize}>
                <IonCard>
                  <IonCardHeader>
                    <IonItem lines="none">
                      <IonLabel>
                        {cam ? cam.nombre : `Cámara ${index + 1}`}
                      </IonLabel>

                      <IonSelect
                        placeholder="Seleccionar cámara"
                        value={cam?.id}
                        onIonChange={(e) => handleCamChange(index, e.detail.value)}
                      >
                        {cameras
                          .filter(
                            (c) =>
                              c.id === cam?.id || !idsSeleccionados.includes(c.id)
                          )
                          .map((c) => (
                            <IonSelectOption key={c.id} value={c.id}>
                              {c.nombre}
                            </IonSelectOption>
                          ))}
                      </IonSelect>
                    </IonItem>
                  </IonCardHeader>

                  <IonCardContent>
                    {cam ? (
                      cam.link_camara_externo ? (
                        <img
                          src={cam.link_camara_externo}
                          alt={cam.nombre}
                          className="feed-video"
                        />
                      ) : (
                        <video
                          src={`${BUCKET_URL}${cam.link_camara}`}
                          autoPlay
                          muted
                          controls
                          className="feed-video"
                        />
                      )
                    ) : (
                      <div className="feed-placeholder">
                        <p>Seleccione una cámara</p>
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </div>
    </div>

  );
};

export default FeedCamaras;