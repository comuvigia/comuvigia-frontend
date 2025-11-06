import React, { useState, useEffect } from 'react';
import { IonSpinner, IonTitle } from '@ionic/react';
import axios from 'axios';
import { Camera } from '../types/Camera';
import Aviso from '../components/Aviso';
import { useAviso } from '../hooks/useAviso';
import './BuscadorGrabaciones.css';

const BACKEND_CAMERA_URL = import.meta.env.VITE_CAMERA_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function BuscadorGrabaciones() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<number>(0);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);
  const { alertState, showError, closeAlert } = useAviso();
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('');
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const formatDateForInput = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const [startDate, setStartDate] = useState<string>(formatDateForInput(sevenDaysAgo));

  const mostrarError = (principal: string, titulo: string) => {
    showError(principal, { title: titulo, style: 'detailed', duration: 10000 });
  };

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await axios.get<Camera[]>(`${BACKEND_URL}/api/camaras`, { withCredentials: true });
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

const searchRecordings = async (page = 1) => {
  setLoading(true);
  setError('');
  try {
    const pageNumber = typeof page === 'object' ? 1 : page;

    // Fecha de inicio definida por el usuario
    const formattedStartDate = new Date(startDate);
    const formattedEndDate = new Date(formattedStartDate);
    formattedEndDate.setDate(formattedEndDate.getDate() + 7);

    const response = await fetch(
      `${BACKEND_CAMERA_URL}/video/list/${selectedCamera}?source=mkv&start_date=${formattedStartDate.toISOString()}&end_date=${formattedEndDate.toISOString()}&page=${pageNumber}&per_page=${itemsPerPage}&duration_min=5`
    );

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();

    let videos = data.videos || [];

    // 🟦 FILTRO LOCAL SOLO PARA HORARIO (sin romper paginación)
    if (selectedTimeRange) {
      videos = videos.filter((v: { time: string | number | Date; }) => {
        const videoDate = new Date(v.time);
        const hour = videoDate.getHours();

        switch (selectedTimeRange) {
          case 'mañana':
            return hour >= 6 && hour < 12;
          case 'tarde':
            return hour >= 12 && hour < 18;
          case 'noche':
            return hour >= 18 && hour <= 23;
          case 'madrugada':
            return hour >= 0 && hour < 6;
          default:
            return true;
        }
      });
    }

    // 🟩 Si no hay resultados en la página actual
    if (videos.length === 0) mostrarError('No se encontraron grabaciones.', 'Sin resultados');

    // Mantiene paginación real
    setRecordings(videos);
    setTotalRecords(data.pagination.total);
    setCurrentPage(page);

  } catch (err) {
    setError('Error al cargar las grabaciones');
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const getThumbnailUrl = (cameraId: number, key: string) =>
    `${BACKEND_CAMERA_URL}/video/thumbnail/${cameraId}?source=mkv&key=${encodeURIComponent(key)}`;

  const DownloadButton = ({ recording, cameraId, onDownload, isDownloading }: any) => (
    <button onClick={() => onDownload(recording, cameraId)} disabled={isDownloading} className="download-btn">
      {isDownloading ? (
        <div className="download-loading">
          <IonSpinner name="crescent" style={{ width: '16px', height: '16px' }} />
          <span>Descargando...</span>
        </div>
      ) : (
        <>
          <span className="download-icon">&#10515;</span>&nbsp;
          <span>Descargar</span>
        </>
      )}
    </button>
  );

  const downloadVideo = async (cameraId: number, startTime: string, endTime: string, filename: string, recordingKey: string, uniqueId: string) => {
    try {
      setDownloadingIds(prev => new Set([...prev, uniqueId]));
      const params = new URLSearchParams({
        source: 'mkv',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        key: recordingKey
      });
      const response = await fetch(`${BACKEND_CAMERA_URL}/video/download/${cameraId}?${params.toString()}`);
      if (!response.ok) throw new Error('Error al descargar el video');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando video:', error);
      alert('Error al descargar el video');
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(uniqueId);
        return newSet;
      });
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <IonTitle>Buscador de grabaciones por cámara</IonTitle>
      </header>

      <Aviso isOpen={alertState.isOpen} type={alertState.type} title={alertState.title} message={alertState.message} onClose={closeAlert} style={alertState.style} duration={alertState.duration} />

      <section className="filters-section">
        <div className="filter-group">
          <label>Cámara</label>
          <select value={selectedCamera} onChange={e => setSelectedCamera(Number(e.target.value))}>
            {cameras.map(camera => (
              <option key={camera.id} value={camera.id}>{camera.nombre}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
            <label>Fecha de inicio</label>
            <input
                type="date"
                value={startDate.split('T')[0]} // solo la parte de la fecha
                onChange={(e) => setStartDate(`${e.target.value}T00:00`)}
            />
        </div>

        <div className="filter-group">
          <label>Rango horario</label>
          <select value={selectedTimeRange} onChange={(e) => setSelectedTimeRange(e.target.value)}>
            <option value="">Seleccionar rango</option>
            <option value="mañana">Mañana (6am-12pm)</option>
            <option value="tarde">Tarde (12pm-6pm)</option>
            <option value="noche">Noche (6pm-12am)</option>
            <option value="madrugada">Madrugada (12am-6am)</option>
          </select>
        </div>

        <button className="search-button" onClick={() => searchRecordings()} disabled={loading || !selectedCamera}>
          Buscar
        </button>
      </section>

      <div className="results-info">
        {selectedTimeRange ? (
          <>Mostrando grabaciones del rango <b>{selectedTimeRange}</b> ({(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} de {totalRecords})</>
        ) : (
          <>Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} de {totalRecords} resultados</>
        )}
      </div>

      <section className="results-grid">
        {recordings.length === 0 ? (
          <div className="no-videos-message">
            {loading ? <IonSpinner name="crescent" /> : 'No hay grabaciones disponibles'}
          </div>
        ) : (
          recordings.map((rec) => (
            <div key={rec.id} className="result-card">
              <img src={getThumbnailUrl(selectedCamera, rec.key)} alt="Miniatura" className="result-thumbnail" />
              <div className="result-info">
                <div className="date">{new Date(rec.time).toLocaleString()}</div>
                <div className="meta">
                  <span>Duración: ~5 min</span>&nbsp;
                  <span>Tamaño: {Math.round(rec.size / 1e6)} MB</span>
                </div>
              </div>
              <DownloadButton
                recording={rec}
                cameraId={selectedCamera}
                isDownloading={downloadingIds.has(rec.id)}
                onDownload={async (r: any, c: number) => {
                  const filename = `grabacion_${r.time}.mp4`;
                  await downloadVideo(c, r.start_time, r.end_time, filename, r.key, r.id);
                }}
              />
            </div>
          ))
        )}
      </section>

      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => searchRecordings(currentPage - 1)}>&laquo;</button>
        {getPageNumbers().map(page => (
          <button key={page} className={currentPage === page ? 'active' : ''} onClick={() => searchRecordings(page)}>
            {page}
          </button>
        ))}
        <button disabled={currentPage === totalPages} onClick={() => searchRecordings(currentPage + 1)}>&raquo;</button>
      </div>
    </div>
  );
}
