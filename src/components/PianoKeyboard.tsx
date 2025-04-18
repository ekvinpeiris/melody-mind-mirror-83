
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

type VisibleNote = {
  id: string;
  note: string;
  duration: number;
  time: number;
  visible: boolean;
  timeUntilHit: number;
};

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ 
  activeNotes = [], 
  fallingNotes = [],
  isPlaying = false
}) => {
  const synth = useRef<Tone.Sampler | null>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const keyRefs = useRef<Record<string, HTMLDivElement>>({});
  const noteRefs = useRef<Record<string, HTMLDivElement>>({});
  
  const [keyPositions, setKeyPositions] = useState<Record<string, number>>({});
  const [visibleNotes, setVisibleNotes] = useState<VisibleNote[]>([]);
  const [hitStatus, setHitStatus] = useState<Record<string, boolean>>({});
  
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
        // Calculate the center of the key for precise positioning
        const position = rect.left - keyboardRect.left + (rect.width / 2);
        positions[note] = position;
      });
      
      setKeyPositions(positions);
    }
  }, []);
  
  // Check if any notes are being hit
  const checkNoteHits = () => {
    if (!isPlaying) return;
    
    const now = Tone.Transport.seconds;
    const hitWindow = 0.15; // 150ms hit window
    const newHitStatus: Record<string, boolean> = {};
    
    visibleNotes.forEach(note => {
      const timeUntilHit = note.time - now;
      // Note is being hit if it's within the hit window and the corresponding key is active
      if (Math.abs(timeUntilHit) < hitWindow && activeNotes.includes(note.note)) {
        newHitStatus[note.id] = true;
        console.log(`HIT! Note ${note.note} hit at time: ${timeUntilHit.toFixed(3)}`);
      }
    });
    
    setHitStatus(newHitStatus);
  };
  
  // Update visible notes based on current playback
  useEffect(() => {
    // Process visible notes when either isPlaying changes or fallingNotes changes
    const updateVisibleNotes = () => {
      if (isPlaying && fallingNotes.length > 0) {
        const now = Tone.Transport.seconds;
        const noteWindow = 6; // Show notes 6 seconds ahead - increased to account for 2s delay
        
        // Calculate which notes should be visible based on current time
        const currentVisibleNotes: VisibleNote[] = fallingNotes.map(note => {
          const timeUntilNote = note.time - now;
          const shouldBeVisible = timeUntilNote < noteWindow && timeUntilNote > -note.duration;
          
          return {
            ...note,
            visible: shouldBeVisible,
            timeUntilHit: timeUntilNote
          };
        });
        
        setVisibleNotes(currentVisibleNotes);
      } else if (!isPlaying) {
        // Clear visible notes when stopped
        setVisibleNotes([]);
      }
    };
    
    updateVisibleNotes();
    
    // Update visible notes more frequently while playing for smoother visualization
    const interval = isPlaying ? setInterval(() => {
      updateVisibleNotes();
      checkNoteHits(); // Also check for note hits on each update
    }, 16) : null; // 60fps for maximum smoothness
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, fallingNotes, activeNotes]);
  
  const playNote = (note: string) => {
    if (synth.current) {
      // Use the proper method to trigger the note
      synth.current.triggerAttackRelease(note, "8n");
      
      // For debug - log when note is played manually
      console.log(`Key pressed: ${note}`);
      
      // Check if this manual key press hits any falling notes
      const now = Tone.Transport.seconds;
      const hitWindow = 0.15; // 150ms hit window
      
      visibleNotes.forEach(fallingNote => {
        if (fallingNote.note === note) {
          const timeUntilHit = fallingNote.time - now;
          if (Math.abs(timeUntilHit) < hitWindow) {
            console.log(`Manual hit! Note ${note} hit at time: ${timeUntilHit.toFixed(3)}`);
            // Update hit status for this note
            setHitStatus(prev => ({
              ...prev,
              [fallingNote.id]: true
            }));
          }
        }
      });
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
  
  // Store references to piano keys
  const setKeyRef = (element: HTMLDivElement | null, noteId: string) => {
    if (element) {
      keyRefs.current[noteId] = element;
    }
  };
  
  // Store references to falling notes
  const setNoteRef = (element: HTMLDivElement | null, noteId: string) => {
    if (element) {
      noteRefs.current[noteId] = element;
    }
  };
  
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
          {visibleNotes
            .filter(note => note.visible && keyPositions[note.note]) // Only show notes with valid positions
            .map((fallingNote) => {
              const isBlack = fallingNote.note.includes('#');
              const isActive = hitStatus[fallingNote.id] || activeNotes.includes(fallingNote.note);
              
              return (
                <FallingNote
                  key={fallingNote.id}
                  ref={(el) => setNoteRef(el, fallingNote.id)}
                  note={fallingNote.note}
                  isBlackKey={isBlack}
                  duration={fallingNote.duration}
                  position={keyPositions[fallingNote.note] || 0}
                  isActive={isActive}
                  timeUntilHit={fallingNote.timeUntilHit}
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
              ref={(el) => setKeyRef(el as HTMLDivElement, id)}
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
