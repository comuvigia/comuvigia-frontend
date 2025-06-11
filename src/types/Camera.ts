export interface Camera {
  idCamara: number; // Identificador único de la cámara
  nombre: string; // Nombre descriptivo de la cámara
  posicion: [number, number]; // Coordenadas de la cámara (latitud, longitud)
  direccion: string; // Dirección física de la cámara
  estadoCamara: boolean; // Estado de la cámara (true = activa, false = inactiva)
  ultimaConexion: string; // Fecha y hora de la última conexión en formato ISO (ejemplo: "2024-06-09T19:30:00Z")
  linkCamara?: string; // URL del stream de video de la cámara (opcional, puede ser vacío)
}
