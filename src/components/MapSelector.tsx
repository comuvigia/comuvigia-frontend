// components/MapSelector.tsx
import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton } from '@ionic/react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, ZoomControl } from 'react-leaflet';
import L, { LatLngExpression, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onPositionSelect: (lat: number, lng: number, ubicacion: string) => void;
  initialPosition: [number, number];
}

// Límites de Santiago de Chile
const SANTIAGO_BOUNDS = new LatLngBounds(
  [-33.650, -70.900], // Esquina suroeste
  [-33.350, -70.500]  // Esquina noreste
);

const DEFAULT_CENTER: [number, number] = [-33.523, -70.604]; // La Florida, Chile

// Componente para limitar el mapa a Santiago y centrarlo correctamente
function SantiagoBounds({ initialPosition }: { initialPosition: [number, number] }) {
  const map = useMap();

  React.useEffect(() => {
    // Establecer los límites máximos
    map.setMaxBounds(SANTIAGO_BOUNDS);
    
    // Centrar el mapa en la posición inicial
    map.setView(initialPosition, 13);
    
    // Si el mapa se sale de los límites, regresarlo a Santiago
    map.on('drag', () => {
      if (!SANTIAGO_BOUNDS.contains(map.getCenter())) {
        map.panInsideBounds(SANTIAGO_BOUNDS, { animate: true });
      }
    });

    return () => {
      map.off('drag');
    };
  }, [map, initialPosition]);

  return null;
}

// Componente para centrar el mapa cuando cambia la posición inicial
function MapCenterUpdater({ position }: { position: [number, number] }) {
  const map = useMap();
  
  React.useEffect(() => {
    map.setView(position, map.getZoom());
  }, [map, position]);
  
  return null;
}

function FixLeafletResize() {
  const map = useMap();
  React.useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
}

const MapSelector: React.FC<MapSelectorProps> = ({
  isOpen,
  onClose,
  onPositionSelect,
  initialPosition
}) => {
  const [position, setPosition] = React.useState<[number, number]>(initialPosition);
  const [isDark, setIsDark] = React.useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Resetear la posición cuando se abre el modal con una nueva initialPosition
  React.useEffect(() => {
    if (isOpen) {
      setPosition(initialPosition);
    }
  }, [isOpen, initialPosition]);

  // Manejador de clicks en el mapa
  function MapClickHandler() {
    useMapEvents({
      click: (e) => {
        const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
        
        // Verificar que el click esté dentro de los límites de Santiago
        if (SANTIAGO_BOUNDS.contains(newPos)) {
          setPosition(newPos);
        }
      },
    });
    return null;
  }

  // Detectar tema oscuro
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleThemeChange);
    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, []);

  const handleConfirm = () => {
    const lat = position[0].toString().replace(',', '.');;
    const long = position[1].toString().replace(',', '.');;
axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}&addressdetails=1`)
  .then(response => {
    if (response.status === 200) {
      const address = response.data.address;

      // Construye una dirección más completa
      const direccionCompleta = [
        address.road,
        address.house_number,
        address.suburb,
        address.city || address.town || address.village,
        address.state,
        address.postcode,
        address.country
      ]
        .filter(Boolean) // elimina undefined o null
        .join(', ');

      console.log("Dirección completa:", direccionCompleta);
      onPositionSelect(position[0], position[1], direccionCompleta);
    }
    })
    .catch(error => {
      console.error('Error al obtener ubicación open street map:', error);
    })
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Seleccionar Ubicación en Santiago</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Cancelar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ height: '38vh', width: '100%', position: 'relative' }}>
          <MapContainer
            center={initialPosition}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            minZoom={11}
            maxZoom={18}
          >
            <TileLayer
              attribution='&copy; ComuVigIA'
              url={
                isDark
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              }
            />
            
            <ZoomControl position="bottomright" />
            <FixLeafletResize />
            <SantiagoBounds initialPosition={initialPosition} />
            <MapClickHandler />
            
            {/* Actualizar el centro si initialPosition cambia */}
            <MapCenterUpdater position={initialPosition} />
            
            {/* Marker en la posición seleccionada */}
            {position && (
              <Marker 
                position={position}
                icon={new L.Icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })}
              />
            )}
          </MapContainer>
        </div>
        
        <div className="ion-padding">
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: 'var(--ion-color-light)',
            borderRadius: '8px'
          }}>
            <strong>Coordenadas seleccionadas:</strong>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>
              Lat: <strong>{position[0].toFixed(6)}</strong>, 
              Lng: <strong>{position[1].toFixed(6)}</strong>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)', marginTop: '5px' }}>
              Haz clic en el mapa para cambiar la ubicación
            </div>
          </div>
          
          <IonButton 
            expand="block" 
            onClick={handleConfirm}
            style={{ '--border-radius': '8px' }}
          >
            Confirmar Ubicación
          </IonButton>
          
          {/*<div style={{ 
            textAlign: 'center', 
            marginTop: '10px',
            fontSize: '12px',
            color: 'var(--ion-color-medium)'
          }}>
            Mapa limitado a Santiago de Chile
          </div>*/}
        </div>
      </IonContent>
    </IonModal>
  );
};

export default MapSelector;