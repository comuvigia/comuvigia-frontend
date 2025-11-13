// components/ReporteEstadisticas.tsx
import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonLabel,
  IonProgressBar,
  IonList,
  IonItem,
  IonBadge,
  IonInput,
  IonButton,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { PieChart, BarChartSector, BarChartTipo } from './Charts';
import './ReporteEstadisticas.css';

interface Sector {
  id_sector: number;
  nombre_sector: string;
  total_alertas: number;
  alertas_confirmadas: number;
  falsos_positivos: number;
  merodeos: number;
  portonazos: number;
  asaltos_hogar: number;
  no_especificados: number;
}

interface EstadisticasData {
  success: boolean;
  periodo: {
    fecha_inicio: string;
    fecha_fin: string;
    dias: number;
  };
  estadisticas_totales: {
    total_alertas: number;
    alertas_confirmadas: number;
    falsos_positivos: number;
    merodeos: number;
    portonazos: number;
    asaltos_hogar: number;
    no_especificados: number;
    tasa_confianza: number;
    tasa_precision: number;
    tasa_error: number;
  };
  sectores: Sector[];
}

interface ReporteEstadisticasProps {
  data: EstadisticasData;
  fechaInicio: string;
  fechaFin: string;
  setFechaInicio: (fecha: string) => void;
  setFechaFin: (fecha: string) => void;
  onGenerarReporte: () => void;
  agrupacion: string;
  setAgrupacion: (agrupacion: string) => void;
}

const ReporteEstadisticas: React.FC<ReporteEstadisticasProps> = ({
  data, fechaInicio,  fechaFin,  setFechaInicio,  setFechaFin,  onGenerarReporte, agrupacion, setAgrupacion}) => {
  const { estadisticas_totales, sectores, periodo } = data;

  // Datos para gráficos
  const chartDataSectores = {
    labels: sectores.map(s => s.nombre_sector),
    datasets: [
      {
        label: 'Alertas por Sector',
        data: sectores.map(s => s.total_alertas),
        backgroundColor: [
          '#10dc60', '#ff4961', '#ffc409', '#7044ff'
        ]
      }
    ]
  };

  const chartDataTipos = {
    labels: [/*'Confirmadas', 'Falsos Positivos', */'Merodeos', 'Portonazos', 'Asaltos Hogar', 'Falsos positivos'],
    datasets: [
      {
        label: '',
        data: [
          //estadisticas_totales.alertas_confirmadas,
          //estadisticas_totales.falsos_positivos,
          estadisticas_totales.merodeos,
          estadisticas_totales.portonazos,
          estadisticas_totales.asaltos_hogar,
          estadisticas_totales.falsos_positivos
        ],
        backgroundColor: [
          '#10dc60', '#ff4961', '#ffc409', '#7044ff'
        ]
      }
    ]
  };

  return (
      <div>
        {/* Header con período */}
        <IonCard >
          <IonCardHeader>
            <IonCardTitle>Período del Reporte</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="4">
                  <IonItem>
                    <IonLabel position="stacked">Fecha inicio (dd/mm/aaaa)</IonLabel>
                    <IonInput type="date" value={fechaInicio} onIonInput={(e: any) => setFechaInicio(e.target.value)}/>
                  </IonItem>
                </IonCol>
                <IonCol size="4">
                  <IonItem>
                    <IonLabel position="stacked">Fecha fin (dd/mm/aaaa)</IonLabel>
                  <IonInput type="date" value={fechaFin} onIonInput={(e: any) => setFechaFin(e.target.value)}/>
                  </IonItem>
                </IonCol>
                <IonCol size="4">
                <IonLabel>Agrupación</IonLabel>
                <IonSelect value={agrupacion} interface="popover" interfaceOptions={{cssClass: 'custom-popover'}} 
                  placeholder="Selecciona" onIonChange={(e) => setAgrupacion(e.detail.value)}>
                  <IonSelectOption value="day">Día</IonSelectOption>
                  <IonSelectOption value="week">Semana</IonSelectOption>
                  <IonSelectOption value="month">Mes</IonSelectOption>
                </IonSelect>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonButton expand="block" onClick={onGenerarReporte} style={{ marginTop: '10px' }}>
                    Generar Reporte
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* Estadísticas Totales */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Estadísticas Totales</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="6">
                  <div className="stat-card">
                    <div className="stat-number">{estadisticas_totales.total_alertas}</div>
                    <div className="stat-label">Total Alertas</div>
                  </div>
                </IonCol>
                <IonCol size="6">
                  <div className="stat-card">
                    <div className="stat-number">{estadisticas_totales.alertas_confirmadas}</div>
                    <div className="stat-label">Confirmadas</div>
                  </div>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol>
                  <div className="confidence-progress">
                    <IonLabel>Tasa de confianza: {estadisticas_totales.tasa_confianza}%</IonLabel>
                    <IonProgressBar 
                      value={estadisticas_totales.tasa_confianza / 100} 
                      color={estadisticas_totales.tasa_confianza > 70 ? 'success' : 
                             estadisticas_totales.tasa_confianza > 40 ? 'warning' : 'danger'}
                    />
                  </div>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol>
                  <div className="confidence-progress">
                    <IonLabel>Tasa de precisión: {estadisticas_totales.tasa_precision}%</IonLabel>
                    <IonProgressBar 
                      value={estadisticas_totales.tasa_precision / 100} 
                      color={estadisticas_totales.tasa_precision > 70 ? 'success' : 
                             estadisticas_totales.tasa_precision > 40 ? 'warning' : 'danger'}
                    />
                  </div>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol>
                  <div className="confidence-progress">
                    <IonLabel>Tasa de error: {estadisticas_totales.tasa_error}%</IonLabel>
                    <IonProgressBar 
                      value={estadisticas_totales.tasa_error / 100} 
                      color={estadisticas_totales.tasa_error > 70 ? 'success' : 
                             estadisticas_totales.tasa_error > 40 ? 'warning' : 'danger'}
                    />
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* Gráficos */}
        <IonCard className='centrar'>
          <IonCardHeader>
            <IonCardTitle>Distribución por Sector</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <BarChartSector data={chartDataSectores} />
          </IonCardContent>
        </IonCard>

        <IonCard className='centrar'>
          <IonCardHeader>
            <IonCardTitle>Distribución por Tipo</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <BarChartTipo data={chartDataTipos} />
          </IonCardContent>
        </IonCard>

        {/* Detalle por Sectores */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Detalle por Sectores</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {sectores.map((sector) => (
                <IonItem key={sector.id_sector}>
                  <IonLabel>
                    <h2>{sector.nombre_sector}</h2>
                    <p>Total: {sector.total_alertas} alertas</p>
                    <p>Confirmadas: {sector.alertas_confirmadas}</p>
                  </IonLabel>
                  <IonBadge slot="end" color="primary">
                    {sector.total_alertas}
                  </IonBadge>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>
      </div>
    
  );
};

export default ReporteEstadisticas;