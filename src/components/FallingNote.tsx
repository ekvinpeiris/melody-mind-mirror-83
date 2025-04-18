
import React from 'react';
import { cn } from '@/lib/utils';

type FallingNoteProps = {
  note: string;
  isBlackKey: boolean;
  duration: number;
};

const FallingNote: React.FC<FallingNoteProps> = ({ note, isBlackKey, duration }) => {
  return (
    <div
      className={cn(
        'absolute bottom-0 rounded-t-sm transition-transform',
        isBlackKey ? 'w-8 bg-gray-800' : 'w-14 bg-white border-x border-gray-300',
      )}
      style={{
        height: `${duration * 100}px`,
        animation: `fall ${duration}s linear`,
      }}
    />
  );
};

export default FallingNote;
