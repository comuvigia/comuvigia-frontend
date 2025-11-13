// components/GraficoSector.tsx
import React from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { BarChartSector } from '../Charts';
import './DetalleSectores.css'

const GraficoSector: React.FC<{ data: any }> = ({ data }) => (
  <IonCard id='grafico-sector' className="centrar" style={{ borderRadius: '12px' }}>
    <IonCardHeader>
      <IonCardTitle>Distribución por Sector</IonCardTitle>
    </IonCardHeader>
    <IonCardContent>
      <BarChartSector data={data} />
    </IonCardContent>
  </IonCard>
);

export default GraficoSector;
