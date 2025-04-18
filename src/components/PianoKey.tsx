
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type PianoKeyProps = {
  note: string;
  isBlackKey: boolean;
  isPlaying: boolean;
  onClick: () => void;
  keyPosition: number;
  isPerfectHit?: boolean; // New prop to show perfect hit feedback
};

const PianoKey = forwardRef<HTMLDivElement, PianoKeyProps>(({ 
  note, 
  isBlackKey, 
  isPlaying, 
  onClick,
  keyPosition,
  isPerfectHit = false
}, ref) => {
  return (
    <div
      ref={ref}
      data-position={keyPosition}
      data-note={note}
      className={cn(
        'relative cursor-pointer transition-colors duration-100',
        isBlackKey 
          ? 'h-32 w-8 -mx-4 z-10 bg-gradient-to-b from-gray-900 to-gray-800 border-t border-gray-600 rounded-b-md shadow-lg' 
          : 'h-48 w-14 z-0 bg-gradient-to-b from-white to-gray-50 border border-gray-300 rounded-b-md shadow-md',
        isPlaying && (isBlackKey ? 'bg-blue-700 from-blue-800 to-blue-700' : 'bg-blue-200 from-blue-200 to-blue-100'),
        isPlaying && 'key-pressed',
        isPerfectHit && 'perfect-key-hit'
      )}
      onClick={onClick}
    >
      <span className={cn(
        'absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium',
        isBlackKey ? 'text-gray-400' : 'text-gray-600'
      )}>
        {note}
      </span>
      {isPlaying && (
        <div className={cn(
          'absolute bottom-0 left-0 right-0 rounded-b-md h-2',
          isPerfectHit ? 'bg-yellow-400' : (isBlackKey ? 'bg-blue-500' : 'bg-blue-400')
        )} />
      )}
    </div>
  );
});

PianoKey.displayName = 'PianoKey';

export default PianoKey;
