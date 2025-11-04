import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, Polygon } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera } from '../types/Camera';
import { useEffect, useState, useRef } from "react";
import './MapView.css';
import { Tooltip } from 'react-leaflet';
import { Alert } from '../types/Alert';
import { NotificacionesPopover } from './Notificaciones';
import { IonToggle, IonButton, IonIcon } from '@ionic/react';
import { locateOutline } from 'ionicons/icons';
import { floridaPolygon } from '../data/polygon';
import { io } from 'socket.io-client';
import { SectorLayer, Sector } from "./SectorLayer";
import { LayerControl } from "./LayerControl";

const BUCKET_URL = import.meta.env.VITE_BUCKET_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CAMERA_URL = import.meta.env.VITE_CAMERA_URL;
const socket = io(BACKEND_URL);
const socketCam = io(CAMERA_URL);

const defaultCenter: LatLngExpression = [-33.523, -70.604]; // La Florida, Chile
const metropolitanRegionBounds: L.LatLngBoundsExpression = [
  [-34.2, -71.7], // Esquina Suroeste
  [-32.9, -69.8]  // Esquina Noreste
];

const puntoCentralFlorida: L.LatLngExpression = [-33.54267, -70.57344];

function FixLeafletResize({ headerHeight }: { headerHeight: number }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
      map.setView(map.getCenter());
    }, 350);
  }, [map, headerHeight]);
  return null;
}


function formatDateTimeUTC(isoString: string) {
  const date = new Date(isoString);
  
  // Extraer componentes UTC
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // Los meses son 0-indexados
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  
  // Formatear con ceros iniciales
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  return `${day}/${pad(month)}/${year} ${pad(hours)}:${pad(minutes)}`;
}


