import React, { useEffect, useRef, useState } from 'react';
import { toast } from "@/components/ui/sonner";
import * as Tone from 'tone';
import PianoKeyboard from '@/components/PianoKeyboard';
import TopBar from '@/components/TopBar';
import { parseMidiFile, getAllNotes, normalizeNoteName, insertDummyNotes, MidiNote } from '@/utils/midiUtils'; // Added insertDummyNotes, MidiNote
import { generateProceduralMidiNotes } from '@/utils/midiNoteGenerator';

const PROCESSED_MIDI_STORAGE_PREFIX = 'processedMidi_';

interface FallingNote {
  id: string;
  note: string;
  duration: number;
  time: number;
  isDummy?: boolean; // Added to accommodate dummy notes
}

// Global consistent delay for both audio and visuals
const GLOBAL_START_DELAY = 0.5;

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [midiLoaded, setMidiLoaded] = useState(false);
  const [midiName, setMidiName] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const midiSequence = useRef<Tone.Part | null>(null);
  const notesRef = useRef<FallingNote[]>([]);
  const pianoSampler = useRef<Tone.Sampler | null>(null);

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
    
    pianoSampler.current = sampler;
    
    return () => {
      if (pianoSampler.current) {
        pianoSampler.current.dispose();
      }
    };
  }, []);

  const playProceduralPattern = () => {
    if (midiSequence.current) {
      midiSequence.current.dispose();
    }

    const proceduralNotes = generateProceduralMidiNotes();
    
    notesRef.current = proceduralNotes.map((note, index) => ({
      id: `procedural-${index}`,
      note: note.name,
      duration: note.duration,
      time: note.time + GLOBAL_START_DELAY
    }));
    
    setFallingNotes(notesRef.current);

    if (pianoSampler.current) {
      midiSequence.current = new Tone.Part((time, note) => {
        pianoSampler.current?.triggerAttackRelease(note.note, note.duration, time);
        
        Tone.Draw.schedule(() => {
          setActiveNotes(prev => [...prev, note.note]);
          
          setTimeout(() => {
            setActiveNotes(prev => prev.filter(n => n !== note.note));
          }, note.duration * 1000);
        }, time);
      }, proceduralNotes.map(note => ({
        time: note.time + GLOBAL_START_DELAY,
        note: note.name,
        duration: note.duration
      }))).start(0);
      
      midiSequence.current.loop = true;
      midiSequence.current.loopEnd = GLOBAL_START_DELAY + (proceduralNotes.length * 0.5);
    }
  };

  const handlePlayPause = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    if (isPlaying) {
      Tone.Transport.pause();
    } else {
      // Start transport with consistent global delay
      Tone.Transport.start(`+${GLOBAL_START_DELAY}`);
      
      if (!midiLoaded && !midiSequence.current) {
        playProceduralPattern();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    Tone.Transport.stop();
    if (midiSequence.current) {
      midiSequence.current.stop();
    }
    setIsPlaying(false);
    setActiveNotes([]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    handleStop(); // Stop any current playback

    const storageKey = PROCESSED_MIDI_STORAGE_PREFIX + file.name;

    // 1. Attempt to load from Local Storage
    try {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        console.log('Found processed MIDI data in Local Storage for:', file.name);
        const loadedRawNotes: MidiNote[] = JSON.parse(storedData); // MidiNote from midiUtils

        if (Array.isArray(loadedRawNotes)) {
          // Map to FallingNote structure for the state
          const loadedFallingNotesData = loadedRawNotes.map((note, index) => ({
            id: `midi-loaded-${index}-${note.isDummy ? 'dummy' : 'real'}`,
            note: note.isDummy ? note.name : normalizeNoteName(note.name),
            duration: note.duration,
            time: note.time + GLOBAL_START_DELAY, // Apply global delay consistently
            isDummy: note.isDummy,
          }));

          notesRef.current = loadedFallingNotesData;
          setFallingNotes(loadedFallingNotesData);
          setMidiName(file.name);

          if (midiSequence.current) {
            midiSequence.current.dispose();
          }

          if (pianoSampler.current) {
            const playableNotes = loadedRawNotes
              .filter(note => !note.isDummy)
              .map(note => ({
                time: note.time + GLOBAL_START_DELAY, // Apply global delay
                note: normalizeNoteName(note.name),
                duration: note.duration,
              }));
            
            midiSequence.current = new Tone.Part((time, noteEvent) => {
              pianoSampler.current?.triggerAttackRelease(noteEvent.note, noteEvent.duration, time);
              Tone.Draw.schedule(() => {
                setActiveNotes(prev => [...prev, noteEvent.note]);
                setTimeout(() => setActiveNotes(prev => prev.filter(n => n !== noteEvent.note)), noteEvent.duration * 1000);
              }, time);
            }, playableNotes).start(0);
          }

          setMidiLoaded(true);
          toast.info(`Loaded pre-processed MIDI: "${file.name}" from cache.`);
          return; // Skip normal processing
        } else {
          console.warn('Invalid data structure in Local Storage for:', file.name);
          localStorage.removeItem(storageKey); // Clean up invalid data
        }
      }
    } catch (error) {
      console.warn('Failed to load or parse processed MIDI from Local Storage:', error);
      if (storageKey) localStorage.removeItem(storageKey); // Clean up potentially corrupted data
    }

    // 2. If not loaded from Local Storage, proceed with normal parsing and processing
    try {
      console.log('Parsing MIDI file:', file.name);
      const parsedMidi = await parseMidiFile(file);
      setMidiName(parsedMidi.name);
      
      const allNotesFromMidi = getAllNotes(parsedMidi);
      const notesWithDummies = insertDummyNotes(allNotesFromMidi); // This is of type MidiNote[]

      // Save to Local Storage
      try {
        const jsonData = JSON.stringify(notesWithDummies);
        localStorage.setItem(storageKey, jsonData);
        console.log('Saved processed MIDI data to Local Storage for:', file.name);
      } catch (storageError) {
        console.warn('Could not save processed MIDI to Local Storage:', storageError);
      }
      
      const fallingNotesData = notesWithDummies.map((note, index) => ({
        id: `midi-parsed-${index}-${note.isDummy ? 'dummy' : 'real'}`,
        note: note.isDummy ? note.name : normalizeNoteName(note.name),
        duration: note.duration,
        time: note.time + GLOBAL_START_DELAY,
        isDummy: note.isDummy,
      }));
      
      notesRef.current = fallingNotesData;
      setFallingNotes(fallingNotesData);
      
      if (midiSequence.current) {
        midiSequence.current.dispose();
      }
      
      if (pianoSampler.current) {
        const playableNotes = notesWithDummies
          .filter(note => !note.isDummy)
          .map(note => ({
            time: note.time + GLOBAL_START_DELAY,
            note: normalizeNoteName(note.name),
            duration: note.duration,
          }));

        midiSequence.current = new Tone.Part((time, noteEvent) => {
          pianoSampler.current?.triggerAttackRelease(noteEvent.note, noteEvent.duration, time);
          Tone.Draw.schedule(() => {
            setActiveNotes(prev => [...prev, noteEvent.note]);
            setTimeout(() => setActiveNotes(prev => prev.filter(n => n !== noteEvent.note)), noteEvent.duration * 1000);
          }, time);
        }, playableNotes).start(0);
      }
      
      setMidiLoaded(true);
      toast.success(`MIDI file "${parsedMidi.name}" loaded and processed successfully!`);
      
    } catch (error) {
      console.error('Error processing MIDI file:', error);
      toast.error('Failed to process MIDI file. Is it a valid MIDI file?');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <TopBar
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onStop={handleStop}
        onFileClick={() => fileInputRef.current?.click()}
        midiName={midiName}
      />
      
      <div className="pt-16">
        <div className="w-full max-w-7xl mx-auto p-4">
          <div className="w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <PianoKeyboard 
              activeNotes={activeNotes} 
              fallingNotes={fallingNotes} // Pass directly, as `fallingNotes` state now matches the extended interface
              isPlaying={isPlaying} 
            />
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".mid,.midi"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default Index;
