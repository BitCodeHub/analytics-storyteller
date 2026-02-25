'use client';

import { useRef } from 'react';
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
  { bg: 'rgba(255, 255, 255, 0.9)', border: 'rgb(255, 255, 255)' },
  { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgb(16, 185, 129)' },
  { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgb(59, 130, 246)' },
  { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgb(245, 158, 11)' },
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
      borderWidth: 0,
      borderRadius: 4,
    })),
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: 'rgb(163, 163, 163)',
          font: { size: 12, weight: 500 },
          boxWidth: 12,
          boxHeight: 12,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgb(23, 23, 23)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(163, 163, 163)',
        borderColor: 'rgb(38, 38, 38)',
        borderWidth: 1,
        padding: 16,
        cornerRadius: 8,
        titleFont: { weight: 600 },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(115, 115, 115)',
          font: { size: 11 },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
        border: {
          color: 'rgb(38, 38, 38)',
        },
      },
      y: {
        ticks: {
          color: 'rgb(115, 115, 115)',
          font: { size: 11 },
        },
        grid: {
          color: 'rgb(38, 38, 38)',
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
      <div className="p-5 border-b border-neutral-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-amber-500" />
        </div>
        <h3 className="font-semibold text-white">Data Visualization</h3>
      </div>
      <div className="p-6">
        <div className="h-[400px]">
          <Bar ref={chartRef} data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
