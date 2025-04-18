
import React from 'react';
import { cn } from '@/lib/utils';

type PianoKeyProps = {
  note: string;
  isBlackKey: boolean;
  isPlaying: boolean;
  onClick: () => void;
};

const PianoKey: React.FC<PianoKeyProps> = ({ 
  note, 
  isBlackKey, 
  isPlaying, 
  onClick 
}) => {
  return (
    <div
      className={cn(
        'relative flex items-end justify-center select-none cursor-pointer transition-colors',
        isBlackKey 
          ? 'bg-gray-900 text-white h-32 w-10 z-10 -mx-5' 
          : 'bg-white text-gray-900 h-48 w-14 z-0',
        isPlaying && (isBlackKey ? 'bg-blue-700' : 'bg-blue-300')
      )}
      onClick={onClick}
    >
      <span className={cn(
        'mb-2 text-xs font-medium',
        isBlackKey ? 'text-gray-300' : 'text-gray-700'
      )}>
        {note}
      </span>
    </div>
  );
};

export default PianoKey;
