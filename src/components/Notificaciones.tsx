import {
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonActionSheet,
  IonBadge, 
  IonSegment,
  IonSegmentButton 
  
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import {settingsOutline, checkmarkDoneOutline, alertCircleOutline, ellipsisVertical, videocamOff, alertCircle, warning } from 'ionicons/icons';
import { Alert } from '../types/Alert';
import './Notificaciones.css'
import { RulesType, EditRules } from './RulesRiesgoModal';
import { FiltroType, EditFiltros } from './FiltroModal';

interface NotificacionesPopoverProps {
    alerts: Alert[];
    cameraNames: {[key:number]: string},
    selectedCamera?: { id: number }; // opcional, para filtrar
    variant?: 'map' | 'sidebar';
    formatearFecha: (fechaISO: string) => string;
    handleAccion: (alert: Alert, accion: 'leida' | 'falso_positivo') => void;
    onVerDescripcion: (alert: Alert) => void;
    mostrarCamarasCaidas?: boolean;
}

type FilterType = 'alertas' | 'camaras_caidas';


export function NotificacionesPopover({ 
  alerts,
  selectedCamera,
  cameraNames,
  variant,
  formatearFecha,
  handleAccion,
  onVerDescripcion,
  mostrarCamarasCaidas = false
 }: NotificacionesPopoverProps) {
  const [accionOpen, setAccionOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('alertas');
  const [reglas, setReglas] = useState<RulesType[]>([]);
  const [filtro, setfiltro] = useState<FiltroType>({
    isUsed: false, fechaInicio: null, fechaFin: null,
    tipo: null, scoreMin: null, scoreMax: null, sector: null}
  );


  
  const cameraFilteredAlerts  = selectedCamera
  ? alerts.filter(a => a.id_camara === selectedCamera.id)
  : alerts;



  // Separar alertas en dos grupos
  const alertasNormales = cameraFilteredAlerts.filter(alert => alert.tipo === 1 || alert.tipo === 2 || alert.tipo === 3);
  const camarasCaidas = cameraFilteredAlerts.filter(alert => alert.tipo === 4);

  // Determinar qué alertas mostrar
  let alertsToShow = mostrarCamarasCaidas 
    ? (filterType === 'alertas' ? alertasNormales : camarasCaidas)
    : alertasNormales; // Comportamiento original: solo alertas normales
  
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
      console.log(alerta.id_sector)
      if (alerta.id_sector == reglas[i].sector){
        valores[i]++;
      }
    }

    const maxIndex = valores.indexOf(Math.max(...valores));
    alerta.riesgo = reglas[maxIndex].riesgo;
  };

  const aplicarFiltros = (alerta: Alert) => {
    const horaSuceso = new Date(alerta.hora_suceso);

    if (filtro.fechaInicio && horaSuceso < filtro.fechaInicio) return false;
    if (filtro.fechaFin && horaSuceso > filtro.fechaFin) return false;

    if (filtro.scoreMin != null && alerta.score_confianza < filtro.scoreMin) return false;
    if (filtro.scoreMax != null && alerta.score_confianza > filtro.scoreMax) return false;

    if (filtro.sector != null && alerta.id_sector !== filtro.sector) return false;

    if (filtro.tipo != null && !filtro.tipo.some(tipo => tipo === alerta.tipo)) return false;

    return true;
  };


  // Filtro por pestaña (riesgo)
  if (selectedTab !== 'all') {
    alertsToShow = alertsToShow.filter(a => {
        calcularRiesgo(a); // actualiza alerta.riesgo
        if(filtro?.isUsed) return (a.riesgo?.toLowerCase() === selectedTab.toLowerCase()) && (aplicarFiltros(a)) 
        return a.riesgo?.toLowerCase() === selectedTab.toLowerCase();
    });
  } else if (filtro?.isUsed) {
    alertsToShow = alertsToShow.filter(a => {
      return aplicarFiltros(a)
    });
  }


  return (
    <>
      <IonList className= {variant === 'map' ? 'notificaciones-list-map' : 'notificaciones-list-sidebar'} style={{overflowY: variant === 'sidebar' ? 'auto' : 'visible'}} >
        <IonItem className='notification-title-item' >
          <IonLabel className="notification-title-item">
            <b>Notificaciones</b>
          </IonLabel>
        </IonItem>

        {mostrarCamarasCaidas && (
          <IonItem>
            <IonSegment 
              value={filterType} 
              onIonChange={e => setFilterType(e.detail.value as FilterType)}
              style={{width: '100%'}}
            >
              <IonSegmentButton value="alertas" style={{height: 'fit-content'}}>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <div style={{display: 'flex'}}>
                    <IonIcon icon={alertCircle} style={{paddingRight: '5px', fontSize: '22px'}}/>
                  </div>
                  <div style={{display: 'flex'}}>
                    <IonLabel>Alertas</IonLabel>
                  </div>
                  <div style={{display: 'flex', paddingLeft:'5px'}}>
                    <IonBadge color="warning" style={{marginLeft: '4px'}}>{alertasNormales.length}</IonBadge>
                  </div>
                </div>
              </IonSegmentButton>
              
              <IonSegmentButton value="camaras_caidas" style={{height: 'fit-content'}}>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <div style={{display: 'flex'}}>
                    <IonIcon icon={videocamOff} style={{paddingRight: '5px', fontSize: '22px'}}/>
                  </div>
                  <div style={{display: 'flex'}}>
                    <IonLabel>Cámaras</IonLabel>
                  </div>
                  <div style={{display: 'flex', paddingLeft:'5px'}}>
                    <IonBadge color="danger" style={{marginLeft: '4px'}}>{camarasCaidas.length}</IonBadge>
                  </div>
                </div>
              </IonSegmentButton>
            </IonSegment>
          </IonItem>
        )}
        {alertsToShow.length === 0 && (
          <IonItem>
            <IonLabel>
              <p style={{textAlign: 'center', color: 'var(--ion-color-medium)'}}>
                {mostrarCamarasCaidas 
                  ? (filterType === 'alertas' 
                      ? 'No hay alertas de movimiento u objetos' 
                      : 'No hay cámaras caídas')
                  : 'No hay notificaciones'
                }
              </p>
            </IonLabel>
          </IonItem>
        )}
        {filterType === 'alertas' ? (
          <>
            <IonItem>
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
                <EditRules reglas={reglas} setReglas={setReglas} />
                <EditFiltros filtro={filtro} setFiltro={setfiltro} />
            </IonItem>
            
          </>
        ):null}
        {alertsToShow.map(alert => (
            <IonItem className="notification-item" key={alert.id} color={alert.estado ? undefined : getScoreColor(alert.score_confianza)}   >
              <IonIcon 
                icon={alert.tipo === 4 ? videocamOff : alertCircle} 
                slot="start"
                color={alert.tipo === 4 ? 'warning' : 'warning'}
                style={{marginRight: '8px'}}
              />
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
