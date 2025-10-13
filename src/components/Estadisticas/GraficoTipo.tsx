// components/GraficoTipo.tsx
import React from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { BarChartTipo } from '../Charts';

const GraficoTipo: React.FC<{ data: any }> = ({ data }) => (
  <IonCard className="centrar">
    <IonCardHeader>
      <IonCardTitle>Distribución por Tipo</IonCardTitle>
    </IonCardHeader>
    <IonCardContent>
      <BarChartTipo data={data} />
    </IonCardContent>
  </IonCard>
);

export default GraficoTipo;
