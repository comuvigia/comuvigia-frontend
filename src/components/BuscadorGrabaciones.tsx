import React, { useState, useEffect } from 'react';
import { 
  IonIcon,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonButton,
  IonList,
  IonSpinner
} from '@ionic/react';
import axios from 'axios';
import { Camera } from '../types/Camera';
import './BuscadorGrabaciones.css';
import '../pages/Historial.css';
import { videocam } from 'ionicons/icons';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function BuscadorGrabaciones(){
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString());
  const [endDate, setEndDate] = useState<string>(new Date().toISOString());
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar cámaras al montar el componente
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await axios.get<Camera[]>(`${BACKEND_URL}/api/camaras`);
        setCameras(response.data);
        if (response.data.length > 0) {
          setSelectedCamera(response.data[0].id);
        }
      } catch (err) {
        setError('Error al cargar las cámaras');
        console.error(err);
      }
    };
    fetchCameras();
  }, []);

  // Función para buscar grabaciones
  const searchRecordings = async () => {
    if (!selectedCamera) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${BACKEND_URL}/api/recordings`, {
        params: {
          cameraId: selectedCamera,
          start: new Date(startDate).toISOString(),
          end: new Date(endDate).toISOString()
        }
      });
      
      setRecordings(response.data);
    } catch (err) {
      setError('Error al buscar grabaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="containerHistorial">
     
      <div style={{ 
          width: '-moz-available',
          display: 'flex',
          flexDirection: 'column',
          height: '500px'
      }}>
        <div style={{
          overflowY: 'auto',
          flexGrow: 1,
          marginTop: '10px',
          paddingRight: '8px'
        }}>
          <IonList style={{ display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'}}
          >
            {/* Selector de cámara */}
            <IonItem>
              <IonLabel position="stacked">Cámara</IonLabel>
              <IonSelect 
                value={selectedCamera} 
                onIonChange={e => setSelectedCamera(e.detail.value)}
                interface="popover"
              >
                {cameras.map(camera => (
                  <IonSelectOption key={camera.id} value={camera.id}>
                    {camera.nombre}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            {/* Selector de fecha inicial */}
            <IonItem>
              <IonLabel position="stacked">Fecha inicial</IonLabel>
              <IonDatetime
                presentation="date" 
                preferWheel={true}
                value={startDate}
                onIonChange={e => setStartDate(e.detail.value as string)}
              />
            </IonItem>

            {/* Selector de fecha final */}
            <IonItem>
              <IonLabel position="stacked">Fecha final</IonLabel>
              <IonDatetime
                presentation="date" 
                preferWheel={true}
                value={endDate}
                onIonChange={e => setEndDate(e.detail.value as string)}
                min={startDate}
              />
            </IonItem>

            {/* Botón de búsqueda */}
            <IonButton 
              expand="block" 
              onClick={searchRecordings}
              disabled={loading || !selectedCamera}
              style={{ marginTop: '20px' }}
            >
              {loading ? <IonSpinner name="crescent" /> : 'Buscar Grabaciones'}
            </IonButton>

            {/* Mensaje de error */}
            {error && <p className="error-message">{error}</p>}
          </IonList>
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {recordings.length > 0 && (
        <div className="results-container">
          <h2>Resultados ({recordings.length})</h2>
          <IonList style={{ paddingBottom: '20px' }}>
            {recordings.map(recording => (
              <IonItem key={recording.id} button detail>
                <IonLabel>
                  <h3>{new Date(recording.timestamp).toLocaleString()}</h3>
                  <p>Duración: {recording.duration}s</p>
                  <p>Tamaño: {(recording.size / 1024 / 1024).toFixed(2)} MB</p>
                </IonLabel>
                <IonButton 
                  slot="end" 
                  fill="clear"
                  onClick={() => window.open(`${BACKEND_URL}${recording.url}`, '_blank')}
                >
                  Ver
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        </div>
      )}
    </div>
  );
};