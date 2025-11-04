import React from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

interface FeedCamarasTutorialProps {
  run: boolean;
  onFinish: () => void;
}

const FeedCamarasTutorial: React.FC<FeedCamarasTutorialProps> = ({ run, onFinish }) => {
  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h3>Feed de Cámaras</h3>
          <p>
            Aquí puedes visualizar las transmisiones de tus cámaras en tiempo real.
            Puedes elegir ver una, dos o cuatro cámaras simultáneamente.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: ".segment-container",
      placement: "bottom",
      content: (
        <div>
          <h3>Vista de cuadrícula</h3>
          <p>
            Usa estos botones para cambiar entre <strong>1</strong>, <strong>2</strong> o <strong>4</strong> cámaras.
            La cuadrícula se ajustará automáticamente.
          </p>
        </div>
      ),
    },
    {
      target: ".feed-content .ion-grid",
      placement: "top",
      content: (
        <div>
          <h3>Visualización de cámaras</h3>
          <p>
            Cada recuadro muestra el video en vivo de una cámara seleccionada.
            Si aún no hay una seleccionada, puedes elegirla desde el menú desplegable.
          </p>
        </div>
      ),
    },
    {
      target: ".feed-content ion-select",
      placement: "bottom",
      content: (
        <div>
          <h3>Selección de cámara</h3>
          <p>
            Usa este menú para seleccionar qué cámara deseas mostrar en cada recuadro.
            Solo puedes usar cada cámara una vez para evitar duplicados.
          </p>
        </div>
      ),
    },
    {
      target: ".feed-video",
      placement: "top",
      content: (
        <div>
          <h3>Transmisión en vivo</h3>
          <p>
            Aquí se muestra la transmisión o imagen actual de la cámara.
            Si la cámara tiene un enlace externo, se mostrará su flujo directamente.
          </p>
        </div>
      ),
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) onFinish();
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showSkipButton
      callback={handleJoyrideCallback}
      locale={{
        back: "Atrás",
        close: "Cerrar",
        last: "Finalizar",
        next: "Siguiente",
        skip: "Saltar",
      }}
      styles={{
        options: {
          primaryColor: "#1B4965",
          textColor: "#333",
          zIndex: 2000,
        },
      }}
    />
  );
};

export default FeedCamarasTutorial;
