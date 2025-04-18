
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
    // Slow down the animation by a factor of 2 to make it more visible
    setAnimationDuration(duration * 2);
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

  return (
    <div
      className={cn(
        'absolute rounded-sm',
        getColor(),
        'opacity-75'
      )}
      style={{
        height: `${duration * 100}px`,
        width: isBlackKey ? '32px' : '56px',
        left: `${position - (isBlackKey ? 16 : 28)}px`, // Center the note over the key
        bottom: 0,
        animation: `fall ${animationDuration}s linear`,
        animationFillMode: 'forwards',
      }}
    >
      <div className="w-full h-full" />
    </div>
  );
};

export default FallingNote;
