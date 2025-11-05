import React from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

interface Camera {
  id: number;
  nombre: string;
  direccion: string;
  total_alertas: number;
}

interface RankingCamarasProps {
  cameras: Camera[];
}

const RankingCamaras: React.FC<RankingCamarasProps> = ({ cameras }) => {
  const history = useHistory();

  const sorted = [...cameras].sort((a, b) => b.total_alertas - a.total_alertas);
  const top = sorted.slice(0, 6);

  const colors = [
    "#1B4965",
    "#2E6A8E",
    "#4688B0",
    "#6BA6C5",
    "#9DC2D6",
    "#C8D9E6",
  ];

  const handleVerCamaras = () => {
    history.push("/feed_camaras", { topCamaras: top.slice(0, 4) });
  };

  return (
    <IonCard style={{ width: "100%", borderRadius: "12px" }}>
      <IonCardHeader>
        <IonCardTitle style={{ textAlign: "center" }}>
          Ranking de cámaras más efectivas (últimos 7 días)
        </IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {top.map((cam, index) => (
            <div
              key={cam.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: "8px",
                backgroundColor: colors[index] || "#ddd",
                color: index < 5 ? "#fff" : "#000",
                fontWeight: 500,
              }}
            >
              <div style={{ fontWeight: "bold", width: "25px", textAlign: "center" }}>
                {index + 1}
              </div>

              <div style={{ flex: 1, marginLeft: "12px" }}>
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: "bold",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cam.nombre}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    opacity: 0.8,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cam.direccion}
                </div>
              </div>

              <div style={{ fontWeight: "bold", minWidth: "20px", textAlign: "right" }}>
                {cam.total_alertas}
              </div>
            </div>
          ))}
        </div>

        <IonButton
          expand="block"
          color="primary"
          onClick={handleVerCamaras}
          style={{
            "--border-radius": "12px",
            "--background": "#1B4965",
            marginTop: "12px",
          }}
        >
          Ver las 4 cámaras
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};

export default RankingCamaras;
