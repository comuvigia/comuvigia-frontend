// components/Charts.tsx
import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import "./Charts.css"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  data: any;
}

export const PieChart: React.FC<ChartProps> = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return <Pie data={data} options={options}/>;
};

export const BarChartSector: React.FC<ChartProps> = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: ''
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Alertas'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Sector'
        }
      }
    }
  };
  return <Bar data={data} options={options} className='bar-chart'/>;
};

export const BarChartTipo: React.FC<ChartProps> = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: ''
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Alertas'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tipos de Alerta'
        }
      }
    }
  };
  return <Bar data={data} options={options} className='bar-chart'/>;
};