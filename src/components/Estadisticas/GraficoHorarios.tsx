import React from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Horario {
  hora: number;
  merodeos: number;
  portonazos: number;
  asaltos_hogar: number;
}

interface GraficoHorariosProps {
  horarios: Horario[];
}

const GraficoHorarios: React.FC<GraficoHorariosProps> = ({ horarios }) => {
  // ⚙️ Transformación interna
  const labels = horarios.map(
    (h) => `${h.hora.toString().padStart(2, "0")}:00`
  );

  const dataHorarios = {
    labels,
    datasets: [
      {
        label: "Merodeos",
        data: horarios.map((h) => h.merodeos),
        backgroundColor: "#4CAF50",
      },
      {
        label: "Portonazos",
        data: horarios.map((h) => h.portonazos),
        backgroundColor: "#F44336",
      },
      {
        label: "Asaltos Hogar",
        data: horarios.map((h) => h.asaltos_hogar),
        backgroundColor: "#FFEB3B",
      },
    ],
  };

  const opciones: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Hora del día",
          font: { size: 14 },
        },
      },
      y: {
        title: {
          display: true,
          text: "Cantidad de alertas",
          font: { size: 14 },
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // 🧠 Evitar render vacío
  if (!horarios || horarios.length === 0) {
    return (
      <IonCard style={{ width: "100%", borderRadius: "12px" }}>
        <IonCardHeader>
          <IonCardTitle style={{ textAlign: "center" }}>
            Distribución horaria por tipo de delito
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ textAlign: "center", padding: "30px" }}>
          <p style={{ color: "#888" }}>No hay datos de horarios disponibles.</p>
        </IonCardContent>
      </IonCard>
    );
  }
  console.log("📊 Horarios recibidos:", horarios)

  return (
    <IonCard style={{ width: "100%", borderRadius: "12px" }}>
        
      <IonCardHeader>
        <IonCardTitle style={{ textAlign: "center" }}>
          Distribución horaria por tipo de delito
        </IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        <div
          style={{
            width: "100%",
            height: "400px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Bar data={dataHorarios} options={opciones} />
        </div>

        {/* Top 3 horarios más activos */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <h4 style={{ marginBottom: "10px", color: "#1B4965" }}>
            Top 3 horarios de mayor riesgo por tipo
          </h4>

          {dataHorarios.datasets.map((dataset) => {
            const top3 = Array.from(dataset.data as number[])
              .map((val, i) => ({ hora: dataHorarios.labels[i], valor: val }))
              .filter((item) => typeof item.valor === "number" && item.valor > 0)
              .sort((a, b) => b.valor - a.valor)
              .slice(0, 3);

            return (
              <div key={dataset.label} style={{ marginBottom: "10px" }}>
                <strong>{dataset.label}</strong>
                {top3.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {top3.map((t, i) => (
                      <li key={i} style={{ fontSize: "0.9rem" }}>
                        {i + 1}. {t.hora} — {t.valor} alertas
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: "0.85rem", color: "#888" }}>Sin actividad reciente</p>
                )}
              </div>
            );
          })}

        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default GraficoHorarios;
