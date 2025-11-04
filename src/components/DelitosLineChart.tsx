import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./DelitosLineChart.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface PeriodoData {
  periodo: string;
  merodeos: number;
  portonazos: number;
  asaltos_hogar: number;
  no_especificados: number;
}

interface Props {
  idCamara: number;
}

const DelitosLineChart: React.FC<Props> = ({ idCamara }) => {
  const [data, setData] = useState<PeriodoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dias, setDias] = useState<number>(30);
  const [estadisticas, setEstadisticas] = useState<any | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const group =
        dias >= 180 ? "month" : // 6 meses o más → agrupar por mes
        dias >= 30 ? "week" :   // entre 30 y 179 días → agrupar por semana
        "day";                  // menos de 30 días → agrupar por día

      try {
        console.log(`${BACKEND_URL}/api/alertas/estadisticas-camara?id_camara=${idCamara}&dias=${dias}&group=${group}`);
        const response = await fetch(
          `${BACKEND_URL}/api/alertas/estadisticas-camara?id_camara=${idCamara}&dias=${dias}&group=${group}`,
          { credentials: 'include' }
        );
        const result = await response.json();
        console.log("📥 Datos originales:", result);

        if (!result.success) throw new Error(result.error || "Error desconocido");
        setEstadisticas(result.estadisticas_totales);
        const formatted: PeriodoData[] = result.periodos
          .map((p: any) => ({
            periodo: new Date(p.periodo).toISOString(),
            merodeos: p.merodeos,
            portonazos: p.portonazos,
            asaltos_hogar: p.asaltos_hogar,
            no_especificados: p.no_especificados,
          }))
          .sort(
            (a: PeriodoData, b: PeriodoData) =>
              new Date(a.periodo).getTime() - new Date(b.periodo).getTime()
          );

        console.log("🧾 Datos formateados y ordenados:", formatted);

        const fixedTimeline = generateFixedTimeline(dias);
        console.log("📆 Línea de tiempo generada:", fixedTimeline);

        // Dentro de fetchData()

        const normalizeDate = (d: string): string => d.split("T")[0];

        const mergedData: PeriodoData[] = fixedTimeline.map((t: string) => {
        const tDate = new Date(t);



        
        // Buscamos el match más cercano dentro de la semana o mes según el group
        const match = formatted.find((d: PeriodoData) => {
            const dDate = new Date(d.periodo);

            if (group === "week") {
            // Coincide si está dentro de 7 días de diferencia
            const diff = Math.abs(dDate.getTime() - tDate.getTime());
            return diff <= 7 * 24 * 60 * 60 * 1000;
            } else if (group === "month") {
            // Coincide si es el mismo mes y año
            return (
                dDate.getFullYear() === tDate.getFullYear() &&
                dDate.getMonth() === tDate.getMonth()
            );
            } else {
            // Coincidencia exacta de día
            return normalizeDate(d.periodo) === normalizeDate(t);
            }
        });

        console.log("🔍 Comparando fechas:", {
            t,
            match_periodo: match ? match.periodo : "⛔ Sin match",
        });

        return (
            match || {
            periodo: t,
            merodeos: 0,
            portonazos: 0,
            asaltos_hogar: 0,
            no_especificados: 0,
            }
        );
        });


        console.log("✅ Datos finales para el gráfico:", mergedData);

        setData(mergedData);
      } catch (err: any) {
        console.error("Error al cargar datos del gráfico:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (idCamara) fetchData();
  }, [idCamara, dias]);

  const generateFixedTimeline = (dias: number): string[] => {
    const now = new Date();
    const dates: string[] = [];

    if (dias === 365) {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        dates.push(d.toISOString());
      }
    } else if (dias === 180) {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        dates.push(d.toISOString());
      }
    } else if (dias === 30) {
      for (let i = 27; i >= 0; i -= 7) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        dates.push(d.toISOString());
      }
    } else if (dias === 7) {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        dates.push(d.toISOString());
      }
    }

    return dates;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (dias === 365 || dias === 180)
      return date.toLocaleString("default", { month: "short" });
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  if (loading) return <p className="chart-loading">Cargando datos...</p>;
  if (error) return <p className="chart-error">Error: {error}</p>;
  if (!data.length) return <p className="chart-empty">No hay datos disponibles.</p>;

  return (
    <div >
    <div className="chart-container">
       <h3 style={{ margin: '0 0 8px 0' }}>Evolución de delitos - Cámara {idCamara}</h3>

      <div className="chart-buttons">
        <button onClick={() => setDias(7)} className={dias === 7 ? "active" : ""}>
          1 Semana
        </button>
        <button onClick={() => setDias(30)} className={dias === 30 ? "active" : ""}>
          1 Mes
        </button>
        <button onClick={() => setDias(180)} className={dias === 180 ? "active" : ""}>
          6 Meses
        </button>
        <button onClick={() => setDias(365)} className={dias === 365 ? "active" : ""}>
          1 Año
        </button>
      </div>
      <div className="chart-content">
        <div className="chart-svg-wrapper" style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="periodo"
            tickFormatter={formatDate}
            label={{ value: "Fecha", position: "insideBottom", offset: -5 }}
          />
          <YAxis label={{ value: "Cantidad", angle: -90, position: "insideLeft" }} />
          <Tooltip labelFormatter={(v) => `Fecha: ${formatDate(String(v))}`} />
          <Legend />
          <Line type="monotone" dataKey="merodeos" stroke="#ff7300" name="Merodeos" />
          <Line type="monotone" dataKey="portonazos" stroke="#387908" name="Portonazos" />
          <Line type="monotone" dataKey="asaltos_hogar" stroke="#8884d8" name="Asaltos Hogar" />
          <Line type="monotone" dataKey="no_especificados" stroke="#ccc" name="No especificados" />
        </LineChart>
      </ResponsiveContainer>
      </div>
      </div>

    </div>

            <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Falsos positivos</span>
            <span className="stat-value">{estadisticas.falsos_positivos}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Positivos</span>
            <span className="stat-value">{estadisticas.alertas_confirmadas}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Sin revisar</span>
            <span className="stat-value">{estadisticas.total_alertas - estadisticas.alertas_confirmadas - estadisticas.falsos_positivos}</span>
          </div>
        </div>
      </div>
    
  );
};

export default DelitosLineChart;
