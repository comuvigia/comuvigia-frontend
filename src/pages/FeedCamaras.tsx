import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import axios from "axios";
import "./FeedCamaras.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const BUCKET_URL = import.meta.env.VITE_BUCKET_URL;

interface Camera {
  id: number;
  nombre: string;
  link_camara: string;
  link_camara_externo?: string;
  estado_camara?: boolean;
}

const FeedCamaras: React.FC = () => {
  const [camaras, setCamaras] = useState<Camera[]>([]);
  const [numFeed, setNumFeed] = useState<1 | 2 | 4>(4);
  const [seleccionadas, setSeleccionadas] = useState<(Camera | null)[]>([null, null, null, null]);

  useEffect(() => {
    const fetchCamaras = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/camaras`, { withCredentials: true });
        setCamaras(res.data);
      } catch (err) {
        console.error("Error al obtener cámaras:", err);
      }
    };
    fetchCamaras();
  }, []);

  const handleCamChange = (index: number, camId: number) => {
    const cam = camaras.find((c) => c.id === camId) || null;
    setSeleccionadas((prev) => {
      const nuevas = [...prev];
      nuevas[index] = cam;
      return nuevas;
    });
  };

  const handleNumFeedChange = (n: 1 | 2 | 4) => {
    setNumFeed(n);
    setSeleccionadas((prev) => {
      const nuevas = [...prev];
      for (let i = n; i < 4; i++) {
        nuevas[i] = null;
      }
      return nuevas;
    });
  };

  const idsSeleccionados = seleccionadas.filter((c) => c !== null).map((c) => c!.id);
  const grids = seleccionadas.slice(0, numFeed);
  const colSize = numFeed === 1 ? "12" : numFeed === 2 ? "6" : "6";

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Feed de Cámaras</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="segment-container">
          <IonLabel>Vista:</IonLabel>
          <IonSegment
            value={String(numFeed)}
            onIonChange={(e) => handleNumFeedChange(Number(e.detail.value) as 1 | 2 | 4)}
          >
            <IonSegmentButton value="1">1</IonSegmentButton>
            <IonSegmentButton value="2">2</IonSegmentButton>
            <IonSegmentButton value="4">4</IonSegmentButton>
          </IonSegment>
        </div>

        <IonGrid>
          <IonRow>
            {grids.map((cam, index) => (
              <IonCol key={index} size={colSize}>
                <IonCard>
                  <IonCardHeader>
                    <IonItem lines="none">
                      <IonLabel>
                        {cam ? cam.nombre : `Cámara ${index + 1}`}
                      </IonLabel>

                      <IonSelect
                        placeholder="Seleccionar cámara"
                        value={cam?.id}
                        onIonChange={(e) => handleCamChange(index, e.detail.value)}
                      >
                        {camaras
                          .filter(
                            (c) => c.id === cam?.id || !idsSeleccionados.includes(c.id)
                          )
                          .map((c) => (
                            <IonSelectOption key={c.id} value={c.id}>
                              {c.nombre}
                            </IonSelectOption>
                          ))}
                      </IonSelect>
                    </IonItem>
                  </IonCardHeader>

                  <IonCardContent>
                    {cam ? (
                      cam.link_camara_externo ? (
                        <img
                          src={cam.link_camara_externo}
                          alt={cam.nombre}
                          className="feed-video"
                        />
                      ) : (
                        <video
                          src={`${BUCKET_URL}${cam.link_camara}`}
                          autoPlay
                          muted
                          controls
                          className="feed-video"
                        />
                      )
                    ) : (
                      <div className="feed-placeholder">
                        <p>Seleccione una cámara</p>
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default FeedCamaras;