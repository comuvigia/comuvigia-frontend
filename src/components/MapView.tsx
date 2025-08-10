import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera } from '../types/Camera';
import { useEffect, useState, useRef } from "react";

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
  const pad = num => num.toString().padStart(2, '0');
  
  return `${day}/${pad(month)}/${year} ${pad(hours)}:${pad(minutes)}`;
}


interface MapViewProps {
  cameras: Camera[];
  onShowModal: (camera: Camera) => void;
}
export default function MapView({ cameras, onShowModal }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [headerHeight, setHeaderHeight] = useState(60);

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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  return (
    <div className="map-container">
      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{ height: `calc(100vh - ${headerHeight}px)`, width: '100%' }}
        whenCreated={mapInstance => { mapRef.current = mapInstance; }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FixLeafletResize headerHeight={headerHeight} />
        {cameras.map(cam => (
          <Marker
            key={cam.id}
            position={cam.posicion as LatLngExpression}
            icon={createIcon(getEstadoColor(cam.estado_camara))}
          >
            <Popup>
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
                  background: '#3880ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
                onClick={() => onShowModal(cam)}
              >Ver transmisión
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
