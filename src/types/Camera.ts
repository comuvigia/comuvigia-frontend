export interface Camera {
  id: number; // Identificador único de la cámara
  nombre: string; // Nombre descriptivo de la cámara
  posicion: [number, number]; // Coordenadas de la cámara (latitud, longitud)
  direccion: string; // Dirección física de la cámara
  estado_camara: boolean; // Estado de la cámara (true = activa, false = inactiva)
  ultima_conexion: string; // Fecha y hora de la última conexión en formato ISO (ejemplo: "2024-06-09T19:30:00Z")
  link_camara?: string; // URL del stream de video de la cámara (opcional, puede ser vacío)
  total_alertas: number; // Campo con el total de alertas
}
