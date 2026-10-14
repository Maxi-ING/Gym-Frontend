import type { ReactNode } from 'react';
import { useMotionReveal } from '../hooks/useMotionReveal';

export default function MotionSurface({ children }: { children: ReactNode }) {
  const ref = useMotionReveal();
  return (
    <div ref={ref} className="route-view">
      {children}
    </div>
  );
}
