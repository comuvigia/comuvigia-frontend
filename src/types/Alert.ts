export interface Alert {
    id: number; // Identificador único de la alerta
    id_camara: number; // Identificador de la cámara asociada
    mensaje: string; // Mensaje descriptivo de la alerta
    hora_suceso: string; // Hora del suceso en formato ISO (ejemplo: "2024-06-09T19:30:00Z")
    tipo: number; // Tipo de alerta 0: "No especificado", 1: "Merodeo", 2: "Portonazo"...*se puede ir agregando mas si es necesario*
    score_confianza: number, // Score de confianza del suceso (0 a 100)
    clip_suceso?: Blob, // Clip de video del suceso (opcional)
    descripcion_suceso?: string | null; // Descripción del suceso (opcional, puede ser null)
    estado: number; // Estado de la alerta (0 = "En Observación", 1 = "Confirmada", 2 = "Falso Positivo")
}
