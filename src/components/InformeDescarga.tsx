import React, { useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonItem,
  IonLoading,
  IonAlert
} from "@ionic/react";
import "./InformeDescarga.css";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Función para convertir mes y año a fechas inicio y fin en formato API
const convertirFechaAPI = (anio: string, mes: string) => {
  const anioNum = parseInt(anio);
  const mesNum = parseInt(mes);

  // Fecha inicio: primer día del mes
  const fechaInicio = `${anio}-${mes.padStart(2, "0")}-01 00:00:00.000000`;

  // Fecha fin: último día del mes
  const ultimoDia = new Date(anioNum, mesNum, 0).getDate();
  const fechaFin = `${anio}-${mes.padStart(2, "0")}-${ultimoDia
    .toString()
    .padStart(2, "0")} 23:59:59.999999`;

  return { fechaInicio, fechaFin };
};


const InformeDescarga: React.FC = () => {
  const [mes, setMes] = useState<string>("");
  const [anio, setAnio] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const botonHabilitado = mes !== "" && anio !== "";

  const descargarPDF = async () => {
    if (!botonHabilitado) return;
    
    setLoading(true);
    setError("");

    const { fechaInicio, fechaFin } = convertirFechaAPI(anio, mes);
    console.log('Fechas para API:', { fechaInicio, fechaFin });
    
    try {
        console.log('Iniciando descarga...', { mes, anio });
        
        // ✅ CAMBIO: Usar el nuevo endpoint de PDF
        const endpointPath = `${BACKEND_URL}/api/informe/generar-pdf?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
        
        const response = await fetch(endpointPath, {
            credentials: "include"
        });

        console.log('Respuesta recibida:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            
            // Mostrar el error completo para debug
            setError(`Error ${response.status}: ${errorText.substring(0, 200)}...`);
            return;
        }

        // Verificar el content-type
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);

        // ✅ CAMBIO: Esperar application/pdf
        if (!contentType || !contentType.includes('application/pdf')) {
            // Si no es PDF, puede ser un error en JSON
            const errorContent = await response.text();
            console.error('Se recibió un error:', errorContent);
            
            try {
                // Intentar parsear como JSON
                const errorJson = JSON.parse(errorContent);
                setError(`Error: ${errorJson.error || errorJson.detalle || 'Error desconocido'}`);
            } catch {
                setError('Error: El servidor no respondió con un PDF válido');
            }
            return;
        }

        const blob = await response.blob();
        console.log('Blob recibido:', blob.size, 'bytes', blob.type);
        
        if (blob.size === 0) {
            throw new Error('El PDF generado está vacío');
        }

        // Crear URL temporal y descargar
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `informe_${anio}_${mes}.pdf`;
        
        document.body.appendChild(a);
        a.click();
        
        // Limpiar
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('PDF descargado exitosamente');
        
    } catch (error) {
        console.error('Error completo al descargar PDF:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
        setLoading(false);
    }
};

  return (
    <IonCard id="informe-descarga" style={{width: '100%', borderRadius: '12px'}}>
      <IonCardHeader>
        <IonCardTitle>Descarga de informe</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>

        <IonItem>
          <IonLabel>Mes</IonLabel>
          <IonSelect
            className="popover-up"
            placeholder="Selecciona mes"
            value={mes}
            interface="popover"
            onIonChange={(e) => setMes(e.detail.value)}
          >
            <IonSelectOption value="01">Enero</IonSelectOption>
            <IonSelectOption value="02">Febrero</IonSelectOption>
            <IonSelectOption value="03">Marzo</IonSelectOption>
            <IonSelectOption value="04">Abril</IonSelectOption>
            <IonSelectOption value="05">Mayo</IonSelectOption>
            <IonSelectOption value="06">Junio</IonSelectOption>
            <IonSelectOption value="07">Julio</IonSelectOption>
            <IonSelectOption value="08">Agosto</IonSelectOption>
            <IonSelectOption value="09">Septiembre</IonSelectOption>
            <IonSelectOption value="10">Octubre</IonSelectOption>
            <IonSelectOption value="11">Noviembre</IonSelectOption>
            <IonSelectOption value="12">Diciembre</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel>Año</IonLabel>
          <IonSelect
            placeholder="Selecciona año"
            value={anio}
            interface="popover"
            onIonChange={(e) => setAnio(e.detail.value)}
          >
            <IonSelectOption value="2023">2023</IonSelectOption>
            <IonSelectOption value="2024">2024</IonSelectOption>
            <IonSelectOption value="2025">2025</IonSelectOption>
          </IonSelect>
        </IonItem>
        
        <IonButton
          expand="block"
          onClick={descargarPDF}
          disabled={!botonHabilitado || loading}
        >
          {loading ? 'Generando PDF...' : 'Descargar PDF'}
        </IonButton>
        
        <IonLoading isOpen={loading} message="Generando PDF..." />
        
        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError('')}
          header="Error"
          message={error}
          buttons={['OK']}
        />
      </IonCardContent>
    </IonCard>
  );
};

export default InformeDescarga;