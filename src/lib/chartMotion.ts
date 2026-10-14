import type { ChartOptions } from 'chart.js';

export function lineMotion(
  reduced: boolean,
): Pick<ChartOptions<'line'>, 'animation' | 'animations'> {
  if (reduced || document.documentElement.dataset.input === 'keyboard') return { animation: false };
  return {
    animation: { duration: 550, easing: 'easeOutQuart' },
    animations: {
      x: { duration: 400, easing: 'easeOutQuart' },
      y: {
        duration: 550,
        easing: 'easeOutQuart',
        delay: (context) => (context.type === 'data' ? Math.min(context.dataIndex * 35, 210) : 0),
      },
    },
  };
}
