import React from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

interface GrabacionesTutorialProps {
  run: boolean;
  onFinish: () => void;
}

const GrabacionesTutorial: React.FC<GrabacionesTutorialProps> = ({ run, onFinish }) => {
  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h3>Grabaciones</h3>
          <p>
            En esta sección puedes buscar y revisar los clips generados por las cámaras. 
            Te mostraremos las principales funciones que puedes usar.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: ".container",
      content: (
        <div>
          <h3 className="font-semibold">Buscador de grabaciones</h3>
          <p>
            Aquí puedes filtrar las grabaciones por cámara, fecha u otros criterios 
            para encontrar fácilmente el clip que buscas.
          </p>
        </div>
      ),
    },
    {
      target: ".results-list",
      content: (
        <div>
          <h3 className="font-semibold">Videos</h3>
          <p>
            Aquí se mostrarán los videos encontrados según los criterios de búsqueda definidos.
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

export default GrabacionesTutorial;
