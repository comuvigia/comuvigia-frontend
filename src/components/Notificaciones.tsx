import { IonButton, IonIcon, IonActionSheet } from '@ionic/react';
import { checkmarkDoneOutline, alertCircleOutline, ellipsisVertical } from 'ionicons/icons';import React, { useState } from 'react';
import { IonList, IonItem, IonLabel } from '@ionic/react';
import { Alert } from '../types/Alert';

interface NotificacionesPopoverProps {
    alerts: Alert[];
    formatearFecha: (fechaISO: string) => string;
    handleAccion: (alert: Alert, accion: 'leida' | 'falso_positivo') => void;
}

export function NotificacionesPopover({ alerts, formatearFecha, handleAccion }: NotificacionesPopoverProps) {
  const [accionOpen, setAccionOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const abrirMenu = (alert: Alert) => {
    setSelectedAlert(alert);
    setAccionOpen(true);
  };

  const cerrarMenu = () => {
    setAccionOpen(false);
    setSelectedAlert(null);
  };
  // En tu componente:
  const handleLabelClick = () => {
    console.log('Label clickeado!');
    // Aquí va tu lógica
  };
  return (
    <>
      <IonList style={{ maxWidth: 500, minHeight: 180, maxHeight: 450, overflowY: "auto" }}>
        <IonItem lines='full'>
          <IonLabel>
            <b>Notificaciones</b>
          </IonLabel>
        </IonItem>
        {alerts.length === 0 && <IonItem>No hay notificaciones</IonItem>}
        {alerts.map(alert => (
          <IonItem key={alert.id} color={alert.estado ? undefined : "warning"} lines='full'>
            <IonLabel onClick={handleLabelClick} style={{ cursor: 'pointer' }}>
              {alert.mensaje}
              {!alert.estado && <span style={{ color: 'red', marginLeft: 8, fontWeight: 600 }}>(Nuevo)</span>}
              <p>Score: {alert.score_confianza} &nbsp; | &nbsp; Cámara: {alert.id}</p>
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
