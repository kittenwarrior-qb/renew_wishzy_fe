'use client';

import { useEffect, useRef } from 'react';
import { useRive, useStateMachineInput } from 'rive-react';

type LittleBoyAnimationProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

export function LittleBoyAnimation({
  width = 800,
  height = 400,
  className,
}: LittleBoyAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { RiveComponent, rive } = useRive({
    src: '/riv/little-boy.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
    onLoad: () => {
      console.log('Rive animation loaded successfully');
    },
    onLoadError: (error) => {
      console.error('Rive animation failed to load:', error);
    },
  });

  const lookAtX = useStateMachineInput(rive, 'State Machine 1', 'lookX', 0);
  const lookAtY = useStateMachineInput(rive, 'State Machine 1', 'lookY', 0);
  const isHovering = useStateMachineInput(rive, 'State Machine 1', 'isHovering', false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      if (lookAtX) {
        lookAtX.value = x;
      }
      if (lookAtY) {
        lookAtY.value = y;
      }
    };

    const handleMouseEnter = () => {
      if (isHovering) {
        isHovering.value = true;
      }
    };

    const handleMouseLeave = () => {
      if (isHovering) {
        isHovering.value = false;
      }
      if (lookAtX) {
        lookAtX.value = 0;
      }
      if (lookAtY) {
        lookAtY.value = 0;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [rive, lookAtX, lookAtY, isHovering]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width || '100%',
        height: typeof height === 'number' ? `${height}px` : height || '100%',
        position: 'relative',
        cursor: 'pointer',
        minWidth: 0,
        minHeight: 0,
      }}
    >
      {RiveComponent ? (
        <RiveComponent
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #e0f2fe 0%, #f3e5f5 100%)',
          }}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">👦</div>
            <p className="text-gray-600">Loading animation...</p>
          </div>
        </div>
      )}
    </div>
  );
}
