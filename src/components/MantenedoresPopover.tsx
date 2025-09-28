import { people, videocam } from 'ionicons/icons';
import React, { useState } from 'react';
import { IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { Alert } from '../types/Alert';
import { Camera } from '../types/Camera';
import Cameras from './Cameras';
import './Notificaciones.css'
import './MantenedoresPopover.css'

interface MantenedoresPopoverProps {
    cameras: Camera[];
    nombreMantenedor: string;
    tipoMantenedor: number;
    selectedCamera?: { id: number }; // opcional, para filtrar
    variant?: 'map' | 'sidebar';
    formatearFecha: (fechaISO: string) => string;
    onCameraUpdate?: (cameras: Camera[]) => void;
    onClose?: () => void; 
    onOpenModal: (modalType: 'cameras' | 'users' | 'alerts') => void; // abrir modales
}

export function MantenedoresPopover({ 
    cameras, 
    nombreMantenedor, 
    tipoMantenedor, 
    selectedCamera, 
    variant, 
    formatearFecha,
    onCameraUpdate,
    onClose,
    onOpenModal
}: MantenedoresPopoverProps){
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'cameras' | 'users' | 'alerts' | null>(null);

  const handleItemClick = (modalType: 'cameras' | 'users' | 'alerts') => {
    onClose(); // Cerrar el popover primero
    onOpenModal(modalType); // Abrir el modal correspondiente
  };

  return (
      <>
      <IonList className={variant === 'map' ? 'notificaciones-list-map' : 'notificaciones-list-sidebar'} style={{ overflowY: variant === 'sidebar' ? 'auto' : 'visible' }}>
        <IonItem className='notification-title-item'>
          <IonLabel className="notification-title-item">
            <b>Mantenedores</b>
          </IonLabel>
        </IonItem>
        <IonItem className="mantenedores-item" onClick={() => handleItemClick('users')}>
          <IonIcon src={people} color='dark' style={{padding:'10px'}}></IonIcon>
          <IonLabel>
            Usuarios
          </IonLabel>
        </IonItem>
        <IonItem className="mantenedores-item" onClick={() => handleItemClick('cameras')}>
          <IonIcon src={videocam} color='dark' style={{padding:'10px'}}></IonIcon>
          <IonLabel>
            Cámaras
          </IonLabel>
        </IonItem>
      </IonList>
      {/*modalType === 'cameras' && (
        <Cameras
          isOpen={isModalOpen}
          onClose={cerrarModal}
          cameras={cameras}
          onSave={handleSaveCamera}
          onDelete={handleDeleteCamera}
        />
      )*/}
      
    </>
  );
}
