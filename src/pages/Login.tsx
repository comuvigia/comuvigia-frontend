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
import './Login.css';
import { useUser } from '../UserContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const { setUser } = useUser();
  const handleLogin = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/auth/login`,
        { usuario, contrasena },
        { withCredentials: true }
      );
      const res = await axios.get(`${BACKEND_URL}/api/auth/check`, { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      setMensaje('Usuario o contraseña incorrecta');
      setMostrarToast(true);
    }
  };

  return (
  <IonPage>
    <IonContent fullscreen>
      {/* Fondo con imagen */}
      <div
        className="login-background"
        style={{
          backgroundImage: `url(${window.matchMedia('(prefers-color-scheme: dark)').matches ? '/mapaNegro.png' : '/mapaBlanco.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      />
      
      {/* Contenido del login */}
      <div className="login-wrapper" style={{ position: 'relative', zIndex: 1 }}>
        <div className="login-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/comuvigia.png" alt="Logo" style={{padding: '20px'}}/>
          </div>

          <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
          >

            <IonItem className={mensaje ? 'input-error' : ''}>
              <IonLabel position="stacked">Usuario</IonLabel>
              <IonInput value={usuario} onIonInput={e => setUsuario(e.detail.value!)} />
            </IonItem>

            <IonItem className={mensaje ? 'input-error' : ''}>
              <IonLabel position="stacked">Contraseña</IonLabel>
              <IonInput type="password" value={contrasena} onIonInput={e => setContrasena(e.detail.value!)} />
            </IonItem>

            <IonButton expand="block" type='submit' className="login-button">
              Entrar
            </IonButton>
          </form>
          <IonToast
            isOpen={mostrarToast}
            message={mensaje}
            duration={2000}
            color="danger"
            onDidDismiss={() => setMostrarToast(false)}
          />
        </div>
        <p style={{fontSize: 'small'}}>© 2025 Comuvigia. Todos los derechos reservados.</p>
      </div>
    </IonContent>
  </IonPage>

  );
};

export default Login;
