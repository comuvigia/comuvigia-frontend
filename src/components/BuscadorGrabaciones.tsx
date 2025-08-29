import React, { useState, useEffect } from 'react';
import { 
    IonIcon,
    IonSpinner,
    IonTitle,
} from '@ionic/react';
import axios from 'axios';
import { Camera } from '../types/Camera';
import './BuscadorGrabaciones.css';
import '../pages/Historial.css';
import { videocam } from 'ionicons/icons';

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
    const [itemsPerPage, setItemsPerPage] = useState(3); // Puedes ajustar este valor
    const [totalRecords, setTotalRecords] = useState(0);

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
    const searchRecordings = async (page=1) => {
        setLoading(true);
        try {
            const pageNumber = typeof page === 'object' ? 1 : page;
            const formattedStartDate = `${startDate}T00:00:00`;
            const formattedEndDate = `${endDate}T23:59:59`;
            // Tu llamada a la API aquí
            const response = await fetch(`${BACKEND_CAMERA_URL}/video/list/${selectedCamera}?start_date=${formattedStartDate}&end_date=${formattedEndDate}&page=${pageNumber}&per_page=${itemsPerPage}&duration=2`);
            const data = await response.json();
            
            setRecordings(data.videos || []);
            setTotalRecords(data.pagination.total); // Asegúrate que tu API devuelva el total de registros
            setCurrentPage(page);
        } catch (error) {
            setError("Error al cargar las grabaciones");
            console.error(error);
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

    return (
        <div className="container">
            <header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/*<IonIcon icon={videocam} size="large" style={{color: '#000', paddingTop: '6px'}}/>
                <h1>Resultados de Grabación</h1>*/}
                <IonTitle>Grabaciones</IonTitle>
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
                <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(String(e.target.value) as string)}/>
                </div>
                    
                <div className="filter-group">
                <label htmlFor="end-date">Fecha Fin</label>
                <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(String(e.target.value) as string)} min={startDate}/>
                </div>
                    
                {/*<div className="filter-group">
                <label htmlFor="time-range">Rango Horario</label>
                <select id="time-range">
                    <option>Todo el día</option>
                    <option>Mañana (6:00-12:00)</option>
                    <option>Tarde (12:00-18:00)</option>
                    <option>Noche (18:00-24:00)</option>
                    <option>Madrugada (0:00-6:00)</option>
                </select>
                </div>*/}
                    
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
                {recordings.map(recording => (
                <div key={recording.key} className="result-item">
                    <div className="date-time">{new Date(recording.end_time).toLocaleString()}</div>
                    <div className="duration">
                    <span className="value">{parseFloat(String(recording.duration_seconds/60)).toFixed(2)} min</span>
                    <span className="label">Duración</span>
                    </div>
                    <div className="size">
                        <span className="value">{recording.size_mb} MB</span>
                        <span className="label">Tamaño</span>
                    </div>
                </div>
                ))}
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