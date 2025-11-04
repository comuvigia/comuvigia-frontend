import React, { useEffect, useState } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

interface ReportesTutorialProps {
  run: boolean;
  onFinish: () => void;
}

const ReportesTutorial: React.FC<ReportesTutorialProps> = ({ run, onFinish }) => {
  const [primaryColor, setPrimaryColor] = useState("#1B4965");
  const [textColor, setTextColor] = useState("#333");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const ionicPrimary = rootStyles.getPropertyValue('--ion-color-primary').trim();
    const ionicText = rootStyles.getPropertyValue('--ion-text-color').trim();
    const ionicBackground = rootStyles.getPropertyValue('--ion-background-color').trim();

    if (ionicPrimary) setPrimaryColor(ionicPrimary);
    if (ionicText) setTextColor(ionicText);
    if (ionicBackground) setBackgroundColor(ionicBackground);
  }, []);

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <h3>Reportes</h3>
          <p>
            Aquí podrás analizar las alertas registradas y generar estadísticas
            según tus filtros de búsqueda.
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "#filtro-periodo",
      content: (
        <div>
          <h3>Filtro de período</h3>
          <p>
            Usa este filtro para seleccionar el rango de fechas y la agrupación (día, semana o mes).<br />
            Luego presiona <strong>“Generar reporte”</strong> para actualizar las estadísticas.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: "#estadisticas-totales",
      content: (
        <div>
          <h3>Estadísticas totales</h3>
          <p>
            Aquí puedes ver un resumen general del número total de alertas detectadas por tipo.
            Es ideal para obtener una visión rápida del período seleccionado.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: "#grafico-sector",
      content: (
        <div>
          <h3>Gráfico por sector</h3>
          <p>
            Este gráfico muestra la distribución de alertas según el sector.
            Te ayuda a identificar las zonas con más actividad o incidentes.
          </p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "#grafico-tipo",
      content: (
        <div>
          <h3>Gráfico por tipo</h3>
          <p>
            Aquí se visualiza la proporción de los distintos tipos de alertas.
            Es útil para entender qué tipo de evento ocurre con mayor frecuencia.
          </p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".ion-card-detalle",
      content: (
        <div>
          <h3>Detalle por sectores</h3>
          <p>
            En esta tabla puedes ver el detalle de cada sector con su cantidad específica de alertas.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: "#informe-descarga",
      content: (
        <div>
          <h3>Descarga de informe</h3>
          <p>
            Desde aquí puedes descargar un informe con toda la información mostrada.
            Ideal para respaldar o presentar tus reportes.
          </p>
        </div>
      ),
      placement: "top",
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
          primaryColor,
          textColor,
          backgroundColor,
          zIndex: 2000,
        },
      }}
    />
  );
};

export default ReportesTutorial;
