import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { UserProvider } from './UserContext';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import Home from './pages/Home';
import Historial from './pages/Historial';
import Grabaciones from './pages/Grabaciones';
import Reportes from './pages/Reportes';
import Login from './pages/Login';
import React from 'react';
import { ToastProvider } from "./components/ToastProvider";
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <ToastProvider>
    <IonApp>
      <UserProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <PublicRoute exact path="/login">
              <Login />
            </PublicRoute>
            <Route exact path="/home">
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
            <Route exact path="/historial">
              <ProtectedRoute>
                <Historial />
              </ProtectedRoute>
            </Route>
            <Route exact path="/grabaciones">
              <ProtectedRoute allowedRoles={[1, 2]}>
                <Grabaciones />
              </ProtectedRoute>
            </Route>
            <Route exact path="/reportes">
              <ProtectedRoute allowedRoles={[1, 2]}>
                <Reportes />
              </ProtectedRoute>
            </Route>
            <Route>
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </UserProvider>
    </IonApp>
  </ToastProvider>
);

export default App;
