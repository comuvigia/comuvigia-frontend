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
    portonazos:number;
    merodeos : number;
    falsos_positivos: number;
    asaltos_hogar: number;
  };
}

const EstadisticasTotales: React.FC<EstadisticasTotalesProps> = ({ estadisticas_totales }) => {
  
  const alertasVerificadas = estadisticas_totales.alertas_confirmadas + estadisticas_totales.falsos_positivos;

  const tasa_confianza = alertasVerificadas > 0 
    ? Math.round((estadisticas_totales.alertas_confirmadas / alertasVerificadas) * 100)
    : 0;

  const tasa_error = alertasVerificadas > 0 
    ? Math.round((estadisticas_totales.falsos_positivos / alertasVerificadas) * 100)
    : 0;

  return (
    <IonCard id='estadisticas-totales' style={{width: '100%'}}>
      <IonCardHeader>
        <IonCardTitle>Estadísticas Totales</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonGrid>
          <IonRow>
            {/* Total alertas */}
            <IonCol size="6">
              <div className="stat-card">
                <div className="stat-number">{estadisticas_totales.total_alertas}</div>
                <div className="stat-label">Alertas Totales</div>
              </div>
            </IonCol>

            {/* Alertas confirmadas */}
            <IonCol size="6">
              <div className="stat-card">
                <div className="stat-number">{alertasVerificadas}</div>
                <div className="stat-label">Alertas Verificadas</div>
              </div>
            </IonCol>
          </IonRow>
          <IonRow>
            {/* Tasa de confianza */}
            <IonCol size="6">
              <div
                className="stat-card"
                style={{
                  border: `2px solid ${
                    tasa_confianza > 70 ? 'green' : tasa_confianza > 40 ? 'orange' : 'red'
                  }`,
                  backgroundColor:
                    tasa_confianza > 70 ? 'rgba(0, 200, 0, 0.1)' :
                    tasa_confianza > 40 ? 'rgba(255, 165, 0, 0.1)' :
                    'rgba(255, 0, 0, 0.1)',
                }}
              >
                <div
                  className="stat-number"
                  style={{
                    color: tasa_confianza > 70 ? 'green' : tasa_confianza > 40 ? 'orange' : 'red',
                  }}
                >
                  {tasa_confianza}%
                </div>
                <div className="stat-label">Tasa de Precisión</div>
              </div>
            </IonCol>

            {/* Tasa de error */}
            <IonCol size="6">
              <div
                className="stat-card"
                style={{
                  border: `2px solid ${
                    tasa_error <= 30 ? 'green' : tasa_error <= 60 ? 'orange' : 'red'
                  }`,
                  backgroundColor:
                    tasa_error <= 30 ? 'rgba(0, 200, 0, 0.1)' :
                    tasa_error <= 60 ? 'rgba(255, 165, 0, 0.1)' :
                    'rgba(255, 0, 0, 0.1)',
                }}
              >
                <div
                  className="stat-number"
                  style={{
                    color: tasa_error <= 30 ? 'green' : tasa_error <= 60 ? 'orange' : 'red',
                  }}
                >
                  {tasa_error}%
                </div>
                <div className="stat-label">Tasa de Error</div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};

export default EstadisticasTotales;
