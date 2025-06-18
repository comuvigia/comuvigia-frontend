import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAlertStore } from '../stores/useAlertStore';
import { Alert } from '../types/Alert';

const socket = io('http://localhost:3000');

export function useRealtimeAlert() {
  const addAlert = useAlertStore(state => state.addAlert);

  useEffect(() => {
    socket.on('nueva-alerta', (alerta: Alert) => {
      addAlert(alerta);
    });
    return () => {
      socket.off('nueva-alerta');
    };
  }, [addAlert]);
}
