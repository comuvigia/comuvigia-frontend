// components/FiltroPeriodo.tsx
import React from 'react';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonItem, IonLabel,
  IonInput, IonButton, IonSelect, IonSelectOption
} from '@ionic/react';

interface FiltroPeriodoProps {
  fechaInicio: string;
  fechaFin: string;
  setFechaInicio: (fecha: string) => void;
  setFechaFin: (fecha: string) => void;
  agrupacion: string;
  setAgrupacion: (agrupacion: string) => void;
  onGenerarReporte: () => void;
}

const FiltroPeriodo: React.FC<FiltroPeriodoProps> = ({
  fechaInicio, fechaFin, setFechaInicio, setFechaFin, agrupacion, setAgrupacion, onGenerarReporte
}) => (
  <IonCard id='filtro-periodo' style={{ borderRadius: '12px' }}>
    <IonCardHeader>
      <IonCardTitle>Período del Reporte</IonCardTitle>
    </IonCardHeader>
    <IonCardContent>
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonItem>
              <IonLabel position="stacked">Fecha inicio</IonLabel>
              <IonInput type="date" value={fechaInicio} onIonInput={(e: any) => setFechaInicio(e.target.value)} />
            </IonItem>
          </IonCol>
          <IonCol>
            <IonItem>
              <IonLabel position="stacked">Fecha fin</IonLabel>
              <IonInput type="date" value={fechaFin} onIonInput={(e: any) => setFechaFin(e.target.value)} />
            </IonItem>
          </IonCol>
          <IonCol>
            <IonLabel>Agrupación</IonLabel>
            <IonSelect
              value={agrupacion}
              interface="popover"
              placeholder="Selecciona"
              onIonChange={(e) => setAgrupacion(e.detail.value)}
            >
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
);

export default FiltroPeriodo;
