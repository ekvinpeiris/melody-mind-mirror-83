
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type PianoKeyProps = {
  note: string;
  isBlackKey: boolean;
  isPlaying: boolean;
  onClick: () => void;
  keyPosition: number;
  isPerfectHit?: boolean;
};

const PianoKey = forwardRef<HTMLDivElement, PianoKeyProps>(({ 
  note, 
  isBlackKey, 
  isPlaying, 
  onClick,
  keyPosition,
  isPerfectHit = false
}, ref) => {
  // Extract the note name (e.g., "C" from "C4")
  const noteName = note.charAt(0);
  const octave = note.charAt(note.length - 1);
  
  // Determine color highlight based on note
  const getKeyHighlight = () => {
    if (isPlaying) {
      if (isPerfectHit) {
        return isBlackKey ? 'from-yellow-600 to-yellow-700' : 'from-yellow-300 to-yellow-200';
      }
      return isBlackKey ? 'from-blue-800 to-blue-700' : 'from-blue-200 to-blue-100';
    }
    return isBlackKey ? 'from-gray-900 to-gray-800' : 'from-white to-gray-50';
  };
  
  return (
    <div
      ref={ref}
      data-position={keyPosition}
      data-note={note}
      className={cn(
        'relative cursor-pointer transition-colors duration-100',
        isBlackKey 
          ? 'h-32 w-8 -mx-4 z-10 bg-gradient-to-b border-t border-gray-600 rounded-b-md shadow-lg' 
          : 'h-48 w-14 z-0 bg-gradient-to-b border border-gray-300 rounded-b-md shadow-md',
        getKeyHighlight(),
        isPlaying && 'key-pressed',
        isPerfectHit && 'perfect-key-hit'
      )}
      onClick={onClick}
    >
      {/* Note label with octave */}
      <span className={cn(
        'absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium',
        isBlackKey ? 'text-gray-400' : 'text-gray-600'
      )}>
        {noteName}{octave}
      </span>
      
      {/* Hit indicator */}
      {isPlaying && (
        <div className={cn(
          'absolute bottom-0 left-0 right-0 rounded-b-md h-2',
          isPerfectHit ? 'bg-yellow-400' : (isBlackKey ? 'bg-blue-500' : 'bg-blue-400')
        )} />
      )}
      
      {/* Perfect hit indicator */}
      {isPerfectHit && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-yellow-400 animate-ping opacity-70"></div>
        </div>
      )}
    </div>
  );
});

PianoKey.displayName = 'PianoKey';

export default PianoKey;
