import { Camera } from '../types/Camera';

export async function fetchCameras(): Promise<Camera[]> {
  const response = await fetch('http://localhost:3000/api/camaras');
  if (!response.ok) {
    throw new Error('No se pudo obtener la lista de cámaras');
  }
  return await response.json();
}
