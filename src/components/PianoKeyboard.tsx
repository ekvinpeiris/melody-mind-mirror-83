
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
  // Use a more specific type that works with both Synth and Sampler
  const synth = useRef<Tone.Sampler | null>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const [keyPositions, setKeyPositions] = useState<Record<string, number>>({});
  const [visibleNotes, setVisibleNotes] = useState<Array<{
    id: string;
    note: string;
    duration: number;
    time: number;
    visible: boolean;
  }>>([]);
  
  // Initialize synth with piano samples
  useEffect(() => {
    const sampler = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3"
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
      const keys = keyboardRef.current.querySelectorAll('[data-note]');
      
      keys.forEach((key) => {
        const note = key.getAttribute('data-note') || '';
        const rect = key.getBoundingClientRect();
        const keyboardRect = keyboardRef.current!.getBoundingClientRect();
        // Get exact position of center of key
        const position = rect.left - keyboardRect.left + (rect.width / 2);
        positions[note] = position;
      });
      
      setKeyPositions(positions);
    }
  }, []);
  
  // Update visible notes based on current playback
  useEffect(() => {
    // Process visible notes when either isPlaying changes or fallingNotes changes
    const updateVisibleNotes = () => {
      if (isPlaying && fallingNotes.length > 0) {
        const now = Tone.Transport.seconds;
        const noteWindow = 4; // Show notes 4 seconds ahead
        
        // Calculate which notes should be visible based on current time
        const currentVisibleNotes = fallingNotes.map(note => {
          const timeUntilNote = note.time - now;
          return {
            ...note,
            visible: timeUntilNote < noteWindow && timeUntilNote > -note.duration
          };
        });
        
        setVisibleNotes(currentVisibleNotes);
      }
    };
    
    updateVisibleNotes();
    
    // Update visible notes every 100ms while playing
    const interval = isPlaying ? setInterval(updateVisibleNotes, 100) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, fallingNotes]);
  
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
      <div ref={visualizerRef} className="flex-1 relative overflow-hidden bg-[#1a1a1a]">
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
        
        {/* Falling notes container */}
        <div className="absolute inset-0">
          {visibleNotes.filter(note => note.visible && keyPositions[note.note]).map((fallingNote) => {
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
        className="h-48 bg-gray-800 flex justify-center z-10"
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
