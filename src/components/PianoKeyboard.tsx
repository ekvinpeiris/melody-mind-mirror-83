
import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  const [perfectHits, setPerfectHits] = useState<Record<string, boolean>>({});
  
  // Track the last update time to ensure consistent animation
  const lastUpdateTimeRef = useRef<number>(0);
  
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
  
  // More precise note hit detection logic
  const checkNoteHits = useCallback(() => {
    if (!isPlaying) return;
    
    const now = Tone.Transport.seconds;
    const hitWindow = 0.12; // 120ms hit window - narrower for more precision
    const perfectHitWindow = 0.05; // 50ms perfect hit window
    
    const newHitStatus: Record<string, boolean> = {};
    const newPerfectHits: Record<string, boolean> = {};
    
    // First, clear any notes that are no longer in the hit window
    visibleNotes.forEach(note => {
      const timeUntilHit = note.time - now;
      
      if (Math.abs(timeUntilHit) <= hitWindow) {
        // Only consider notes in the hit window for active status
        if (activeNotes.includes(note.note)) {
          newHitStatus[note.id] = true;
          
          // Check for perfect hit
          if (Math.abs(timeUntilHit) <= perfectHitWindow) {
            newPerfectHits[note.note] = true;
            // Only log perfect hits
            console.log(`PERFECT HIT! Note ${note.note} hit at time: ${timeUntilHit.toFixed(3)}`);
          }
        }
      }
    });
    
    // Update the state once with all changes
    setHitStatus(newHitStatus);
    setPerfectHits(newPerfectHits);
  }, [isPlaying, visibleNotes, activeNotes]);
  
  // Update visible notes based on current playback with optimized performance
  useEffect(() => {
    // Process visible notes when either isPlaying changes or fallingNotes changes
    const updateVisibleNotes = () => {
      if (isPlaying && fallingNotes.length > 0) {
        const now = Tone.Transport.seconds;
        const noteWindow = 6; // Show notes 6 seconds ahead
        
        // Calculate which notes should be visible based on current time
        const currentVisibleNotes: VisibleNote[] = fallingNotes
          .filter(note => {
            const timeUntilNote = note.time - now;
            // Only process notes that are coming up soon or just passed
            return timeUntilNote < noteWindow && timeUntilNote > -note.duration - 0.2;
          })
          .map(note => {
            const timeUntilNote = note.time - now;
            return {
              ...note,
              visible: true, // We've already filtered, so all are visible
              timeUntilHit: timeUntilNote
            };
          });
        
        setVisibleNotes(currentVisibleNotes);
      } else if (!isPlaying) {
        // Clear visible notes when stopped
        setVisibleNotes([]);
        setHitStatus({});
        setPerfectHits({});
      }
    };
    
    updateVisibleNotes();
    
    // Use requestAnimationFrame for better performance and visual synchronization
    let frameId: number | null = null;
    let previousTimestamp = 0;
    
    const animate = (timestamp: number) => {
      if (!previousTimestamp || timestamp - previousTimestamp >= 16) { // ~60fps
        updateVisibleNotes();
        checkNoteHits();
        previousTimestamp = timestamp;
      }
      frameId = requestAnimationFrame(animate);
    };
    
    if (isPlaying) {
      frameId = requestAnimationFrame(animate);
    }
    
    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isPlaying, fallingNotes, activeNotes, checkNoteHits]);
  
  const playNote = (note: string) => {
    if (synth.current) {
      // Use the proper method to trigger the note
      synth.current.triggerAttackRelease(note, "8n");
      
      // For manual key presses, check against all visible notes for potential hits
      const now = Tone.Transport.seconds;
      const hitWindow = 0.12; // 120ms hit window
      const perfectHitWindow = 0.05; // 50ms perfect hit window
      
      let foundHit = false;
      let foundPerfectHit = false;
      
      visibleNotes.forEach(fallingNote => {
        if (fallingNote.note === note) {
          const timeUntilHit = fallingNote.time - now;
          
          if (Math.abs(timeUntilHit) <= hitWindow) {
            foundHit = true;
            
            // Update hit status for this note
            setHitStatus(prev => ({
              ...prev,
              [fallingNote.id]: true
            }));
            
            // Check for perfect hit
            if (Math.abs(timeUntilHit) <= perfectHitWindow) {
              foundPerfectHit = true;
              // Update perfect hit status for this note
              setPerfectHits(prev => ({
                ...prev,
                [note]: true
              }));
              
              console.log(`PERFECT MANUAL HIT! Note ${note} hit at time: ${timeUntilHit.toFixed(3)}`);
            } else {
              console.log(`Manual hit! Note ${note} hit at time: ${timeUntilHit.toFixed(3)}`);
            }
          }
        }
      });
      
      // If no hit was found, clear the perfect hit status for this note
      if (!foundPerfectHit) {
        setPerfectHits(prev => {
          const newState = { ...prev };
          delete newState[note];
          return newState;
        });
      }
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
              const isActive = hitStatus[fallingNote.id];
              
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
              isPerfectHit={perfectHits[id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PianoKeyboard;
