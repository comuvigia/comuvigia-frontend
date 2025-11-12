import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/NavBar';
import { Camera } from '../types/Camera';
import { Alert } from '../types/Alert';
import {
  IonLabel, IonList, IonItem, IonPopover, IonContent, IonButton, IonSpinner,
  IonChip, IonIcon, IonTitle, IonSelectOption, IonSearchbar, IonSelect, IonTextarea
} from '@ionic/react';
import { alertCircle, time, checkmarkCircle, closeCircleOutline, create, trash } from 'ionicons/icons';
import { NotificacionesPopover } from '../components/Notificaciones';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Historial.css';
import { useUser } from '../UserContext';
import HistorialTutorial from '../components/HistorialTutorial';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CAMERA_URL = import.meta.env.VITE_CAMERA_URL;
const socket = io(BACKEND_URL);

export default function Historial() {
  const { user } = useUser();

  // ---------- Estados ----------
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState(['id', 'descripcion_suceso', 'mensaje']);
  const [modeOfSearch, setModeOfSearch] = useState<'or' | 'and'>('or');
  const [searching, setSearching] = useState(false);

  const [allCameras, setAllCameras] = useState<Camera[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [filteredCameras, setFilteredCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const [loadingCameras, setLoadingCameras] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [error, setError] = useState('');
  const [unseenAlerts, setUnseenAlerts] = useState<Alert[]>([]);
  const [cameraNames, setCameraNames] = useState<{ [key: number]: string }>({});
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<MouseEvent | undefined>(undefined);

  const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Estados para edición/eliminación
  const [editandoDescripcion, setEditandoDescripcion] = useState(false);
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // ---------- Fetchers ----------
  const fetchCameras = async () => {
    try {
      setLoadingCameras(true);
      const res = await axios.get<Camera[]>(`${BACKEND_URL}/api/camaras/`, { withCredentials: true });
      setAllCameras(res.data);
      setCameras(res.data);
      setFilteredCameras(res.data);
      if (!selectedCamera && res.data.length > 0) setSelectedCamera(res.data[0]);
    } catch (err) {
      console.error(err);
      setError('Error cargando cámaras');
    } finally {
      setLoadingCameras(false);
    }
  };

  const fetchAllAlerts = async () => {
    if (!user) return;
    try {
      setLoadingAlerts(true);
      const res = await axios.get<Alert[]>(`${BACKEND_URL}/api/alertas`, { withCredentials: true });
      setAllAlerts(res.data);
      setAlerts(res.data);
      setFilteredAlerts(res.data.filter(a => a.id_camara === (selectedCamera?.id ?? res.data[0]?.id_camara ?? 0)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const fetchCameraNames = async () => {
    if (!user) return;
    try {
      const res = await axios.get<{ [key: number]: string }>(`${BACKEND_URL}/api/camaras/nombre-camaras`, { withCredentials: true });
      setCameraNames(res.data);
    } catch (err) {
      console.error('Error al obtener nombres de cámaras:', err);
    }
  };

  const fetchUnseenAlerts = async () => {
    if (!user) return;
    try {
      const res = await axios.get<Alert[]>(`${BACKEND_URL}/api/alertas/no-vistas`, { withCredentials: true });
      setUnseenAlerts(res.data);
    } catch (err) {
      console.error('Error al obtener alertas no vistas:', err);
    }
  };

  // ---------- Tutorial ----------
  const handleShowTutorial = () => setShowTutorial(true);
  const handleFinishTutorial = () => setShowTutorial(false);

  // ---------- Filtro global ----------
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSelectedAlert(null);
    try {
      const fields = activeFilters.join(',');
      const response = await axios.get(`${BACKEND_URL}/api/alertas/historial-filtro`, {
        params: { q: searchQuery, fields, mode: modeOfSearch },
        withCredentials: true
      });
      const filteredFromServer: Alert[] = response.data;

      setAlerts(filteredFromServer);

      const cameraIdsWithAlerts = Array.from(new Set(filteredFromServer.map(a => a.id_camara)));
      setFilteredCameras(allCameras.filter(c => cameraIdsWithAlerts.includes(c.id)));

      if (selectedCamera && !cameraIdsWithAlerts.includes(selectedCamera.id)) {
        setSelectedCamera(null);
      } else if (!selectedCamera && cameraIdsWithAlerts.length > 0) {
        const cam = allCameras.find(c => c.id === cameraIdsWithAlerts[0]);
        if (cam) setSelectedCamera(cam);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilters(['id', 'descripcion_suceso', 'mensaje']);
    setAlerts(allAlerts);
    setFilteredCameras(allCameras);
    if (allCameras.length > 0) setSelectedCamera(allCameras[0]);
    setFilteredAlerts(allAlerts.filter(a => a.id_camara === (allCameras[0]?.id ?? 0)));
    setSelectedAlert(null);
  };

  // ---------- Handlers para editar / eliminar ----------
  const handleEditarDescripcion = () => {
    if (selectedAlert) {
      setEditandoDescripcion(true);
      setNuevaDescripcion(selectedAlert.descripcion_suceso || '');
    }
  };

  const handleGuardarDescripcion = async () => {
    if (!selectedAlert) return;
    setGuardando(true);
    try {
      await axios.put(`${BACKEND_URL}/api/alertas/${selectedAlert.id}`, { descripcion_suceso: nuevaDescripcion }, { withCredentials: true });
      setAlerts(prev => prev.map(a => a.id === selectedAlert.id ? { ...a, descripcion_suceso: nuevaDescripcion } : a));
      setSelectedAlert(prev => prev ? { ...prev, descripcion_suceso: nuevaDescripcion } : null);
      setEditandoDescripcion(false);
    } catch (err) {
      console.error('Error al guardar descripción:', err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarAlerta = async () => {
    if (!selectedAlert) return;
    if (!window.confirm('¿Seguro que deseas eliminar esta alerta?')) return;
    setEliminando(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/alertas/${selectedAlert.id}`, { withCredentials: true });
      setAlerts(prev => prev.filter(a => a.id !== selectedAlert.id));
      setMostrarDescripcion(false);
    } catch (err) {
      console.error('Error al eliminar alerta:', err);
    } finally {
      setEliminando(false);
    }
  };

  // ---------- useEffects ----------
  useEffect(() => {
    if (!user) return;
    fetchCameras();
    fetchAllAlerts();
    fetchCameraNames();
    fetchUnseenAlerts();
  }, [user]);

  useEffect(() => {
    if (!selectedCamera) {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(a => a.id_camara === selectedCamera.id));
    }
  }, [alerts, selectedCamera]);

  // ---------- WebSocket ----------
  useEffect(() => {
    if (!user) return;

    if (user.rol === 1 || user.rol === 2) {
      socket.on('nueva-alerta', (alerta: Alert) => {
        setAlerts(prev => [alerta, ...prev]);
        if (alerta.estado === 0) setUnseenAlerts(prev => [alerta, ...prev]);
        setCameras(prev => prev.map(c => c.id === alerta.id_camara ? { ...c, total_alertas: (c.total_alertas ?? 0) + 1 } : c));
      });

      socket.on('nueva-descripcion', (alerta: Alert) => {
        setAlerts(prev => prev.map(a => a.id === alerta.id ? { ...a, descripcion_suceso: alerta.descripcion_suceso } : a));
        setSelectedAlert(prev => prev && prev.id === alerta.id ? { ...prev, descripcion_suceso: alerta.descripcion_suceso } : prev);
      });

      return () => {
        socket.off('nueva-alerta');
        socket.off('nueva-descripcion');
      };
    }
  }, [user]);

  // ---------- Helpers ----------
  const formatearFecha = (fechaISO: string) => new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
  }).format(new Date(fechaISO));

  const getScoreClass = (score: number) => score >= 0.6 ? 'score-high' : score >= 0.4 ? 'score-medium' : 'score-low';
  const getStateClass = (estado: number) => estado === 0 ? 'state-in-progress' : estado === 1 ? 'state-resolved' : 'state-pending';
  const getStateIcon = (estado: number) => estado === 0 ? time : estado === 1 ? checkmarkCircle : closeCircleOutline;
  const formatEstado = (estado: number) => estado === 0 ? 'En progreso' : estado === 1 ? 'Resuelta' : 'Falso positivo';

  // ---------- Render ----------
  return (
    <IonContent>
      <HistorialTutorial run={showTutorial} onFinish={handleFinishTutorial} />
      <Navbar
        unseenCount={unseenAlerts.length}
        onShowNotifications={(e) => { setPopoverEvent(e.nativeEvent); setPopoverOpen(true); }}
        onShowTutorial={handleShowTutorial}
      />

      <IonPopover isOpen={popoverOpen} event={popoverEvent} onDidDismiss={() => setPopoverOpen(false)} side="bottom" alignment="end">
        <IonContent>
          <NotificacionesPopover
            alerts={[...alerts].sort((a, b) =>
              a.estado !== b.estado ? (a.estado === 0 ? -1 : 1) :
                new Date(b.hora_suceso).getTime() - new Date(a.hora_suceso).getTime()
            )}
            cameraNames={cameraNames}
            variant="sidebar"
            formatearFecha={formatearFecha}
            handleAccion={async () => { }}
            onVerDescripcion={(alerta) => { setSelectedAlert(alerta); setMostrarDescripcion(true); }}
            mostrarCamarasCaidas={true}
          />
        </IonContent>
      </IonPopover>

      <div className="search-section">
        <IonSearchbar
          style={{'--border-radius': '12px'}}
          placeholder="Buscar alertas..."
          value={searchQuery}
          onIonInput={e => {
            const value = (e.target as HTMLIonSearchbarElement).value || '';
            setSearchQuery(value);
            if (!value.trim()) handleClearFilters();
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSearch();
          }}
        />

        <IonSelect multiple value={activeFilters} onIonChange={e => setActiveFilters(e.detail.value)} interface="popover">
          <IonSelectOption value="id">ID</IonSelectOption>
          <IonSelectOption value="descripcion_suceso">Descripción</IonSelectOption>
          <IonSelectOption value="mensaje">Delito</IonSelectOption>
        </IonSelect>

        <IonSelect value={modeOfSearch} onIonChange={e => setModeOfSearch(e.detail.value)} interface="popover">
          <IonSelectOption value="or">OR</IonSelectOption>
          <IonSelectOption value="and">AND</IonSelectOption>
        </IonSelect>
        <IonButton color="primary" onClick={handleSearch} disabled={searching}>{searching ? 'Buscando...' : 'Buscar'}</IonButton>
        <IonButton color="medium" onClick={handleClearFilters}>Limpiar filtros</IonButton>
      </div>

      {filteredAlerts.length === 0 ? (
        <h1 className="no-alerts">No hay alertas disponibles</h1>
      ) : (
        <div className="historial-page">
          <div className="cameras-list">
            <IonTitle>Cámaras</IonTitle>
            {loadingCameras ? (
              <div className="loading-container">
                <IonSpinner name="crescent" /><p>Cargando cámaras...</p>
              </div>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : (
              filteredCameras.map(cam => (
                <div
                  key={cam.id}
                  className={`camera-item ${selectedCamera?.id === cam.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCamera(cam)}
                >
                  <strong>{cam.nombre}</strong>
                  <p>{cam.direccion}</p>
                </div>
              ))
            )}
          </div>

          <div className="alerts-panel">
            <IonTitle>Alertas {selectedCamera ? `de ${selectedCamera.nombre}` : ''}</IonTitle>
            {[0, 1, 2].map(estado => {
              const filtered = filteredAlerts.filter(a => a.estado === estado);
              const estadoText = estado === 0 ? 'En progreso / No vistas' : estado === 1 ? 'Resueltas' : 'Falsos positivos';
              return (
                <div key={estado} className="alert-section">
                  <h3>{estadoText} ({filtered.length})</h3>
                  {filtered.map(alert => (
                    <div
                      key={alert.id}
                      className={`alert-card estado-${alert.estado}`}
                      onClick={() => { setSelectedAlert(alert); setMostrarDescripcion(true); }}
                    >
                      <div className="alert-header">
                        <span className="alert-title">Alerta {alert.id}</span>
                        <span className="alert-time">{formatearFecha(alert.hora_suceso)}</span>
                      </div>
                      <p className="alert-message">{alert.mensaje}</p>
                      <div className="alert-footer">
                        <div className={`alert-chip ${getScoreClass(alert.score_confianza)}`}>
                          <IonIcon icon={alertCircle} /> <span>Score: {alert.score_confianza}</span>
                        </div>
                        <div className={`alert-chip ${getStateClass(alert.estado)}`}>
                          <IonIcon icon={getStateIcon(alert.estado)} /> <span>{formatEstado(alert.estado)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          {/* PANEL DE DETALLE (EDITAR/ELIMINAR) */}
          {mostrarDescripcion && selectedAlert && (
            <div className="alert-detail">
              <h2>Alerta {selectedAlert.id}</h2>
              <p>
                <strong>Score:</strong> {selectedAlert.score_confianza} •{' '}
                <strong>Ubicación:</strong> {cameraNames[selectedAlert.id_camara] ?? `ID ${selectedAlert.id_camara}`} •{' '}
                <strong>Estado:</strong> {formatEstado(selectedAlert.estado)}
              </p>
              <h3>Descripción</h3>

              {editandoDescripcion ? (
                <>
                  <IonTextarea
                    value={nuevaDescripcion}
                    onIonChange={e => setNuevaDescripcion(e.detail.value!)}
                    autoGrow
                  />
                  <div className="buttons-row">
                    <IonButton color="success" onClick={handleGuardarDescripcion} disabled={guardando}>
                      {guardando ? 'Guardando...' : 'Guardar'}
                    </IonButton>
                    <IonButton color="medium" onClick={() => setEditandoDescripcion(false)}>
                      Cancelar
                    </IonButton>
                  </div>
                </>
              ) : (
                <>
                  <p>{selectedAlert.descripcion_suceso || <i>Sin descripción</i>}</p>
                </>
              )}

              <video
                controls
                className="video-clip"
                src={`${CAMERA_URL}/video/play?key=${selectedAlert.clip}&format=mp4`}
              />

              {!editandoDescripcion && (
                <div className="buttons-row">
                  <IonButton color="primary" onClick={handleEditarDescripcion}>
                    <IonIcon icon={create} slot="start" />
                    Editar descripción
                  </IonButton>
                  <IonButton color="danger" onClick={handleEliminarAlerta} disabled={eliminando}>
                    <IonIcon icon={trash} slot="start" />
                    {eliminando ? 'Eliminando...' : 'Eliminar alerta'}
                  </IonButton>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </IonContent>
  );
}
