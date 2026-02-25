'use client';

import { useEffect, useRef } from 'react';
import { BarChart3 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

type ChartDataProp = {
  labels: string[];
  datasets: { label: string; data: number[] }[];
};

type DataVisualizationProps = {
  chartData: ChartDataProp;
};

const colors = [
  { bg: 'rgba(139, 92, 246, 0.6)', border: 'rgb(139, 92, 246)' },
  { bg: 'rgba(236, 72, 153, 0.6)', border: 'rgb(236, 72, 153)' },
  { bg: 'rgba(59, 130, 246, 0.6)', border: 'rgb(59, 130, 246)' },
  { bg: 'rgba(34, 197, 94, 0.6)', border: 'rgb(34, 197, 94)' },
];

export function DataVisualization({ chartData }: DataVisualizationProps) {
  const chartRef = useRef<ChartJS<'bar'>>(null);

  const data: ChartData<'bar'> = {
    labels: chartData.labels,
    datasets: chartData.datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: colors[i % colors.length].bg,
      borderColor: colors[i % colors.length].border,
      borderWidth: 2,
      borderRadius: 6,
    })),
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(203, 213, 225)',
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgb(30, 41, 59)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(203, 213, 225)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(148, 163, 184)',
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
    },
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Data Visualization</h3>
      </div>
      <div className="h-[400px]">
        <Bar ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
}
