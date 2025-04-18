
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type FallingNoteProps = {
  note: string;
  isBlackKey: boolean;
  duration: number;
  position: number;
};

const FallingNote: React.FC<FallingNoteProps> = ({ note, isBlackKey, duration, position }) => {
  const [animationDuration, setAnimationDuration] = useState(0);
  
  useEffect(() => {
    // Adjust animation duration based on when the note should be played
    // Shorter duration = faster fall, longer = slower fall
    // Use a consistent speed to ensure visual consistency
    setAnimationDuration(4); // Fixed 4 second fall time for all notes for better predictability
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

  return (
    <div
      className={cn(
        'absolute rounded-sm opacity-75 falling-note',
        getColor(),
      )}
      style={{
        height: `${duration * 100}px`,
        width: `${noteWidth}px`,
        left: `${xPosition}px`,
        animationDuration: `${animationDuration}s`,
        zIndex: isBlackKey ? 10 : 5, // Ensure black key notes appear above white key notes
        animationDelay: '0s', // Ensure no delay in animation start
      }}
      data-note={note}
    />
  );
};

export default FallingNote;
