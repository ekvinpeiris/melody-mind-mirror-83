
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
  // Update the type to be more generic to accept different Tone.js instruments
  const synth = useRef<Tone.Instrument | null>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const [keyPositions, setKeyPositions] = useState<Record<string, number>>({});
  
  // Initialize synth
  useEffect(() => {
    const sampler = new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();

    synth.current = sampler;
    
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
      // Use the proper method to trigger the note
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
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Falling notes visualization area */}
      <div className="flex-1 relative overflow-hidden bg-[#1a1a1a]">
        <div className="absolute inset-0">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-12 opacity-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-l border-white h-full" />
            ))}
          </div>
          {/* Horizontal time markers */}
          <div className="absolute inset-0 grid grid-rows-8 opacity-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border-t border-white w-full" />
            ))}
          </div>
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
      </div>
      
      {/* Piano keyboard */}
      <div 
        ref={keyboardRef}
        className="h-48 bg-gray-800 flex justify-center"
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
