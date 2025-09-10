import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera } from '../types/Camera';
import { useEffect, useState, useRef } from "react";
import './MapView.css';
import { Tooltip } from 'react-leaflet';
import { Alert } from '../types/Alert';
import { NotificacionesPopover } from './Notificaciones';

const BUCKET_URL = import.meta.env.VITE_BUCKET_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const defaultCenter: LatLngExpression = [-33.523, -70.604]; // La Florida, Chile

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
  formatearFecha?: (fechaISO: string) => string;
  handleAccion: (alert: Alert, accion: 'leida' | 'falso_positivo') => void;
  onVerDescripcion?: (alerta: Alert) => void;
  setSelectedCamera: (cam: Camera | null) => void;
}
export default function MapView({ cameras,selectedCamera,alerts,cameraNames,formatearFecha,handleAccion,onVerDescripcion ,setSelectedCamera}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [headerHeight, setHeaderHeight] = useState(60);
  const [activeTab, setActiveTab] = useState<'video' | 'estadisticas' | 'alertas'>('video');
  const [isDark, setIsDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  

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
            const response = await fetch(`${BACKEND_URL}/casos_prueba?delito=${encodeURIComponent(cam.link_camara)}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
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

        const getUnreadAlertsCount = (camId: number) => {
          if (!alerts) return 0;
          return alerts.filter(a => a.id_camara === camId && a.estado === 0).length;
        };
  
  return (
    <div className="map-layout" style={{ height: `calc(100vh - ${headerHeight}px)` }}>
      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{ height: `calc(100vh - ${headerHeight}px)`, width: '100%' }}
        // @ts-ignore
        whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        zoomControl={false}
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
              Cantidad de Alertas: <strong>{cam.total_alertas ?? 0}</strong>
              <br />
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
          <div className="tab-buttons">
            {/*<button onClick={() => setActiveTab('video')}>🎥 Video</button>*/}
            <button onClick={() => setActiveTab('estadisticas')}>📊 Estadísticas</button>
            <button onClick={() => setActiveTab('alertas')}>🚨 Alertas</button>
          </div>

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
          <p><strong>Alertas:</strong> {selectedCamera.total_alertas ?? 0}</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <button onClick={() => setSelectedCamera(null)}>Cerrar panel</button>
          </div>
        </div>
      )}
    </div>
  );
}
