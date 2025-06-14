export interface Alert {
    id: number; // Identificador único de la alerta
    id_camara: number; // Identificador de la cámara asociada
    mensaje: string; // Mensaje descriptivo de la alerta
    hora_suceso: string; // Hora del suceso en formato ISO (ejemplo: "2024-06-09T19:30:00Z")
    score_confianza: number, // Score de confianza del suceso (0 a 100)
    clip_suceso?: Blob, // Clip de video del suceso (opcional)
    descripcion_suceso?: string | null; // Descripción del suceso (opcional, puede ser null)
    estado: boolean; // Estado de la alerta (true = visto, false = no visto)
}
