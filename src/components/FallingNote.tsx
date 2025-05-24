
import React, { useEffect, useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type FallingNoteProps = {
  note: string;
  isBlackKey: boolean;
  duration: number;
  position: number;
  animationDuration: number; 
  timeUntilHit?: number;      
  isActive?: boolean;
  isDummy?: boolean; // Added for dummy notes
};

// Removed FALL_DURATION_SECONDS

const FallingNote = forwardRef<HTMLDivElement, FallingNoteProps>(
  ({ note, isBlackKey, duration, position, isActive, timeUntilHit, animationDuration, isDummy }, ref) => {
    if (isDummy) {
      return null; // Do not render dummy notes
    }

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

    // More precise hit window calculation - when note is exactly at the key position
    const hitWindow = 0.15; // 150ms hit window
    const isAboutToHit = timeUntilHit !== undefined && 
                         timeUntilHit <= hitWindow && 
                         timeUntilHit > -hitWindow;

    // Add pulsing effect when note is in the hit window
    const isPerfectHit = timeUntilHit !== undefined && 
                         Math.abs(timeUntilHit) < 0.05; // 50ms perfect hit window

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-sm opacity-80 falling-note', // Added 'falling-note'
          getColor(),
          isActive && 'note-hit',
          isAboutToHit && 'border-2 border-white',
          isPerfectHit && 'perfect-hit'
        )}
        style={{
          height: `${duration * 100}px`,
          width: `${noteWidth}px`,
          left: `${xPosition}px`,
          zIndex: isBlackKey ? 10 : 5,
          // willChange: 'transform', // Can be removed if CSS animation handles it
          animationDuration: `${animationDuration}s`,
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
          animationDelay: '0s', // Start immediately when rendered
          willChange: 'transform' // Retained for performance
        }}
        data-note={note}
        data-time-until-hit={timeUntilHit?.toFixed(3)} // Optional chaining
        data-hit-window={hitWindow.toFixed(3)}
        data-is-hit-window={isAboutToHit ? 'true' : 'false'}
      />
    );
  }
);

FallingNote.displayName = 'FallingNote';

export default FallingNote;
