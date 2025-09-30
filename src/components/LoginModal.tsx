import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast
} from '@ionic/react';
import axios from 'axios';
import './LoginModal.css';

interface LoginModalProps {
  onLoginSuccess: (userData: any) => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleLogin = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/auth/login`,
        { usuario, contrasena },
        { withCredentials: true }
      );
      const res = await axios.get(`${BACKEND_URL}/api/auth/check`, { withCredentials: true });
      onLoginSuccess(res.data);
      window.location.href = '/home';
    } catch (err) {
      setMensaje('Usuario o contraseña incorrecta');
      setMostrarToast(true);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-page" fullscreen>
        <div className="login-wrapper">
          <div className="login-container">
            <h2 className="login-title">Bienvenido a ComuVigIA</h2>
            <p className="login-subtitle">Inicia sesión para continuar</p>

            <IonItem className={mensaje ? 'input-error' : ''}>
              <IonLabel position="floating">Usuario</IonLabel>
              <IonInput
                value={usuario}
                onIonInput={(e) => setUsuario(e.detail.value!)}
              />
            </IonItem>

            <IonItem className={mensaje ? 'input-error' : ''}>
              <IonLabel position="floating">Contraseña</IonLabel>
              <IonInput
                type="password"
                value={contrasena}
                onIonInput={(e) => setContrasena(e.detail.value!)}
              />
            </IonItem>

            <IonButton expand="block" onClick={handleLogin} className="login-button">
              Entrar
            </IonButton>

            <IonToast
              isOpen={mostrarToast}
              message={mensaje}
              duration={2000}
              color="danger"
              onDidDismiss={() => setMostrarToast(false)}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginModal;
