import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/NavBar';
import {
  IonPopover,
  IonButton,
  IonSpinner,
  IonContent
} from '@ionic/react';
import FiltroPeriodo from '../components/Estadisticas/FiltroPeriodo';
import EstadisticasTotales from '../components/Estadisticas/EstadisticasTotales';
import GraficoSector from '../components/Estadisticas/GraficoSector';
import GraficoTipo from '../components/Estadisticas/GraficoTipo';
import DetalleSectores from '../components/Estadisticas/DetalleSectores';
import InformeDescarga from '../components/InformeDescarga';
import { NotificacionesPopover } from '../components/Notificaciones';
import { useUser } from '../UserContext';
import { io } from 'socket.io-client';
import './Reportes.css';
import '../components/ReporteEstadisticas.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CAMERA_URL = import.meta.env.VITE_CAMERA_URL;
const socket = io(BACKEND_URL);

function Reportes() {
  const { user } = useUser();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [event, setEvent] = useState<MouseEvent | undefined>(undefined);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<any>(null);

  const [fechaInicio, setFechaInicio] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10)
  );
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().slice(0, 10));
  const [agrupacion, setAgrupacion] = useState('day');

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/alertas/estadisticas-totales?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&group=${agrupacion}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('Error en la respuesta del servidor');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleShowNotifications = (e: React.MouseEvent) => {
    setEvent(e.nativeEvent);
    setPopoverOpen(true);
  };

  // === Preparar datos para los gráficos ===
  const chartDataSectores = data
    ? {
        labels: data.sectores.map((s: any) => s.nombre_sector),
        datasets: [
          {
            label: 'Alertas por Sector',
            data: data.sectores.map((s: any) => s.total_alertas),
            backgroundColor: ['#10dc60', '#ff4961', '#ffc409', '#7044ff']
          }
        ]
      }
    : null;

  const chartDataTipos = data
    ? {
        labels: ['Merodeos', 'Portonazos', 'Asaltos Hogar', 'Falsos positivos'],
        datasets: [
          {
            label: '',
            data: [
              data.estadisticas_totales.merodeos,
              data.estadisticas_totales.portonazos,
              data.estadisticas_totales.asaltos_hogar,
              data.estadisticas_totales.falsos_positivos
            ],
            backgroundColor: ['#10dc60', '#ff4961', '#ffc409', '#7044ff']
          }
        ]
      }
    : null;

  return (
    <div className="reportes-page">
      <Navbar unseenCount={0} onShowNotifications={handleShowNotifications} />

      {/* Popover de notificaciones */}
      <IonPopover
        isOpen={popoverOpen}
        event={event}
        onDidDismiss={() => setPopoverOpen(false)}
        side="bottom"
        alignment="end"
      >
        <IonContent>
          <NotificacionesPopover
            alerts={[]}
            cameraNames={{}}
            variant="sidebar"
            formatearFecha={() => ''}
            handleAccion={() => {}}
            onVerDescripcion={() => {}}
            mostrarCamarasCaidas
          />
        </IonContent>
      </IonPopover>

      {/* Panel de descripción */}
      {mostrarDescripcion && alertaSeleccionada && (
        <div className="panel-descripcion card">
          <h2>Alerta {alertaSeleccionada.id}</h2>
          <p>Descripción: {alertaSeleccionada.descripcion_suceso || 'Sin descripción'}</p>
          <video
            controls
            src={`${CAMERA_URL}/video/play?key=${alertaSeleccionada.clip}&format=mp4`}
          />
          <div className="button-group">
            <IonButton onClick={() => setMostrarDescripcion(false)}>Cerrar</IonButton>
          </div>
        </div>
      )}

      {/* Contenedor de reportes */}
      <div className="grid-container">
        {loading && (
          <div className="loading-container card">
            <IonSpinner
              style={{ '--color': '#1B4965', width: '40px', height: '40px' }}
            />
            <p>Cargando datos del reporte...</p>
          </div>
        )}

        {!loading && data && (
          <>
            {/* === Sección 1: Filtros === */}
            <div className="card"   style={{
                  gridColumn: '3 / 4', // columna 2
                  gridRow: '1 / 2',    // fila 1
                }}>
              <FiltroPeriodo
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
                setFechaInicio={setFechaInicio}
                setFechaFin={setFechaFin}
                agrupacion={agrupacion}
                setAgrupacion={setAgrupacion}
                onGenerarReporte={cargarDatos}
              />
            </div>

            {/* === Sección 2: Estadísticas === */}
            <div className="card"   style={{
                  gridColumn: '1 / 3', // columna 2
                  gridRow: '1 / 2',    // fila 1
                }}>
              <EstadisticasTotales
                estadisticas_totales={data.estadisticas_totales}
              />
            </div>

            {/* === Sección 3: Gráfico por sector === */}
            {chartDataSectores && (
            <div className="card"   style={{
                  gridColumn: '1 / 2', // columna 2
                  gridRow: '2 / 4',    // fila 1
                }}>
                <GraficoSector data={chartDataSectores} />
              </div>
            )}

            {/* === Sección 4: Gráfico por tipo === */}
            {chartDataTipos && (
            <div className="card"   style={{
                  gridColumn: '2 / 3', // columna 2
                  gridRow: '2 / 4',    // fila 1
                }}>
                <GraficoTipo data={chartDataTipos} />
              </div>
            )}

            {/* === Sección 5: Detalle por sectores === */}
            <div className="card"   style={{
                  gridColumn: '3 / 4', // columna 2
                  gridRow: '2 / 3',    // fila 1
                }}>
              <DetalleSectores sectores={data.sectores} />
            </div>

            {/* Descarga de informe */}
            <div className="card"   style={{
                  gridColumn: '3 / 4', // columna 2
                  gridRow: '3 / 4',    // fila 1
                  backgroundColor: 'var(--ion-background-color-2)', // ✅ aquí
                  
                }}>
              <InformeDescarga />
            </div>
          </>
        )}

        {!loading && !data && !error && (
          <div className="card card-full">
            <h3>Selecciona los filtros y genera tu reporte</h3>
            <p>Los datos se mostrarán aquí una vez que generes el reporte.</p>
          </div>
        )}

        {error && (
          <div className="card card-full" style={{ color: 'red' }}>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reportes;
