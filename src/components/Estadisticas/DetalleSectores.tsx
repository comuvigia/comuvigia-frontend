// components/DetalleSectores.tsx
import React from 'react';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonBadge
} from '@ionic/react';
import './DetalleSectores.css'
interface Sector {
  id_sector: number;
  nombre_sector: string;
  total_alertas: number;
  alertas_confirmadas: number;
}

const DetalleSectores: React.FC<{ sectores: Sector[] }> = ({ sectores }) => (
  <IonCard className='ion-card-detalle'>
    <IonCardHeader>
      <IonCardTitle>Detalle por Sectores</IonCardTitle>
    </IonCardHeader>
    <IonCardContent style={{ flex: 1, overflowY: 'auto' }}>
      <IonList style={{ flex: 1, overflowY: 'auto' }}>
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
);

export default DetalleSectores;
