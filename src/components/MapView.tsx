import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultCenter: LatLngExpression = [-33.523, -70.604]; // La Florida, Chile

export default function MapView({cameras, onShowModal}) {

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
        >
          <Popup>
            <b>{cam.nombre}</b><br />
            Estado: <span style={{ color: getEstadoColor(cam.estadoCamara) }}>{getEstado(cam.estadoCamara)}</span>
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
  );
}
