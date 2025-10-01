export interface User {
    id: number; // Identificador único de la alerta
    usuario: string; // Usuario registrado en BD
    contrasena: string // Contrasena guardada en BD
    nombre: string; // Nombre del usuario
    rol: number; // 0: invitado, 1: funcionario, 2: administrador
}