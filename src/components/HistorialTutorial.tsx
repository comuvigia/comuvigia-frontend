import React from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

interface HistorialTutorialProps {
  run: boolean;
  onFinish: () => void;
}

const HistorialTutorial: React.FC<HistorialTutorialProps> = ({ run, onFinish }) => {
  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h3>Historial</h3>
          <p>Aquí podrás revisar las alertas generadas por las cámaras de tu comunidad.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: ".containerHistorial",
      content: (
        <div>
          <h3>Vista Principal</h3>
          <p>Esta es la vista principal del historial de cámaras y alertas.</p>
        </div>
      ),
      placement: "top",
    },
    {
      target: ".cameras-list",
      content: (
        <div>
          <h3>Cámaras</h3>
          <p>Aquí puedes ver la lista de cámaras disponibles en el sistema.</p>
        </div>
      ),
      placement: "right",
    },
    {
      target: ".alerts-panel",
      content: (
        <div>
          <h3>Alertas</h3>
          <p>Aquí se muestran las alertas registradas para la cámara seleccionada. Al seleccionar una alerta puedes ver más información.</p>
        </div>
      ),
      placement: "right",
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

export default HistorialTutorial;
