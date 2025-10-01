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
import { User } from '../types/User';
import Aviso from './Aviso';
import { useAviso } from '../hooks/useAviso';
import './Users.css';
import { useUser } from '../UserContext';

interface UsersProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onSave: (user: User, isNew: boolean) => void;
  onDelete: (id: number) => void;
}

const Users: React.FC<UsersProps> = ({
  isOpen,
  onClose,
  users,
  onSave,
  onDelete
}) => {
  const session = useUser().user;
  const { alertState, showError, closeAlert } = useAviso();
  const [selectedUser, setSelectedUser] = useState<User | null>();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Resetear estado cuando se abre/cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setEditedUser(null);
      setIsEditing(false);
      setIsCreating(false);
    }
  }, [isOpen]);

  // Inicializar cámara para crear
  const handleCreateUser = () => {
    const tempId = Math.min(-1, ...users.map(u => u.id)) - 1;
    const newUser: User = {
      id: tempId,
      usuario: '',
      contrasena: '',
      nombre: '',
      rol: 0
    };
    setSelectedUser(newUser);
    setEditedUser(newUser);
    setIsCreating(true);
    setIsEditing(true);
  };

  // Seleccionar usuario para ver/editar
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setEditedUser({ ...user });
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (isCreating) {
      setSelectedUser(null);
      setEditedUser(null);
      setIsCreating(false);
    } else {
      setEditedUser(selectedUser ? { ...selectedUser } : null);
      setIsEditing(false);
    }
  };

  const handleSave = () => {
    if (editedUser) {
      const isNewUser = editedUser.id < 0;
      const userData = JSON.parse(JSON.stringify(editedUser));
      if (isNewUser) {
        const { id, ...newUserData } = userData;
        const userToSave = { ...newUserData };
        onSave(userToSave as User, true);
      } else {
        const userToSave = { ...userData };
        onSave(userToSave as User, false);
      }
      setIsEditing(false);
      setIsCreating(false);
      if (isCreating) {
        setSelectedUser(null);
      }
    }
    //mostrarAlerta('Guardado correctamente.','El usuario se guardo exitosamente en el sistema.');
  };

  const handleDelete = () => {
    if (userToDelete) {
      onDelete(userToDelete.id);
      setShowDeleteUser(false);
      setUserToDelete(null);
    }
  };

  const handleInputChange = (field: keyof User, value: any) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [field]: value
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

  // TODO: Editar usuario, contraseña, nombre y/o rol.

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose} className="users-modal">
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              {isCreating ? 'Nuevo Usuario' : 
               selectedUser ? `Usuario ${selectedUser.usuario}` : 'Usuarios'}
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
          {!selectedUser ? (
            // ------------ Vista de lista ------------
            <div className="users-list">
              <IonList>
                <IonItem>
                  <IonLabel>
                    <h2>Total de Usuarios: {users.length}</h2>
                  </IonLabel>
                  {session && session.rol==2 && (
                    <IonButton onClick={handleCreateUser} style={{'--border-radius': '20px'}}>
                      <IonIcon icon={add} slot="start" style={{margin:'0', paddingRight:'2px', fontWeight:'bold'}}/>
                      Crear
                    </IonButton>
                  )}
                </IonItem>
                {users.map((user) => (
                  <IonCard key={user.id} onClick={() => handleSelectUser(user)}>
                    <IonCardContent>
                      <IonGrid>
                        <IonRow>
                          <IonCol size="8">
                            <IonLabel>
                              <h2>{user.usuario}</h2>
                            </IonLabel>
                          </IonCol>
                          <IonCol size="4" className="" style={{display:'flex', justifyContent:'space-between', flexDirection:'column-reverse', alignItems:'end'}}>
                            {session && session.rol == 2 && (
                              <IonItem lines='none'>
                                <IonButton 
                                  color="danger"
                                  onClick={(e) => {e.stopPropagation(); setUserToDelete(user); setShowDeleteUser(true);}}
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
                    <IonItem>
                      <IonLabel position="stacked">Usuario *</IonLabel>
                      <IonInput
                        value={editedUser?.usuario}
                        onIonInput={(e) => handleInputChange('usuario', e.detail.value!)}
                        readonly={!isCreating}
                        placeholder="Nombre de Usuario"
                      />
                    </IonItem>

                    {isCreating && (
                      <IonItem>
                        <IonLabel position="stacked">Contraseña *</IonLabel>
                        <IonInput
                          value={editedUser?.contrasena}
                          onIonInput={(e) => handleInputChange('contrasena', e.detail.value!)}
                          placeholder="Contraseña"
                        />
                      </IonItem>
                    )}

                    <IonItem>
                      <IonLabel position="stacked">Nombre *</IonLabel>
                      <IonInput
                        value={editedUser?.nombre}
                        onIonInput={(e) => handleInputChange('nombre', e.detail.value!)}
                        readonly={!isCreating}
                        placeholder="Nombre"
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Rol</IonLabel>
                      <IonSelect
                        value={editedUser?.rol || 0}
                        onIonChange={(e) => handleInputChange('rol', e.detail.value)}
                        disabled={!isEditing}
                        >
                        <IonSelectOption value={0}>Invitado</IonSelectOption>
                        <IonSelectOption value={1}>Funcionario</IonSelectOption>
                        <IonSelectOption value={2}>Administrador</IonSelectOption>
                      </IonSelect>
                    </IonItem>

                    {/* Botones de acción */}
                    <div className="action-buttons">
                      {!isEditing ? (
                        <>
                          {session && session.rol==2 && (
                            <IonButton 
                              expand="block" 
                              color="primary"
                              onClick={handleEdit}
                            >
                              <IonIcon icon={create} slot="start" />
                              Editar Rol
                            </IonButton>
                          )}
                          <IonButton 
                            expand="block" 
                            color="medium"
                            onClick={() => setSelectedUser(null)}
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
                            disabled={!editedUser?.usuario || (isCreating && !editedUser?.contrasena) || !editedUser.nombre}
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
        isOpen={showDeleteUser}
        onDidDismiss={() => {
          setShowDeleteUser(false);
          setUserToDelete(null);
        }}
        header={'Eliminar Usuario'}
        message={`¿Estás seguro de que quieres eliminar el usuario "${userToDelete?.usuario}"? Esta acción no se puede deshacer.`}
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

export default Users;