interface MapViewProps {
  cameras: Camera[];
  selectedCamera?: Camera | null;
  alerts?: Alert[];
  cameraNames?: { [key: number]: string };
  user: { usuario: string; rol: number; nombre: string } | null;
  formatearFecha?: (fechaISO: string) => string;
  handleAccion: (alert: Alert, accion: 'leida' | 'falso_positivo') => void;
  onVerDescripcion?: (alerta: Alert) => void;
  setSelectedCamera: (cam: Camera | null) => void;
  onCamerasUpdate: (cameras: Camera[]) => void;
}
export default function MapView({ cameras,selectedCamera,alerts,cameraNames,user,formatearFecha,handleAccion,onVerDescripcion ,setSelectedCamera, onCamerasUpdate}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [headerHeight, setHeaderHeight] = useState(60);
  const [activeTab, setActiveTab] = useState<'video' | 'estadisticas' | 'alertas'>('video');
  const [isDark, setIsDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [showFloridaPolygon, setShowFloridaPolygon] = useState(false);
  const polygonTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [heatmapVisible, setHeatmapVisible] = useState(false);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [toggleCooldown, setToggleCooldown] = useState<number>(0); // segundos restantes
  const [isToggleLocked, setIsToggleLocked] = useState<boolean>(false);
  const handleToggleWithCooldown = async (cameraId: number, newStatus: boolean) => {
    if (isToggleLocked) return; // Si está bloqueado, no hacer nada
    
    // Bloquear inmediatamente
    setIsToggleLocked(true);
    setToggleCooldown(60); // 1 minuto de cooldown
    
    // Cambiar estado de la cámara
    await handleToggleCamera(cameraId, newStatus);
    
    // Iniciar contador
    const interval = setInterval(() => {
      setToggleCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsToggleLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    // 1. Comprueba si hay una cámara seleccionada y si el mapa ya cargó
    if (selectedCamera && mapRef.current) {
      
      // 2. Comprueba que 'posicion' existe y tiene 2 elementos
      if (selectedCamera.posicion && selectedCamera.posicion.length === 2) {

        mapRef.current.flyTo(selectedCamera.posicion, 17);

      } else {
        console.warn("La cámara seleccionada no tiene una 'posicion' válida:", selectedCamera);
      }
    }
  }, [selectedCamera]); // <-- El array de dependencias: se ejecuta solo si 'selectedCamera' cambia


  const handleShowFloridaPolygon = () => {
    // 1. Limpia cualquier temporizador anterior
    if (polygonTimerRef.current) {
      clearTimeout(polygonTimerRef.current);
    }
    
    // 2. Muestra el polígono y resetea la animación
    setShowFloridaPolygon(true);

    // 3. Centra el mapa (igual que antes)
    if (mapRef.current) {
      mapRef.current.flyTo(puntoCentralFlorida, 13);
    }

    // 4. Configura un temporizador para ocultar el polígono (ej: 4 segundos)
    polygonTimerRef.current = setTimeout(() => {
      setShowFloridaPolygon(false);
      polygonTimerRef.current = null;
    }, 10000); // 4000ms = 4 segundos
  };

  const fetchSectoresPorFecha = async (fechaInicio: string, fechaFin: string) => {
    try {
      const params = new URLSearchParams({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      });
      
      const url = `${BACKEND_URL}/api/sectores?${params}`;
      console.log("🔍 URL de consulta:", url);
      
      const response = await fetch(url,
        {
          credentials: "include"
        }
      );
      if (!response.ok) throw new Error("Error al obtener sectores por rango");
      const data = await response.json();
      setSectores(data);
    } catch (error) {
      console.error("Error al cargar sectores por rango:", error);
    }
  };


  useEffect(() => {
    const header = document.querySelector("ion-header");
    if (header) {
      setHeaderHeight(header.offsetHeight);
    }

    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize(); // Reajusta el mapa
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    setIsDark(mediaQuery.matches);

      const handleThemeChange = (e: MediaQueryListEvent) => {
    setIsDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleThemeChange);

    window.addEventListener("resize", handleResize);
    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    window.removeEventListener("resize", handleResize);
  };
  }, []);
  
  // Colores por estado de alerta
  const getEstadoColor = (estado_camara: boolean) => (estado_camara ? 'green' : 'red');
  const getEstado = (estado_camara: boolean) => (estado_camara ? 'Activa' : 'Inactiva');

  // Marker custom con color
  const createIcon = (color: string) =>
    new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

  // Función para cerrar con llamada al backend
  const handleRevisarWhitBackend = async (cam: Camera) => {
        setSelectedCamera(cam); // Abrir el panel de la cámara seleccionada
        if(cam.link_camara_externo === "") {
          try {
            // Usando fetch (recomendado si ya estás usando fetch en el backend)
            // @ts-ignore
            const response = await fetch(`${BACKEND_URL}/casos_prueba`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: cam.id, // o el valor correcto
                link_camara: cam.link_camara
              })
            });

            if (!response.ok) {
              throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
              
            if (result.success) {
              console.log('Notificación exitosa al backend:', result);
            } else {
              console.warn('La solicitud no fue exitosa:', result.message);
            }
          } catch (error) {
              console.error('Error al notificar al backend', error);
              // Opcional: Mostrar alerta al usuario
              // alert('Error al conectar con el servidor. Intente nuevamente.');
          } finally {
            setSelectedCamera(null); 
          }
        }
        else{
          console.log('Cámara con streaming externo, no se notifica al backend.');
        }
  };

  const createCustomIcon = (color: string, count: number = 0) =>
    L.divIcon({
      className: "custom-marker",
      html: `
        <div style="position: relative; display: inline-block;">
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png" 
              style="width:25px; height:41px;" />
          ${
            count > 0
              ? `<div style="
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: red;
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid var(--ion-text-color, black);
                ">${count}</div>`
              : ""
          }
        </div>
      `,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
  });

  // Websocket cambio estado de cámaras
  useEffect(() => {
    if (!user) return;

    // Escuchar actualizaciones de cámaras
    socket.on('actualizacion-camaras', (camerasActualizadas: Camera[]) => {
      console.log('Actualización de cámaras recibida:', camerasActualizadas);
      
      // Actualizar el estado de las cámaras
      if (onCamerasUpdate) {
        onCamerasUpdate(camerasActualizadas);
      }
    });

    // Escuchar actualizaciones de estado individual de cámara
    socketCam.on('estado-camara', (data: { cameraId: number; estado: boolean; ultima_conexion?: string }) => {
      console.log('Actualización de estado de cámara:', data);
        
        // Actualizar solo la cámara específica
    if (cameras && onCamerasUpdate) {
        const updatedCameras = cameras.map(cam => 
          cam.id === data.cameraId 
            ? { 
                ...cam, 
                estado_camara: data.estado,
                ultima_conexion: data.ultima_conexion || cam.ultima_conexion
              } 
            : cam
        );
        onCamerasUpdate(updatedCameras);
      }
    });
    // Escuchar actualizaciones de estado individual de cámara
    socket.on('estado-camara', (data: { cameraId: number; estado: boolean; ultima_conexion?: string }) => {
      console.log('Actualización de estado de cámara:', data);
        
      // Actualizar solo la cámara específica
      if (cameras && onCamerasUpdate) {
        const updatedCameras = cameras.map(cam => 
          cam.id === data.cameraId 
            ? { 
                ...cam, 
                estado_camara: data.estado,
                ultima_conexion: data.ultima_conexion || cam.ultima_conexion
              } 
            : cam
        );
        onCamerasUpdate(updatedCameras);
      }
    });

    socket.on('camera_deleted', (data: { cameraId: number }) => {
      console.log('🗑️ Cámara eliminada:', data.cameraId);
      if (cameras && onCamerasUpdate) {
        const updatedCameras = cameras.filter(cam => cam.id !== data.cameraId);
        onCamerasUpdate(updatedCameras);
      }
    });

    // Limpieza al desmontar el componente
    return () => {
      socketCam.off('estado-camara');
      socket.off('actualizacion-alertas');
      socket.off('camera_deleted');
    };
  }, [user, cameras, onCamerasUpdate]);

  const handleToggleCamera = async (cameraId: number, newStatus: boolean) => {
    try {
      // Llamar a la API para cambiar el estado
      const response = await fetch(`${CAMERA_URL}/camaras/${cameraId}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`Estado de cámara ${cameraId} actualizado a: ${newStatus}`);
      } else {
        console.warn('La actualización no fue exitosa:', result.message);
        // Revertir el toggle si falla
      }
    } catch (error) {
      console.error('Error al cambiar estado de cámara:', error);
      // Revertir el toggle en caso de error
    }
  };
  
  const getUnreadAlertsCount = (camId: number) => {
    if (!alerts) return 0;
    return alerts.filter(a => a.id_camara === camId && a.estado === 0).length;
  };

  const maxAlertas = Math.max(...sectores.map(s => s.total_alertas));

  const toggleHeatmap = () => setHeatmapVisible((v) => !v);

  return (
    <div className="map-layout" style={{ height: `calc(100vh - ${headerHeight}px)` }}>
      {/* LayerControl UI */}
      {user && (user.rol === 1 || user.rol === 2) && (
        <div className="layer-control-wrapper">
          <LayerControl
            heatmapVisible={heatmapVisible}
            toggleHeatmap={toggleHeatmap}
            onFetchSectores={fetchSectoresPorFecha} // pasa la nueva función
          />
        </div>
      )}
      {/* Botón para Localizar La Florida (Bottom-Right) */}
      {user && (user.rol === 1 || user.rol === 2) && (
        <div className="florida-locate-button-wrapper">
          <IonButton onClick={handleShowFloridaPolygon} color="light" className="florida-locate-button">
            <IonIcon slot="icon-only" icon={locateOutline} />
          </IonButton>
        </div>
      )}
      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{ height: `calc(100vh - ${headerHeight}px)`, width: '100%' }}
        // @ts-ignore
        whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        ref={mapRef}
        zoomControl={false}
        maxBounds={metropolitanRegionBounds} // Establece los límites geográficos
        minZoom={9}                         // Impide alejar el zoom más allá de este nivel
        maxBoundsViscosity={1.0}            // Hace que los límites sean sólidos
      >
  <TileLayer
    attribution='&copy; ComuVigIA'
    url={
      isDark
      ?  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      :   "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    }
  />

  {
  /* modo oscuro
  <TileLayer
    attribution='&copy; CartoDB'
    
  />
  */}
        <ZoomControl position="bottomright" /> {/* Puedes usar: 'topleft', 'topright', 'bottomleft', 'bottomright' */}
        <FixLeafletResize headerHeight={headerHeight} />
        {cameras.map(cam => (
          <Marker
            key={cam.id}
            position={cam.posicion as LatLngExpression}
            icon={createCustomIcon(getEstadoColor(cam.estado_camara), getUnreadAlertsCount(cam.id))}
          >
            <Popup className="pop-up">
              <b>{cam.nombre}</b><br />
              Estado: <span style={{ color: getEstadoColor(cam.estado_camara) }}>{getEstado(cam.estado_camara)}</span>
              <br />
              Última conexión: <span>{formatDateTimeUTC(cam.ultima_conexion)}</span>
              <br />
              {user && (user.rol === 1 || user.rol === 2) && (
                <>
                  Cantidad de alertas: <strong>{cam.total_alertas ?? 0}</strong>
                  <br />
                  <IonToggle 
                    enableOnOffLabels={true}
                    checked={cam.estado_camara}
                    disabled={isToggleLocked}
                    onIonChange={(e) => {
                      const newStatus = e.detail.checked;
                      handleToggleWithCooldown(cam.id, newStatus);
                    }}
                  >
                    Activar/Desactivar cámara
                    {isToggleLocked && (
                      <span style={{
                        color: 'orange', 
                        fontSize: '12px',
                        marginLeft: '5px'
                      }}>
                        (Espera {toggleCooldown}s)
                      </span>
                    )}
                  </IonToggle>
                  <br />
                </>
              )}
              <button
                style={{
                  marginTop: 8,
                  padding: '6px 16px',
                  background: '#1B4965',
                  color: 'white',
                  border: 'none',
                  borderRadius: 15,
                  cursor: 'pointer'
                }}
                onClick={() => handleRevisarWhitBackend(cam)}
              >Ver transmisión
              </button>
            </Popup>
            {/*<Tooltip direction="left" opacity={1}>
              <b>{cam.nombre}</b><br />
              Estado: <span style={{ color: getEstadoColor(cam.estado_camara) }}>{getEstado(cam.estado_camara)}</span>
              <br />
              Última conexión: <span>{formatDateTimeUTC(cam.ultima_conexion)}</span>
              <br />
              Cantidad de Alertas: <strong>{cam.total_alertas ?? 0}</strong>
            </Tooltip>*/}
          </Marker>
        ))}
        {/* Renderiza todos los sectores como "Mapa de calor" si está activo */}
        {heatmapVisible &&
          sectores.map((sector) => (
            <SectorLayer key={sector.id} sector={sector} visible={true} maxAlertas={maxAlertas} />
          ))
        }
        {showFloridaPolygon && (
          <Polygon
            positions={floridaPolygon}
            pathOptions={{
              // Colores válidos y relleno para que la animación sea visible
              opacity: 0.8,
              fillOpacity: 0,
              color: '#ffffffff',
              weight: 2,
            }}
          />
        )}
      </MapContainer>
      {selectedCamera && (
        <div className="camera-panel" style={{ top: headerHeight }}>
          <h2 className='camera-panel-text'>{selectedCamera.nombre}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            {selectedCamera.link_camara_externo !== "" ? (
              // Caso con streaming externo: mostrar imagen
              <>
                <img
                    style={{ 
                    width: '100%', 
                    maxHeight: 350, 
                    objectFit: 'contain', 
                    background: '#fff', 
                    border: '3px solid #000', 
                    borderLeft: 'none', 
                    borderRight: 'none' 
                    }}
                    src={selectedCamera.link_camara_externo}
                    alt="Streaming de cámara"
                />
              </>
            ) : (
              // Caso sin externo: usar link_camara en <video>
              <>
                <video 
                  src={`${BUCKET_URL}${selectedCamera.link_camara}`}
                  controls
                  autoPlay
                  muted
                  className="camera-video"
                />
                {/*selectedCamera.link_camara && handleRevisarWhitBackend()*/}
              </>
            )}
          </div>
          {user && (user.rol == 1 || user.rol == 2) && (
            <div className="tab-buttons">
              {/*<button onClick={() => setActiveTab('video')}>🎥 Video</button>*/}
              <button onClick={() => setActiveTab('estadisticas')}>📊 Estadísticas</button>
              <button onClick={() => setActiveTab('alertas')}>🚨 Alertas</button>
            </div>
          )}

          <div className="tab-content"> 
              {activeTab === 'video' && <div>Contenido de Video (aún vacío)</div>}
              {activeTab === 'estadisticas' && <div>Contenido de Estadísticas (aún vacío)</div>}
              {activeTab === 'alertas' && selectedCamera && alerts && (
                <NotificacionesPopover
                  alerts={alerts}
                  selectedCamera={selectedCamera}
                  cameraNames={cameraNames!}
                  variant="map"
                  formatearFecha={formatearFecha!}
                  handleAccion={handleAccion!}
                  onVerDescripcion={onVerDescripcion!}
                />
              )}
          {/*
            {activeTab === 'video' && <TabVideo camera={selectedCamera} />}
            {activeTab === 'estadisticas' && <TabEstadisticas camera={selectedCamera} />}
            {activeTab === 'alertas' && <NotificacionesPorCamara camera={selectedCamera} />}
          */}
          </div>
          <p><strong>Estado:</strong> <span style={{ color: getEstadoColor(selectedCamera.estado_camara) }}>{getEstado(selectedCamera.estado_camara)}</span></p>
          <p><strong>Última conexión:</strong> {formatDateTimeUTC(selectedCamera.ultima_conexion)}</p>
          {user && (user.rol == 1 || user.rol == 2) && (
            <div>
              <p><strong>Alertas:</strong> {selectedCamera.total_alertas ?? 0}</p>
              <p><strong>Sector:</strong> {selectedCamera.id_sector ?? 0}</p>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <button onClick={() => setSelectedCamera(null)}>Cerrar panel</button>
          </div>
        </div>
      )}
    </div>
  );
}