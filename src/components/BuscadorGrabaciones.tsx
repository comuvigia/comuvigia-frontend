import React, { useState, useEffect } from 'react';
import { 
    IonSpinner,
    IonTitle,
} from '@ionic/react';
import axios from 'axios';
import { Camera } from '../types/Camera';
import './BuscadorGrabaciones.css';
import '../pages/Historial.css';

const BACKEND_CAMERA_URL = import.meta.env.VITE_CAMERA_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function BuscadorGrabaciones(){
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<number>(0);
    const [startDate, setStartDate] = useState<string>(new Date().toISOString());
    const [endDate, setEndDate] = useState<string>(new Date().toISOString());
    const [recordings, setRecordings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(3);
    const [totalRecords, setTotalRecords] = useState(0);
    const [thumbnails, setThumbnails] = useState({});
    const [loadingThumbnails, setLoadingThumbnails] = useState({});

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
                console.error(error)
                console.error(err);     
            }
        };
        fetchCameras();
    }, []);

    // Función para buscar grabaciones
    const searchRecordings = async (page=1) => {
        setLoading(true);
        setError('');
        try {
            const pageNumber = typeof page === 'object' ? 1 : page;
            //const formattedStartDate = `${startDate}T00:00:00`;
            //const formattedEndDate = `${endDate}T23:59:59`;
            const formattedStartDate = startDate;
            const formattedEndDate = endDate;
            // Tu llamada a la API aquí
            const response = await fetch(`${BACKEND_CAMERA_URL}/video/list/${selectedCamera}?start_date=${formattedStartDate}&end_date=${formattedEndDate}&page=${pageNumber}&per_page=${itemsPerPage}&duration=2`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data = await response.json();
            
            setRecordings(data.videos || []);
            setTotalRecords(data.pagination.total);
            setCurrentPage(page);
        } catch (err) {
            setError("Error al cargar las grabaciones");
            console.error(error)
            console.error("Error en searchRecordings:", err); 
        } finally {
            setLoading(false);
        }
    };

    // Calcular el número total de páginas
    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    // Generar el array de números de página para mostrar
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5; // Número máximo de páginas visibles
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Ajustar si estamos cerca del final
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        
        return pageNumbers;
    };

    // Función para obtener la URL del thumbnail
    // @ts-ignore
    const getThumbnailUrl = (cameraId, startTime) => {
        return `${BACKEND_CAMERA_URL}/video/thumbnail/${cameraId}?time=${encodeURIComponent(startTime)}`;
    };

    // Función para cargar un thumbnail
    // @ts-ignore
    const loadThumbnail = async (cameraId, timestamp) => {
        const thumbnailKey = `${cameraId}_${timestamp}`;
        
        // Si ya está cargando o ya cargado, no hacer nada
        // @ts-ignore
        if (thumbnails[thumbnailKey] || loadingThumbnails[thumbnailKey]) {
            return;
        }
        
        setLoadingThumbnails(prev => ({ ...prev, [thumbnailKey]: true }));
        
        try {
            const response = await fetch(
            //`${API_URL}/video/thumbnail/${cameraId}?time=${encodeURIComponent(timestamp)}`
            `${BACKEND_CAMERA_URL}/video/thumbnail/${cameraId}?time=${encodeURIComponent(timestamp)}`
            );
            
            if (response.ok) {
            // Convertir la imagen a URL de datos para cachear
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            
            setThumbnails(prev => ({ 
                ...prev, 
                [thumbnailKey]: imageUrl 
            }));
            }
        } catch (error) {
            console.error('Error loading thumbnail:', error);
        } finally {
            setLoadingThumbnails(prev => ({ ...prev, [thumbnailKey]: false }));
        }
    };

    // Efecto para cargar thumbnails cuando cambian las grabaciones
    useEffect(() => {
        if (recordings.length > 0 && selectedCamera) {
            recordings.forEach(recording => {
            loadThumbnail(selectedCamera, recording.time);
            });
        }
    }, [recordings, selectedCamera]);

    // Estado para tracking de descargas
    //const [downloading, setDownloading] = useState(false);
    //const [downloadingId, setDownloadingId] = useState(null);
    const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
    // @ts-ignore
    const DownloadButton = ({ recording, cameraId, onDownload, isDownloading }) => {
        //console.log('Rendering DownloadButton for recording:', recording);
        
        return (
            <button
                onClick={() => onDownload(recording, cameraId)}
                disabled={isDownloading}
                className="download-btn"
                title="Descargar video"
            >
                {isDownloading ? (
                    <div className="download-loading">
                        <IonSpinner name="crescent" style={{ width: '16px', height: '16px' }} />
                        <span>Descargando...</span>
                    </div>
                ) : (
                    <>
                        <span className="download-icon">&#10515;</span>
                        <span>Descargar</span>
                    </>
                )}
            </button>
        );
    };
    // Función para descargar video
    const downloadVideo = async (cameraId: number, startTime: string, endTime: string, filename: string, recordingKey: string, uniqueId: string) => {
        try {
            // Mostrar indicador de carga
            //setDownloading(true);
            setDownloadingIds(prev => new Set([...prev, uniqueId]));

            // Construir URL de descarga
            const params = new URLSearchParams({
                start_time: startTime,
                end_time: endTime,
                format: 'mp4'
            });
            
            const response = await fetch(
                `${BACKEND_CAMERA_URL}/video/download/${cameraId}?${params.toString()}`
            );
            
            if (!response.ok) {
                throw new Error('Error al descargar el video');
            }
            
            // Convertir respuesta a blob y crear descarga
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || `grabacion_${new Date(startTime).toLocaleDateString()}.mp4`;
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Error descargando video:', error);
            alert('Error al descargar el video: ' + error);
        } finally {
            //setDownloading(false);
            setDownloadingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(uniqueId);
                return newSet;
            });
        }
    };

    return (
        <div className="container">
            <header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IonTitle>Buscador de grabaciones por cámara</IonTitle>
                </div>
            </header>
            
            <div className="filters">
                <div className="filter-group">
                <label htmlFor="camera">Cámara</label>
                <select className="camera-selector" value={selectedCamera} onChange={e => setSelectedCamera(Number(e.target.value))}>
                    {cameras.map(camera => (
                    <option key={camera.id} value={camera.id}>
                        {camera.nombre}
                    </option>
                    ))}
                </select>
                </div>
                <div className="filter-group">
                <label htmlFor="start-date">Fecha Inicio</label>
                <input type="datetime-local" id="start-date" value={startDate} onChange={e => setStartDate(String(e.target.value) as string)}/>
                </div>
                    
                <div className="filter-group">
                <label htmlFor="end-date">Fecha Fin</label>
                <input type="datetime-local" id="end-date" value={endDate} onChange={e => setEndDate(String(e.target.value) as string)} min={startDate}/>
                </div>
                    
                <div className="filter-group" style={{ paddingTop: '5px'}}>
                    <label>&nbsp;&nbsp;</label>
                    <button id="search-btn" className="search-button"
                            onClick={() => searchRecordings()}
                            disabled={loading || !selectedCamera}
                    >
                        {loading ? <IonSpinner name="crescent" /> : 'Buscar'}
                    </button>
                </div>
            </div>
            
            <div className="results-count">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} de {totalRecords} resultados
            </div>
            
            <div className="results-list">
            {recordings.length === 0 ? (
                <div className="no-videos-message">
                No hay videos disponibles
                </div>
            ) : (
                recordings.map(recording => (
                <div key={recording.id} className="result-item">
                    <div className="thumbnail">
                    <img 
                        src={getThumbnailUrl(selectedCamera, recording.start_time)} 
                        alt={`Grabación ${new Date(recording.time).toLocaleString()}`}
                        onError={(e) => {
                        // Fallback si el thumbnail no está disponible
                        (e.target as HTMLImageElement).src = '/placeholder-thumbnail.jpg';
                        }}
                    />
                    </div>
                    <div className="date-time">{new Date(recording.end_time).toLocaleString()}</div>
                    <div className="duration">
                    <span className="value">{parseFloat(String(recording.duration_seconds/60)).toFixed(2)} min</span>
                    <span className="label">Duración</span>
                    </div>
                    <div className="size">
                    <span className="value">{recording.size_mb} MB</span>
                    <span className="label">Tamaño</span>
                    </div>
                    <div className="download-section">
                        <DownloadButton
                            recording={recording}
                            cameraId={selectedCamera}
                            isDownloading={downloadingIds.has(recording.id)}
                            // @ts-ignore
                            onDownload={async (rec, camId) => {
                                const filename = `grabacion_${new Date(rec.start_time).toISOString().split('T')[0]}_${new Date(rec.start_time).toISOString().split('T')[1]}.mp4`;
                                await downloadVideo(camId, rec.start_time, rec.end_time, filename, rec.key, rec.id);
                            }}
                        />
                    </div>
                </div>
                ))
            )}
            </div>
            
            <div className="pagination">
                <button 
                id="back-button"
                disabled={currentPage === 1} 
                onClick={() => searchRecordings(currentPage - 1)}
                >
                &laquo;
                </button>
                
                {getPageNumbers().map(page => (
                <button
                    key={page}
                    className={currentPage === page ? 'active' : ''}
                    onClick={() => searchRecordings(page)}
                >
                    {page}
                </button>
                ))}
                
                {totalPages > getPageNumbers()[getPageNumbers().length - 1] && (
                <span>...</span>
                )}
                
                <button 
                id="next-button"
                disabled={currentPage === totalPages} 
                onClick={() => searchRecordings(currentPage + 1)}
                >
                &raquo;
                </button>
            </div>
        </div>
    );
};