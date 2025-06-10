import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultCenter: LatLngExpression = [-33.523, -70.604]; // La Florida, Chile

// Arreglo de cámaras (luego esto vendrá de tu backend o API)
const initialCameras = [
  { id: 1, posicion: [-33.52, -70.603], estadoCamara: true, nombre: 'Cámara Plaza', linkCamara: '', direccion: 'Avenida 123', ultimaConexion : "2024-06-09T19:30:00Z" },
  { id: 2, posicion: [-33.525, -70.6], estadoCamara: false, nombre: 'Cámara Sur', linkCamara: '', direccion: 'Avenida 123', ultimaConexion : "2024-06-09T19:30:00Z" },
  { id: 3, posicion: [-33.511, -70.59], estadoCamara: true, nombre: 'Cámara Centro', linkCamara: '', direccion: 'Avenida 123', ultimaConexion : "2024-06-09T19:30:00Z" },
];

export default function MapView({ onCameraClick }: { onCameraClick: (cam: any) => void }) {
  const [cameras, setCameras] = useState(initialCameras);

  // Colores por estado de alerta
  const getEstadoColor = (estadoCamara: boolean) => {
    if (estadoCamara) return 'green';
    else return 'red';
  };
  const getEstado = (estadoCamara: boolean) => {
    if (estadoCamara) return 'Activa';
    else return 'Inactiva';
  };

  // Marker custom con color
  const createIcon = (color: string) =>
    new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

  return (
    <MapContainer center={defaultCenter} zoom={14} style={{ height: "calc(100vh - 120px)", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {cameras.map(cam => (
        <Marker
          key={cam.id}
          position={cam.posicion as LatLngExpression}
          icon={createIcon(getEstadoColor(cam.estadoCamara))}
          eventHandlers={{
            click: () => onCameraClick(cam)
          }}
        >
          <Popup>
            <b>{cam.nombre}</b><br />
            Estado: <span style={{ color: getEstadoColor(cam.estadoCamara) }}>{getEstado(cam.estadoCamara)}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
