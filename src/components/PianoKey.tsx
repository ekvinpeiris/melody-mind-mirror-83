
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
        'relative cursor-pointer transition-colors duration-100',
        isBlackKey 
          ? 'h-32 w-8 -mx-4 z-10 bg-gradient-to-b from-gray-900 to-gray-800 border-t border-gray-600 rounded-b-md shadow-lg' 
          : 'h-48 w-14 z-0 bg-gradient-to-b from-white to-gray-100 border border-gray-300 rounded-b-md shadow-md',
        isPlaying && (isBlackKey ? 'bg-blue-700 from-blue-800 to-blue-700' : 'bg-blue-200 from-blue-200 to-blue-100')
      )}
      onClick={onClick}
    >
      <span className={cn(
        'absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium',
        isBlackKey ? 'text-gray-400' : 'text-gray-600'
      )}>
        {note}
      </span>
    </div>
  );
};

export default PianoKey;
