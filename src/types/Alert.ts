export interface Alert {
    idAlerta: number; // Identificador único de la alerta
    idCamara: number; // Identificador de la cámara asociada
    mensaje: string; // Mensaje descriptivo de la alerta
    horaSuceso: string; // Hora del suceso en formato ISO (ejemplo: "2024-06-09T19:30:00Z")
    scoreConfianza: number, // Score de confianza del suceso (0 a 100)
    clipSuceso?: Blob, // Clip de video del suceso (opcional)
    descripcionSuceso?: string | null; // Descripción del suceso (opcional, puede ser null)
    estado: boolean; // Estado de la alerta (true = visto, false = no visto)
}
