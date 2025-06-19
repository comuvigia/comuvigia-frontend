// src/stores/useAlertStore.ts
import { create } from 'zustand';
import { Alert } from '../types/Alert';

type AlertStore = {
  alerts: Alert[];          // Historial de alertas
  unseenAlerts: Alert[];    // Alertas no vistas
  addAlert: (a: Alert) => void;
  setAlerts: (as: Alert[]) => void;
  setUnseenAlerts: (as: Alert[]) => void;
  markAsSeen: (id: number) => void;
};

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  unseenAlerts: [],
  addAlert: (a) => set(state => ({
    alerts: [a, ...state.alerts],
    unseenAlerts: a.estado ? state.unseenAlerts : [a, ...state.unseenAlerts]
  })),
  setAlerts: (as) => set(() => ({ alerts: as })),
  setUnseenAlerts: (as) => set(() => ({ unseenAlerts: as })),
  markAsSeen: (id) => set(state => ({
    unseenAlerts: state.unseenAlerts.filter(a => a.id !== id),
    alerts: state.alerts.map(a =>
      a.id === id ? { ...a, estado: true } : a
    )
  }))
}));
