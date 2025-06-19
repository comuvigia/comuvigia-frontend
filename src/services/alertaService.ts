import { Alert } from "../types/Alert";

export async function fetchAlertas(): Promise<Alert[]> {
  const response = await fetch('http://localhost:3000/api/alertas');
  if (!response.ok) {
    throw new Error('No se pudo obtener la lista de alertas');
  }
  return await response.json();
}

export async function fetchUltimasAlertas(): Promise<Alert[]> {
  const res = await fetch('http://localhost:3000/api/alertas/ultimas');
  if (!res.ok) throw new Error('No se pudo obtener el historial de alertas');
  return await res.json();
}

export async function fetchUnseenAlertas(): Promise<Alert[]> {
  const res = await fetch('http://localhost:3000/api/alertas/no-vistas');
  if (!res.ok) throw new Error('No se pudo obtener las alertas no vistas');
  return await res.json();
}

export async function marcarAlertaVista(id: number): Promise<void> {
  await fetch(`http://localhost:3000/api/alertas/marcar-vista/${id}`, { method: 'POST' });
}
