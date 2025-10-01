import React, { useEffect, useState, useRef } from 'react';
import MapView from '../components/MapView';
//import { CameraModal } from '../components/CameraModal';
import { Navbar } from '../components/NavBar';
import { Camera } from '../types/Camera';
import { Alert } from '../types/Alert';
import { User } from '../types/User';
import { videocam, close, add } from 'ionicons/icons';
import {
  IonPopover,
  IonContent,
  IonButton,
  IonModal,
  IonSpinner,
  IonTextarea,
  IonToast,
  IonFab,
  IonFabButton,
  IonIcon
} from '@ionic/react';
import { NotificacionesPopover } from '../components/Notificaciones';
import { MantenedoresPopover } from '../components/MantenedoresPopover';
import Cameras from '../components/Cameras';
import Users from '../components/Users';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Home.css';
import { useUser } from '../UserContext';

// URL del backend cargado desde archivo .env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CAMERA_URL = import.meta.env.VITE_CAMERA_URL;
const socket = io(BACKEND_URL);

function Home() {

  const { user } = useUser();
  const [showToast, setShowToast] = useState(false);
  const [lastAlert, setLastAlert] = useState<Alert | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverOpenMantenedores, setPopoverOpenMantenedores] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<React.MouseEvent | null>(null);
  const [activeModal, setActiveModal] = useState<'cameras' | 'users' | 'alerts' | null>(null);
  const [event, setEvent] = useState<MouseEvent | undefined>(undefined);
  //const [modalOpen, setModalOpen] = useState(false);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<Alert | null>(null);
  const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
  const [downloadingClip, setDownloadingClip] = useState<string | null>(null);
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

  // Carga de camaras desde backend con cantidad de alertas
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loadingCameras, setLoadingCameras] = useState(true);
  useEffect(() => {
    if(!user) return;

    axios.get<Camera[]>(`${BACKEND_URL}/api/camaras/cantidad-alertas`, { withCredentials: true })
      .then(response => {
        console.log("JSON recibido del backend:", response.data);
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
          console.log(response.data)
          setUsers(response.data);
        })
        .catch(error => {
          console.error('Error al obtener usuarios:', error);
        })
        .finally(() => setLoadingUsers(false));
    }
    else setLoadingUsers(false);
  }, []);

  // Manejo WebSocket para recibir nuevas alertas
  useEffect(() => {
    if(!user) return;

    if(user.rol == 1 || user.rol == 2){
      socket.on('nueva-alerta', (alerta: Alert) => {
        // Agrega la nueva alerta a la lista general y no vistas
        setAlerts(prev => [alerta, ...prev]);
        setUnseenAlerts(prev => [alerta, ...prev]);
  
        // Muestra toast
        setLastAlert(alerta);
        setShowToast(true);
  
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
  }, []);

  const goToCamera = () => {
    if (lastAlert) {
      const camaraSeleccionada = cameras.find(c => c.id === lastAlert.id_camara);
      if (camaraSeleccionada) {
        setSelectedCamera(camaraSeleccionada); // aquí guardas el objeto completo
        //setModalOpen(true);
      } else {
        console.warn("No se encontró la cámara con id:", lastAlert.id_camara);
      }
    }
    setShowToast(false);
  };

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
    return <div className='global-loading'><IonSpinner name="crescent" /></div>;

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
    
    setPopoverEvent(e.nativeEvent);
    setPopoverOpenMantenedores(true);
  };

  // Handler alternativo usando referencia
  const handleShowMantenedoresRef = () => {
    if (fabButtonRef.current) {
      const rect = fabButtonRef.current.getBoundingClientRect();
      const event = new CustomEvent('click', {
        detail: {
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
        }
      }) as unknown as React.MouseEvent;
      
      setPopoverEvent(event as unknown as React.MouseEvent);
      setPopoverOpenMantenedores(true);
    }
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

  const handleClosePopover = () => {
    setPopoverOpenMantenedores(false);
    setPopoverEvent(null);
  };

  const handleOpenModal = (modalType: 'cameras' | 'users' | 'alerts') => {
    setActiveModal(modalType);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleSaveCamera = async (camera: Camera, isNew: boolean) => {
    try {
      if (isNew) {
        console.log('Creando nueva cámara: ', camera);
        const response = await axios.post(`${BACKEND_URL}/api/camaras`, camera, { withCredentials: true });
        console.log('Cámara creada exitosamente:', response.data);
        setCameras(prev => [...prev, response.data]);
        // presentToast('Cámara creada exitosamente', 'success');
      } else {
        console.log('Actualizando cámara existente: ', camera);
        const response = await axios.patch(`${BACKEND_URL}/api/camaras/${camera.id}`, camera, { withCredentials: true });
        console.log('Cámara actualizada exitosamente:', response.data);
        setCameras(prev => prev.map(c => 
          c.id === camera.id ? response.data : c
        ));
        // presentToast('Cámara actualizada exitosamente', 'success');
      }
    } catch (error) {
      console.error(`Error ${isNew ? 'creando' : 'actualizando'} cámara:`, error);
      // Manejo de errores
      // presentToast('Error', 'error');
    }
  };

  const handleDeleteCamera = async (id: number) => {
    const cameraToDelete = cameras.find(camera => camera.id === id);
    
    if (!cameraToDelete) {
      console.error('Cámara no encontrada');
      return;
    }

    try {
      console.log('Eliminar cámara:', id);
      
      const response = await axios.delete(`${BACKEND_URL}/api/camaras/${id}`, { withCredentials: true });
      
      console.log('Cámara eliminada exitosamente:', response.data);
      setCameras(prev => prev.filter(camera => camera.id !== id));
      
    } catch (error) {
      console.log('Error eliminando cámara:', error);
    }
  };

  const handleSaveUser = async (usuario: User, isNew: boolean) => {
    try {
      if (isNew) {
        //console.log('Creando nuevo usuario: ', usuario);
        const response = await axios.post(`${BACKEND_URL}/api/usuarios/register`, usuario, { withCredentials: true });
        //console.log('Usuario creado exitosamente:', response.data);
        setUsers(prev => [...prev, response.data]);
        // presentToast('Usuario creada exitosamente', 'success');
      } else {
        //console.log('Actualizando usuario existente: ', usuario);
        const response = await axios.put(`${BACKEND_URL}/api/usuarios/${usuario.id}`, usuario, { withCredentials: true });
        //console.log('Usuario actualizado exitosamente:', response.data);
        setUsers(prev => prev.map(u => 
          u.id === usuario.id ? response.data : u
        ));
        // presentToast('Usuario actualizada exitosamente', 'success');
      }
    } catch (error) {
      console.error(`Error ${isNew ? 'creando' : 'actualizando'} usuario:`, error);
      // Manejo de errores
      // presentToast('Error', 'error');
    }
  };

  const handleDeleteUser = async (id: number) => {
    const userToDelete = users.find(usuario => usuario.id === id);
    
    if (!userToDelete) {
      console.error('Usuario no encontrado');
      return;
    }

    try {
      console.log('Eliminar usuario:', id);
      
      const response = await axios.delete(`${BACKEND_URL}/api/usuarios/${id}`, { withCredentials: true });
      
      console.log('Usuario eliminado exitosamente:', response.data);
      setUsers(prev => prev.filter(usuario => usuario.id !== id));
      
    } catch (error) {
      console.log('Error eliminando usuario:', error);
    }
  };

  return (
    <div>
      <IonToast
        style={{'--start': '1', marginTop: '70px', '--border-radius': '20px'}}
        isOpen={showToast}
        animated={true}
        onDidDismiss={() => setShowToast(false)}
        color={'danger'}
        position='top'
        cssClass={'toast-button toast-button-icon'}
        message={lastAlert ? `Alerta en ${cameraNames[lastAlert.id_camara]}` : 'Nueva alerta'}
        //duration={5000}
        buttons={[
          {
            text: '',
            role: 'view',
            icon: videocam,
            handler: goToCamera,
          },
          {
            text: '',
            side: 'end',
            icon: close,
            role: 'cancel',
            handler: () => setShowToast(false),
          }
        ]}
      />
      {user && (user.rol == 1 || user.rol == 2) && (
        <IonFab vertical="bottom" horizontal="start" slot="fixed" style={{marginBottom: '80px', marginLeft: '20px', zIndex: 1000}}>
          <IonFabButton ref={fabButtonRef} onClick={handleShowMantenedoresRef} id="mantenedores-fab">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      )}
      <Navbar unseenCount={unseenCountAlerts} onShowNotifications={handleShowNotifications} onShowMantenedores={handleShowMantenedores}/>
      <IonPopover
        isOpen={popoverOpenMantenedores}
        //event={popoverEvent}
        trigger="mantenedores-fab"
        onDidDismiss={handleClosePopover}
        side="top"
        alignment="start"
        showBackdrop={true}
        backdropDismiss={true}
        style={{
          '--width': '300px',
          '--max-width': '90vw',
        }}
        className="mantenedores-popover"       
      >
        <div style={{ position: 'relative', zIndex: 1000 }}>
          <MantenedoresPopover
            cameras={cameras}
            nombreMantenedor='Cámaras'
            tipoMantenedor={1}
            selectedCamera={selectedCamera ? { id: selectedCamera.id } : undefined}
            variant="sidebar"
            formatearFecha={formatearFecha}
            onClose={handleClosePopover}
            onOpenModal={handleOpenModal}
          />
        </div>
      </IonPopover>

      {/* Modal de Cámaras */}
      <Cameras
        isOpen={activeModal === 'cameras'}
        onClose={handleCloseModal}
        cameras={cameras}
        onSave={handleSaveCamera}
        onDelete={handleDeleteCamera}
      />

      <Users
        isOpen={activeModal === 'users'}
        onClose={handleCloseModal}
        users={users}
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
      />  

      {/* Futuros modales para usuarios y alertas */}
      {/* <UsersModal isOpen={activeModal === 'users'} onClose={handleCloseModal} /> */}
      {/* <AlertsModal isOpen={activeModal === 'alerts'} onClose={handleCloseModal} /> */}

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
            
          />
        </IonContent>
      </IonPopover>

      <MapView
        cameras={cameras}
        selectedCamera={selectedCamera}     
        alerts={
              [...alerts].sort((a, b) => {
                // Se ordena por estado: no vistas (estado === 0) primero
                if (a.estado !== b.estado) {
                  return a.estado === 0 ? -1 : 1;
                }
                // Si tienen el mismo estado, ordenamos por hora_suceso descendente
                return new Date(b.hora_suceso).getTime() - new Date(a.hora_suceso).getTime();
              })
            }         // las alertas de la cámara
        cameraNames={cameraNames}
        user={user}
        formatearFecha={formatearFecha}
                    handleAccion={async (alert, accion) => {
              const nuevoEstado = accion === "leida" ? 1 : 2;
              await marcarVistaAlerta(alert, nuevoEstado, setAlerts, setUnseenAlerts);
            }}
        setSelectedCamera={setSelectedCamera}         // función para marcar vista/falso positivo
        onVerDescripcion={(alerta) => {
          setAlertaSeleccionada(alerta);
          setMostrarDescripcion(true);
        }}
      />
    
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
    </div>
  );
}
export default Home;
