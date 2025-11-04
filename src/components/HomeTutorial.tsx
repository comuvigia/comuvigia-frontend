import React from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

interface HomeTutorialProps {
  run: boolean;
  onFinish: () => void;
}

const HomeTutorial: React.FC<HomeTutorialProps> = ({ run, onFinish }) => {
  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h3>Bienvenido a ComuVigia</h3>
          <p>Te mostraremos rápidamente cómo usar el panel principal del sistema.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: "#map-view",
      content: (
        <div>
          <h3>Mapa</h3>
          <p>Aquí puedes ver el mapa principal con las cámaras instaladas en tu comunidad.</p>
        </div>
      ),
      placement: "top",
    },
    {
      target: "#mantenedores-fab",
      content: (
        <div>
          <h3>Mantenedores</h3>
          <p>Aquí puedes ver información sobre cámaras.</p>
        </div>
      ),
      placement: "top",
    },
    {
      target: "#heatmap-fab",
      content: (
        <div>
          <h3>Mapa de Calor</h3>
          <p>Aquí puedes seleccionar un rango de fecha para generar un mapa de calor por sectores.</p>
        </div>
      ),
      placement: "top",
    },
    {
      target: "#notifications-icon",
      content: (
        <div>
          <h3>Notificaciones</h3>
          <p>Desde aquí puedes acceder a las alertas detectadas por el sistema, además de marcar alertas como vistas o falso positivo y más.</p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "#navbar-menu",
      content: (
        <div>
          <h3>Menú</h3>
          <p>Aquí puedes navegar entre las diferentes funcionalidades del sistema.</p>
        </div>
      ),
      placement: "right",
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      onFinish();
    }
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
        skip: "Saltar"
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

export default HomeTutorial;
