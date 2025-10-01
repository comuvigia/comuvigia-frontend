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
  IonList,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonToggle,
  IonChip,
  IonBadge
} from '@ionic/react';
import { 
  close, 
  trash, 
  save, 
  add, 
  create, 
  link, 
  wifi, 
} from 'ionicons/icons';
import { Camera } from '../types/Camera'; // Ajusta la ruta según tu estructura
import Aviso from '../components/Aviso';
import { useAviso } from '../hooks/useAviso';
import './Cameras.css';
import { useUser } from '../UserContext';

interface CamerasProps {
  isOpen: boolean;
  onClose: () => void;
  cameras: Camera[];
  onSave: (camera: Camera, isNew: boolean) => void;
  onDelete: (id: number) => void;
}

const Cameras: React.FC<CamerasProps> = ({
  isOpen,
  onClose,
  cameras,
  onSave,
  onDelete
}) => {
  const { user } = useUser();
  const { alertState, showError, closeAlert } = useAviso();
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>();
  const [cameraToDelete, setCameraToDelete] = useState<Camera | null>(null);
  const [editedCamera, setEditedCamera] = useState<Camera | null>(null);
  const [showDeleteCamera, setShowDeleteCamera] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Resetear estado cuando se abre/cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedCamera(null);
      setEditedCamera(null);
      setIsEditing(false);
      setIsCreating(false);
    }
  }, [isOpen]);

  // Inicializar cámara para crear
  const handleCreateCamera = () => {
    const tempId = Math.min(-1, ...cameras.map(c => c.id)) - 1;
    const newCamera: Camera = {
      id: tempId,
      nombre: '',
      posicion: [0, 0],
      direccion: '',
      estado_camara: false,
      ultima_conexion: new Date().toISOString(),
      link_camara: '',
      link_camara_externo: '',
      total_alertas: 0,
      id_sector: 1,
      zona_interes: ''
    };
    setSelectedCamera(newCamera);
    setEditedCamera(newCamera);
    setIsCreating(true);
    setIsEditing(true);
  };

  // Seleccionar cámara para ver/editar
  const handleSelectCamera = (camera: Camera) => {
    setSelectedCamera(camera);
    setEditedCamera({ ...camera });
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (isCreating) {
      setSelectedCamera(null);
      setEditedCamera(null);
      setIsCreating(false);
    } else {
      setEditedCamera(selectedCamera ? { ...selectedCamera } : null);
      setIsEditing(false);
    }
  };

  const handleSave = () => {
    if (editedCamera) {
      const isNewCamera = editedCamera.id < 0;
      const cameraData = JSON.parse(JSON.stringify(editedCamera));
      if (isNewCamera) {
        const { id, ...newCameraData } = cameraData;
        const cameraToSave = { ...newCameraData };
        onSave(cameraToSave as Camera, true);
      } else {
        const cameraToSave = { ...cameraData };
        onSave(cameraToSave as Camera, false);
      }
      setIsEditing(false);
      setIsCreating(false);
      if (isCreating) {
        setSelectedCamera(null);
      }
    }
    //mostrarAlerta('Guardado correctamente.','La cámara se guardo exitosamente en el sistema.');
  };

  const handleDelete = () => {
    if (cameraToDelete) {
      onDelete(cameraToDelete.id);
      setShowDeleteCamera(false);
      setCameraToDelete(null);
    }
  };

  const handleInputChange = (field: keyof Camera, value: any) => {
    if (editedCamera) {
      setEditedCamera({
        ...editedCamera,
        [field]: value
      });
    }
  };

  const handlePositionChange = (index: number, value: string) => {
    if (editedCamera) {
      const newPosition = [...editedCamera.posicion] as [number, number];
      newPosition[index] = parseFloat(value) || 0;
      setEditedCamera({
        ...editedCamera,
        posicion: newPosition
      });
    }
  };

  const mostrarAlerta = (principal: string, titulo: string) => {
      showError(principal, {
      type: 'success',
      title: titulo,
      style: 'detailed',
      duration: 5000,
      autoClose: false
      });
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose} className="cameras-modal">
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              {isCreating ? 'Nueva Cámara' : 
               selectedCamera ? `Cámara ${selectedCamera.nombre}` : 'Cámaras'}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onClose}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        
        <IonContent>
          <Aviso
            isOpen={alertState.isOpen}
            type={alertState.type}
            title={alertState.title}
            message={alertState.message}
            onClose={closeAlert}
            style={alertState.style}
            duration={alertState.duration}
          />
          {!selectedCamera ? (
            // ------------ Vista de lista ------------
            <div className="cameras-list">
              <IonList>
                <IonItem>
                  <IonLabel>
                    <h2>Total de Cámaras: {cameras.length}</h2>
                  </IonLabel>
                  {user && user.rol==2 && (
                    <IonButton onClick={handleCreateCamera} style={{'--border-radius': '20px'}}>
                      <IonIcon icon={add} slot="start" style={{margin:'0', paddingRight:'2px', fontWeight:'bold'}}/>
                      Crear
                    </IonButton>
                  )}
                </IonItem>
                {cameras.map((camera) => (
                  <IonCard key={camera.id} onClick={() => handleSelectCamera(camera)}>
                    <IonCardContent>
                      <IonGrid>
                        <IonRow>
                          <IonCol size="8">
                            <IonLabel>
                              <h2>{camera.nombre}</h2>
                              <p>{camera.direccion}</p>
                              <IonChip color={camera.estado_camara ? 'success' : 'medium'}>
                                <IonIcon icon={wifi} />
                                <IonLabel>{camera.estado_camara ? 'Activa' : 'Inactiva'}</IonLabel>
                              </IonChip>
                            </IonLabel>
                          </IonCol>
                          <IonCol size="4" className="" style={{display:'flex', justifyContent:'space-between', flexDirection:'column-reverse', alignItems:'end'}}>
                            <IonBadge color="warning">{(camera.total_alertas || 0)} alertas</IonBadge>
                            {user && user.rol == 2 && (
                              <IonItem lines='none'>
                                <IonButton 
                                  color="danger"
                                  onClick={(e) => {e.stopPropagation(); setCameraToDelete(camera); setShowDeleteCamera(true);}}
                                  style={{'--border-radius':'20px'}}
                                >
                                  <IonIcon icon={trash} slot="start" style={{margin:'0'}}/>
                                </IonButton>
                              </IonItem>
                            )}
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCardContent>
                  </IonCard>
                ))}
              </IonList>
            </div>
          ) : (
            // ------------ Vista de detalle/edición ------------
            <div className="ion-padding">
              <IonGrid>
                <IonRow>
                  <IonCol>
                    {/* Información básica */}
                    {/*
                    <IonItem>
                      <IonLabel position="stacked">ID</IonLabel>
                      <IonInput 
                        value={editedCamera?.id} 
                        readonly 
                        disabled={!isEditing}
                      />
                    </IonItem>
                    */}

                    <IonItem>
                      <IonLabel position="stacked">Nombre *</IonLabel>
                      <IonInput
                        value={editedCamera?.nombre}
                        onIonInput={(e) => handleInputChange('nombre', e.detail.value!)}
                        readonly={!isEditing}
                        placeholder="Nombre descriptivo"
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Dirección *</IonLabel>
                      <IonInput
                        value={editedCamera?.direccion}
                        onIonInput={(e) => handleInputChange('direccion', e.detail.value!)}
                        readonly={!isEditing}
                        placeholder="Dirección física"
                      />
                    </IonItem>

                    {/* Posición */}
                    <IonItem>
                      <IonLabel position="stacked">Posición (Lat, Lng)</IonLabel>
                      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <IonInput
                          value={editedCamera?.posicion[0]}
                          onIonInput={(e) => handlePositionChange(0, e.detail.value!)}
                          readonly={!isEditing}
                          placeholder="Latitud"
                          type="number"
                          style={{ flex: 1 }}
                        />
                        <IonInput
                          value={editedCamera?.posicion[1]}
                          onIonInput={(e) => handlePositionChange(1, e.detail.value!)}
                          readonly={!isEditing}
                          placeholder="Longitud"
                          type="number"
                          style={{ flex: 1 }}
                        />
                      </div>
                    </IonItem>

                    {/* Estado y Sector */}
                    <IonItem>
                      <IonLabel>Estado</IonLabel>
                      <IonToggle
                        checked={editedCamera?.estado_camara || false}
                        onIonChange={(e) => handleInputChange('estado_camara', e.detail.checked)}
                        disabled={!isEditing}
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Sector</IonLabel>
                      <IonSelect
                        value={editedCamera?.id_sector || 1}
                        onIonChange={(e) => handleInputChange('id_sector', e.detail.value)}
                        //disabled={!isEditing}
                        >
                        <IonSelectOption value={1}>Sector 1</IonSelectOption>
                        <IonSelectOption value={2}>Sector 2</IonSelectOption>
                        <IonSelectOption value={3}>Sector 3</IonSelectOption>
                      </IonSelect>
                    </IonItem>

                    {/* URLs */}
                    <IonItem>
                      <IonLabel position="stacked">
                        <IonIcon icon={link} /> URL Interna
                      </IonLabel>
                      <IonInput
                        value={editedCamera?.link_camara || ''}
                        onIonInput={(e) => handleInputChange('link_camara', e.detail.value!)}
                        readonly={!isEditing}
                        placeholder="rtsp://..."
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">
                        <IonIcon icon={link} /> URL Externa
                      </IonLabel>
                      <IonInput
                        value={editedCamera?.link_camara_externo || ''}
                        onIonInput={(e) => handleInputChange('link_camara_externo', e.detail.value!)}
                        readonly={!isEditing}
                        placeholder="https://..."
                      />
                    </IonItem>

                    {/* Zona de interés */}
                    <IonItem>
                      <IonLabel position="stacked">Zona de Interés</IonLabel>
                      <IonTextarea
                        value={editedCamera?.zona_interes || ''}
                        onIonInput={(e) => handleInputChange('zona_interes', e.detail.value!)}
                        readonly={!isEditing}
                        rows={3}
                        placeholder="Descripción de la zona de interés..."
                      />
                    </IonItem>

                    {/* Botones de acción */}
                    <div className="action-buttons">
                      {!isEditing ? (
                        <>
                          {user && user.rol==2 && (
                            <IonButton 
                              expand="block" 
                              color="primary"
                              onClick={handleEdit}
                            >
                              <IonIcon icon={create} slot="start" />
                              Editar
                            </IonButton>
                          )}
                          <IonButton 
                            expand="block" 
                            color="medium"
                            onClick={() => setSelectedCamera(null)}
                          >
                            Volver a la lista
                          </IonButton>
                        </>
                      ) : (
                        <>
                          <IonButton 
                            expand="block" 
                            color="primary"
                            onClick={handleSave}
                            disabled={!editedCamera?.nombre || !editedCamera?.direccion}
                          >
                            <IonIcon icon={save} slot="start" />
                            {isCreating ? 'Crear' : 'Guardar'}
                          </IonButton>
                          <IonButton 
                            expand="block" 
                            color="medium"
                            onClick={handleCancel}
                          >
                            Cancelar
                          </IonButton>
                        </>
                      )}
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
          )}
        </IonContent>
      </IonModal>

      {/* Alerta de eliminación */}
      <IonAlert
        isOpen={showDeleteCamera}
        onDidDismiss={() => {
          setShowDeleteCamera(false);
          setCameraToDelete(null);
        }}
        header={'Eliminar Cámara'}
        message={`¿Estás seguro de que quieres eliminar la cámara "${cameraToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Eliminar',
            role: 'destructive',
            handler: handleDelete
          }
        ]}
      />
    </>
  );
};

export default Cameras;