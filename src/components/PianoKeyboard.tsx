
import React, { useRef, useEffect, useState } from 'react';
import PianoKey from './PianoKey';
import FallingNote from './FallingNote';
import * as Tone from 'tone';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [3, 4, 5]; // Middle 3 octaves

type PianoKeyboardProps = {
  activeNotes?: string[];
  fallingNotes?: Array<{
    id: string;
    note: string;
    duration: number;
    time: number;
  }>;
  isPlaying?: boolean;
};

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ 
  activeNotes = [], 
  fallingNotes = [],
  isPlaying = false
}) => {
  const synth = useRef<Tone.PolySynth | null>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const [keyPositions, setKeyPositions] = useState<Record<string, number>>({});
  
  // Initialize synth
  useEffect(() => {
    synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
    
    return () => {
      if (synth.current) {
        synth.current.dispose();
      }
    };
  }, []);
  
  // Calculate key positions for falling notes
  useEffect(() => {
    if (keyboardRef.current) {
      const positions: Record<string, number> = {};
      const keys = keyboardRef.current.querySelectorAll('[data-position]');
      
      keys.forEach((key) => {
        const note = key.textContent?.trim() || '';
        const rect = key.getBoundingClientRect();
        const keyboardRect = keyboardRef.current!.getBoundingClientRect();
        const position = rect.left - keyboardRect.left + (rect.width / 2);
        positions[note] = position;
      });
      
      setKeyPositions(positions);
    }
  }, []);
  
  const playNote = (note: string) => {
    if (synth.current) {
      synth.current.triggerAttackRelease(note, "8n");
    }
  };
  
  // Generate all notes for our keyboard
  const allNotes = React.useMemo(() => {
    return OCTAVES.flatMap(octave => 
      NOTES.map(note => ({
        id: `${note}${octave}`,
        isBlackKey: note.includes('#')
      }))
    );
  }, []);
  
  return (
    <div className="relative h-60 overflow-hidden">
      {/* Falling notes visualization area */}
      <div className="absolute inset-0 z-0">
        {isPlaying && fallingNotes.map((fallingNote) => {
          const isBlack = fallingNote.note.includes('#');
          return (
            <FallingNote
              key={fallingNote.id}
              note={fallingNote.note}
              isBlackKey={isBlack}
              duration={fallingNote.duration}
              position={keyPositions[fallingNote.note] || 0}
            />
          );
        })}
      </div>
      
      {/* Piano keyboard */}
      <div 
        ref={keyboardRef}
        className="absolute bottom-0 flex justify-center w-full"
      >
        <div className="flex">
          {allNotes.map(({ id, isBlackKey }, index) => (
            <PianoKey
              key={id}
              note={id}
              isBlackKey={isBlackKey}
              isPlaying={activeNotes.includes(id)}
              onClick={() => playNote(id)}
              keyPosition={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PianoKeyboard;
