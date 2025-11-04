// components/EstadisticasTotales.tsx
import React from 'react';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonProgressBar, IonLabel
} from '@ionic/react';
import './ReporteEstadisticas.css';

interface EstadisticasTotalesProps {
  estadisticas_totales: {
    total_alertas: number;
    alertas_confirmadas: number;
    no_especificados:number;
    falsos_positivos:number;
    especificadas : number;
    tasa_confianza: number;
    tasa_precision: number;
    tasa_error: number;
  };
}

const EstadisticasTotales: React.FC<EstadisticasTotalesProps> = ({ estadisticas_totales }) => (
  <IonCard id='estadisticas-totales'>
    <IonCardHeader>
      <IonCardTitle>Estadísticas Totales</IonCardTitle>
    </IonCardHeader>
    <IonCardContent>
      <IonGrid>
        <IonRow>
        {/* Total alertas */}
        <IonCol size="3">
            <div className="stat-card">
            <div className="stat-number">{estadisticas_totales.total_alertas}</div>
            <div className="stat-label">Alertas Totales</div>
            </div>
        </IonCol>

        {/* Alertas confirmadas */}
        <IonCol size="3">
            <div className="stat-card">
            <div className="stat-number">{estadisticas_totales.alertas_confirmadas + estadisticas_totales.falsos_positivos}</div>
            <div className="stat-label">Alertas Verificadas</div>
            </div>
        </IonCol>

        {/* Tasa de confianza */}
        <IonCol size="3">
        <div
            className="stat-card"
            style={{
            border: `2px solid ${
                estadisticas_totales.tasa_confianza > 70
                ? 'green'
                : estadisticas_totales.tasa_confianza > 40
                ? 'orange'
                : 'red'
            }`,
            backgroundColor:
                estadisticas_totales.tasa_confianza > 70
                ? 'rgba(0, 200, 0, 0.1)'   // verde tenue
                : estadisticas_totales.tasa_confianza > 40
                ? 'rgba(255, 165, 0, 0.1)' // naranja tenue
                : 'rgba(255, 0, 0, 0.1)',  // rojo tenue
            }}
        >
            <div
            className="stat-number"
            style={{
                color:
                estadisticas_totales.tasa_confianza > 70
                    ? 'green'
                    : estadisticas_totales.tasa_confianza > 40
                    ? 'orange'
                    : 'red',
            }}
            >
            {estadisticas_totales.tasa_confianza}%
            </div>
            <div className="stat-label"> Tasa de Precisión</div>
        </div>
        </IonCol>

        {/* Tasa de error */}
        <IonCol size="3">
        <div
            className="stat-card"
            style={{
            border: `2px solid ${
                estadisticas_totales.tasa_error <= 70
                ? 'green'
                : estadisticas_totales.tasa_error <= 40
                ? 'orange'
                : 'red'
            }`,
            backgroundColor:
                estadisticas_totales.tasa_error <= 70
                ? 'rgba(0, 200, 0, 0.1)'   // verde tenue
                : estadisticas_totales.tasa_error <= 40
                ? 'rgba(255, 165, 0, 0.1)' // naranja tenue
                : 'rgba(255, 0, 0, 0.1)',  // rojo tenue
            }}
        >
            <div
            className="stat-number"
            style={{
                color:
                estadisticas_totales.tasa_error <= 70
                    ? 'green'
                    : estadisticas_totales.tasa_error <= 40
                    ? 'orange'
                    : 'red',
            }}
            >
            {estadisticas_totales.tasa_error}%
            </div>
            <div className="stat-label">Tasa de Error</div>
        </div>
        </IonCol>

        </IonRow>

        
      </IonGrid>
    </IonCardContent>
  </IonCard>
);

export default EstadisticasTotales;
