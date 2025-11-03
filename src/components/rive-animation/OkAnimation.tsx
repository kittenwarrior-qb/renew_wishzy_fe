'use client';
import { useRive } from 'rive-react';

export type OkAnimationProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

export function OkAnimation({ width = '100%', height = 240, className }: OkAnimationProps) {
  const { RiveComponent } = useRive({ src: '/assets/riv/ok.riv', autoplay: true });

  return (
    <div
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width || '100%',
        height: typeof height === 'number' ? `${height}px` : height || '100%',
        minWidth: 0,
        minHeight: 0,
      }}
    >
      <RiveComponent style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
