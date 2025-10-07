import React from "react";
import { Polygon, LayerGroup, Tooltip } from "react-leaflet";
import { LatLngExpression } from "leaflet";

export interface Sector {
  id: number;
  nombre_sector: string;
  coordinates: [number, number][]; // o LatLngExpression[]
  total_alertas: number; // nuevo
}

interface SectorLayerProps {
  sector: Sector;
  visible: boolean;
  maxAlertas: number; // máximo de alertas de todos los sectores
}

function getHeatmapColor(count: number, maxCount: number) {
  const ratio = Math.min(count / maxCount, 1);
  const red = Math.floor(255 * ratio);
  const green = Math.floor(255 * (1 - ratio));
  return `rgb(${red},${green},0)`; // verde → amarillo → rojo
}

export const SectorLayer: React.FC<SectorLayerProps> = ({ sector, visible, maxAlertas }) => {
  if (!visible) return null;

  const coordinates = sector.coordinates.map(coord => [coord[0], coord[1]] as LatLngExpression);


  const color = getHeatmapColor(sector.total_alertas, maxAlertas);

  return (
    <LayerGroup>
      <Polygon
        positions={coordinates}
        pathOptions={{
          color: color,      // borde
          fillColor: color,  // relleno
          fillOpacity: 0.2,  // opacidad del relleno
          weight: 0.2,         // grosor del borde
        }}
      >
        <Tooltip>{`${sector.nombre_sector} - Alertas: ${sector.total_alertas}`}</Tooltip>
      </Polygon>
    </LayerGroup>
  );
};
