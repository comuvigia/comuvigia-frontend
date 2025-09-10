import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonAlert,
  IonNote
} from '@ionic/react';
import { close, trash, save } from 'ionicons/icons';
import { Alert } from '../types/Alert'; // Ajusta la ruta según tu estructura
import './AlertModal.css';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert | null;
  onSave: (alert: Alert) => void;
  onDelete: (id: number) => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  alert,
  onSave,
  onDelete
}) => {
  const [editedAlert, setEditedAlert] = useState<Alert | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    if (alert) {
      setEditedAlert({ ...alert });
    }
  }, [alert]);

  const handleSave = () => {
    if (editedAlert) {
      onSave(editedAlert);
      onClose();
    }
  };

  const handleDelete = () => {
    if (alert) {
      onDelete(alert.id);
      onClose();
    }
  };

  const handleInputChange = (field: keyof Alert, value: any) => {
    if (editedAlert) {
      setEditedAlert({
        ...editedAlert,
        [field]: value
      });
    }
  };

  if (!editedAlert) return null;

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Alerta #{editedAlert.id}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onClose}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        
        <IonContent>
          <div className="ion-padding">
            {/* Información de solo lectura */}
            <IonItem style={{ '--background': 'transparent'}}>
              <IonLabel position="stacked">ID</IonLabel>
              <IonInput value={editedAlert.id} readonly />
            </IonItem>

            <IonItem style={{ '--background': 'transparent'}}>
              <IonLabel position="stacked">ID Cámara</IonLabel>
              <IonInput value={editedAlert.id_camara} readonly />
            </IonItem>

            <IonItem style={{ '--background': 'transparent'}}>
              <IonLabel position="stacked">Hora del Suceso</IonLabel>
              <IonInput 
                value={new Date(editedAlert.hora_suceso).toLocaleString()} 
                readonly 
              />
            </IonItem>

            <IonItem style={{ '--background': 'transparent'}}>
              <IonLabel position="stacked">Score de Confianza</IonLabel>
              <IonInput value={editedAlert.score_confianza} readonly />
              <IonNote slot="end">%</IonNote>
            </IonItem>

            {/* Campos editables */}
            <IonItem style={{ '--background': 'transparent'}}>
              <IonLabel position="stacked">Mensaje</IonLabel>
              <IonInput
                value={editedAlert.mensaje}
                onIonInput={(e) => handleInputChange('mensaje', e.detail.value!)}
                readonly
              />
            </IonItem>

            <IonItem style={{ '--background': 'transparent'}}>
              <IonLabel position="stacked">Tipo de Alerta</IonLabel>
              <IonSelect
                value={editedAlert.tipo}
                onIonChange={(e) => handleInputChange('tipo', e.detail.value)}
                interface="popover"
                disabled
              >
                <IonSelectOption value={0}>No especificado</IonSelectOption>
                <IonSelectOption value={1}>Merodeo</IonSelectOption>
                <IonSelectOption value={2}>Portonazo</IonSelectOption>
                <IonSelectOption value={3}>Asalto Hogar</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem style={{ '--background': 'transparent'}}>
              <IonLabel position="stacked">Estado</IonLabel>
              <IonSelect
                value={editedAlert.estado}
                onIonChange={(e) => handleInputChange('estado', e.detail.value)}
                interface="popover"
                disabled
              >
                <IonSelectOption value={0}>En Observación</IonSelectOption>
                <IonSelectOption value={1}>Confirmada</IonSelectOption>
                <IonSelectOption value={2}>Falso Positivo</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem style={{ '--background': 'transparent'}}>
              <IonLabel position="stacked">Descripción del Suceso</IonLabel>
              <IonTextarea
                value={editedAlert.descripcion_suceso || ''}
                rows={4}
                onIonInput={(e) => handleInputChange('descripcion_suceso', e.detail.value!)}
                placeholder="Agregar descripción del suceso..."
                readonly
              />
            </IonItem>

            {/* Botones de acción */}
            <div className="ion-margin-top" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <IonButton 
                expand="block" 
                color="danger"
                style={{'--border-radius': '20px'}} 
                onClick={() => setShowDeleteAlert(true)}
              >
                <IonIcon icon={trash} slot="start" />
                Eliminar
              </IonButton>
              
              {/*<IonButton 
                expand="block" 
                color="primary" 
                style={{'--border-radius': '20px'}} 
                onClick={handleSave}
              >
                <IonIcon icon={save} slot="start" />
                Guardar
              </IonButton>*/}
            </div>
          </div>
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header={'Eliminar Alerta'}
        message={'¿Estás seguro de que quieres eliminar esta alerta? Esta acción no se puede deshacer.'}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'cancel-button',
          },
          {
            text: 'Eliminar',
            role: 'destructive',
            cssClass: 'delete-button',
            handler: handleDelete
          }
        ]}
      />
    </>
  );
};

export default AlertModal;