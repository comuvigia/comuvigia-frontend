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
}

const ReporteEstadisticas: React.FC<ReporteEstadisticasProps> = ({ data }) => {
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
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Período del Reporte</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="6">
                  <strong>Inicio:</strong><br />
                  {new Date(periodo.fecha_inicio).toLocaleDateString()}
                </IonCol>
                <IonCol size="6">
                  <strong>Fin:</strong><br />
                  {new Date(periodo.fecha_fin).toLocaleDateString()}
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonChip color="primary">
                    <IonLabel>{periodo.dias} días</IonLabel>
                  </IonChip>
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