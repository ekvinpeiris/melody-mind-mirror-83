
import React from 'react';
import { cn } from '@/lib/utils';

type FallingNoteProps = {
  note: string;
  isBlackKey: boolean;
  duration: number;
  position: number; // Horizontal position
};

const FallingNote: React.FC<FallingNoteProps> = ({ note, isBlackKey, duration, position }) => {
  return (
    <div
      className={cn(
        'absolute rounded-t-sm transition-transform',
        isBlackKey ? 'bg-gray-800' : 'bg-blue-200 border-x border-gray-300',
      )}
      style={{
        height: `${duration * 100}px`,
        width: isBlackKey ? '32px' : '56px',
        left: `${position}px`,
        animation: `fall ${duration}s linear`,
        opacity: 0.8,
      }}
    />
  );
};

export default FallingNote;
