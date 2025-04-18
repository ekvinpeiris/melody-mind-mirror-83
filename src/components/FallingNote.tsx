
import React, { useEffect, useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type FallingNoteProps = {
  note: string;
  isBlackKey: boolean;
  duration: number;
  position: number;
  isActive?: boolean;
  timeUntilHit?: number;
};

const FallingNote = forwardRef<HTMLDivElement, FallingNoteProps>(
  ({ note, isBlackKey, duration, position, isActive, timeUntilHit }, ref) => {
    const [animationDuration, setAnimationDuration] = useState(4);
    
    useEffect(() => {
      // Fixed animation duration for predictable timing
      setAnimationDuration(4);
    }, [duration]);
    
    const getColor = () => {
      if (isBlackKey) return 'bg-orange-400';
      const noteName = note.charAt(0);
      switch(noteName) {
        case 'C': return 'bg-green-400';
        case 'D': return 'bg-yellow-400';
        case 'E': return 'bg-blue-400';
        case 'F': return 'bg-purple-400';
        case 'G': return 'bg-pink-400';
        case 'A': return 'bg-red-400';
        case 'B': return 'bg-indigo-400';
        default: return 'bg-gray-400';
      }
    };

    // Calculate the width and offset based on the key type
    const noteWidth = isBlackKey ? 32 : 56; // Match PianoKey widths
    const xPosition = position - (noteWidth / 2); // Center the note over the key

    // Determine if the note is about to be hit (within 150ms)
    const isAboutToHit = timeUntilHit !== undefined && timeUntilHit <= 0.15 && timeUntilHit > -0.1;

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-sm opacity-75 falling-note',
          getColor(),
          isActive && 'note-hit',
          isAboutToHit && 'border-2 border-white'
        )}
        style={{
          height: `${duration * 100}px`,
          width: `${noteWidth}px`,
          left: `${xPosition}px`,
          animationDuration: `${animationDuration}s`,
          zIndex: isBlackKey ? 10 : 5, // Ensure black key notes appear above white key notes
          animationDelay: '2s', // Keep the 2-second delay to sync with MIDI playback
          willChange: 'transform', // Optimize animation performance
        }}
        data-note={note}
        data-time-until-hit={timeUntilHit?.toFixed(3)}
      />
    );
  }
);

FallingNote.displayName = 'FallingNote';

export default FallingNote;
