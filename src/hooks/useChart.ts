import { useEffect, useRef } from 'react';
import { Chart, registerables, type ChartConfiguration, type ChartType } from 'chart.js';
Chart.register(...registerables);
export function useChart<T extends ChartType>(config: ChartConfiguration<T>) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, config);
    return () => chart.destroy();
  }, [config]);
  return ref;
}
