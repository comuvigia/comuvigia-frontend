import { IonButton, IonIcon, IonActionSheet } from '@ionic/react';
import { checkmarkDoneOutline, alertCircleOutline, ellipsisVertical } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import { settingsOutline } from 'ionicons/icons';
import { 
  IonList, 
  IonItem, 
  IonLabel,
  IonSegment,
  IonSegmentButton, 
} from '@ionic/react';
import { Alert } from '../types/Alert';
import './Notificaciones.css'
import { RulesType, EditRules } from './RulesRiesgoModal';

interface NotificacionesPopoverProps {
    alerts: Alert[];
    cameraNames: {[key:number]: string},
    selectedCamera?: { id: number }; // opcional, para filtrar
    variant?: 'map' | 'sidebar';
    formatearFecha: (fechaISO: string) => string;
    handleAccion: (alert: Alert, accion: 'leida' | 'falso_positivo') => void;
    onVerDescripcion: (alert: Alert) => void;
    
}

export function NotificacionesPopover({ alerts,selectedCamera, cameraNames,variant, formatearFecha, handleAccion, onVerDescripcion }: NotificacionesPopoverProps) {
  const [accionOpen, setAccionOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [reglas, setReglas] = useState<RulesType[]>([]);

  let filteredAlerts = selectedCamera
  ? alerts.filter(a => a.id_camara === selectedCamera.id)
  : alerts;
  
  const abrirMenu = (alert: Alert) => {
    setSelectedAlert(alert);
    setAccionOpen(true);
  };

  const cerrarMenu = () => {
    setAccionOpen(false);
    setSelectedAlert(null);
  };

  const estados: { [key: number]: string } = {
    0: "En Observación",
    1: "Confirmada",
    2: "Falso Positivo"
  };

  const [selectedTab, setSelectedTab] = useState<'all' | 'bajo' | 'medio' | 'alto' | 'critico'>('all');


  const getScoreColor = (score: number) => {
    if (score <= 0.4) return 'success';
    if (score <= 0.6) return 'warning';
    return 'danger';
  };

  // En tu componente:
  const handleLabelClick = () => {
    console.log('Label clickeado!');
    // Aquí va tu lógica
  };

  const calcularRiesgo = (alerta: Alert) => {
    let valores = Array(reglas.length).fill(0); // Un cero para cada regla

    for (let i = 0; i < reglas.length; i++) {
      if (reglas[i].tipoAlerta.some(tipo => Number(tipo) === alerta.tipo)) {
        valores[i]++;
      }

      const fechaAlerta = new Date(alerta.hora_suceso);
      const horaAlerta = fechaAlerta.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
      if (reglas[i].horaInicio <= horaAlerta && horaAlerta <= reglas[i].horaFin) {
        valores[i]++;
      }
      if (alerta.score_confianza >= (reglas[i].score/100)) {
        valores[i]++;
      }
    }

    const maxIndex = valores.indexOf(Math.max(...valores));
    alerta.riesgo = reglas[maxIndex].riesgo;
  };

  // Filtro por pestaña (riesgo)
  if (selectedTab !== 'all') {
    filteredAlerts = filteredAlerts.filter(a => {
        calcularRiesgo(a); // actualiza alerta.riesgo
        return a.riesgo?.toLowerCase() === selectedTab;
    });
  }


  return (
    <>
      <IonItem className='notification-title-item' >
        <IonLabel className="notification-title-item">
          <b>Notificaciones</b>
        </IonLabel>
        <EditRules reglas={reglas} setReglas={setReglas} />
      </IonItem>
      <IonSegment value={selectedTab} onIonChange={e => setSelectedTab(e.detail.value as any)} className="compact-segment">
        <IonSegmentButton value="all" className="small-segment"> 
          <IonLabel>Todos</IonLabel> </IonSegmentButton> 
        <IonSegmentButton value="critico" className="small-segment"> 
          <IonLabel>Crítico</IonLabel> </IonSegmentButton> 
        <IonSegmentButton value="alto" className="small-segment"> 
          <IonLabel>Alto</IonLabel> </IonSegmentButton> 
        <IonSegmentButton value="medio" className="small-segment"> 
          <IonLabel>Medio</IonLabel> </IonSegmentButton> 
        <IonSegmentButton value="bajo" className="small-segment"> 
          <IonLabel>Bajo</IonLabel></IonSegmentButton> 
      </IonSegment>

      <IonList className= {variant === 'map' ? 'notificaciones-list-map' : 'notificaciones-list-sidebar'} style={{overflowY: variant === 'sidebar' ? 'auto' : 'visible'}} >
        {filteredAlerts.length === 0 && <IonItem>No hay notificaciones</IonItem>}
        {filteredAlerts.map(alert => (
          <IonItem className="notification-item" key={alert.id} color={alert.estado ? undefined : getScoreColor(alert.score_confianza)}   >
            <IonLabel onClick={() => onVerDescripcion(alert)} style={{ cursor: 'pointer' }}>
              {alert.mensaje}
              {!alert.estado && <span style={{ color: 'light', marginLeft: 8, fontWeight: 600 }}>(Nuevo)</span>}
              <p>Score: {alert.score_confianza} &nbsp; | &nbsp; {cameraNames[alert.id_camara]} &nbsp; | &nbsp; Estado: {estados[alert.estado]}</p>
              <p>{formatearFecha(alert.hora_suceso)}</p>
            </IonLabel>
            <IonButton fill="clear" slot="end" color={"dark"} onClick={() => abrirMenu(alert)}>
                <IonIcon icon={ellipsisVertical} />
            </IonButton>
          </IonItem>
        ))}
      </IonList>
      {/* ActionSheet para opciones de la alerta seleccionada */}
      <IonActionSheet
        isOpen={accionOpen}
        onDidDismiss={cerrarMenu}
        header="Acciones"
        buttons={[
          {
            text: 'Marcar como leída',
            icon: checkmarkDoneOutline,
            handler: () => {
              if (selectedAlert) {
                handleAccion(selectedAlert, 'leida');
              }
              cerrarMenu();
            }
          },
          {
            text: 'Marcar como falso positivo',
            icon: alertCircleOutline,
            handler: () => {
              if (selectedAlert) {
                handleAccion(selectedAlert, 'falso_positivo');
              }
              cerrarMenu();
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel',
          }
        ]}
      />
    </>
  );
}
