import React, { useEffect, useRef, useState } from 'react';
import { toast } from "@/components/ui/sonner";
import * as Tone from 'tone';
import PianoKeyboard from '@/components/PianoKeyboard';
import TopBar from '@/components/TopBar';
import { parseMidiFile, getAllNotes, normalizeNoteName } from '@/utils/midiUtils';

interface FallingNote {
  id: string;
  note: string;
  duration: number;
  time: number;
}

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

  const handlePlayPause = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    if (isPlaying) {
      Tone.Transport.pause();
    } else {
      Tone.Transport.start("+0.5");
      
      if (!midiLoaded && !midiSequence.current) {
        playDemoPattern();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const playDemoPattern = () => {
    if (midiSequence.current) {
      midiSequence.current.dispose();
    }

    const startDelay = 5;
    const demoNotes = [
      { note: 'C4', time: startDelay + 0, duration: 0.5 },
      { note: 'D4', time: startDelay + 0.5, duration: 0.5 },
      { note: 'E4', time: startDelay + 1, duration: 0.5 },
      { note: 'F4', time: startDelay + 1.5, duration: 0.5 },
      { note: 'G4', time: startDelay + 2, duration: 0.5 },
      { note: 'A4', time: startDelay + 2.5, duration: 0.5 },
      { note: 'B4', time: startDelay + 3, duration: 0.5 },
      { note: 'C5', time: startDelay + 3.5, duration: 0.5 },
    ];

    notesRef.current = demoNotes.map((note, index) => ({
      id: `demo-${index}`,
      note: note.note,
      duration: note.duration,
      time: note.time
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
      }, demoNotes).start(0);
      
      midiSequence.current.loop = true;
      midiSequence.current.loopEnd = startDelay + 4;
    }
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
    
    try {
      handleStop();
      
      const parsedMidi = await parseMidiFile(file);
      setMidiName(parsedMidi.name);
      
      const allNotes = getAllNotes(parsedMidi);
      
      const startDelay = 5;
      const convertedNotes: FallingNote[] = allNotes.map((note, index) => ({
        id: `midi-${index}`,
        note: normalizeNoteName(note.name),
        duration: note.duration,
        time: note.time + startDelay
      }));
      
      notesRef.current = convertedNotes;
      setFallingNotes(convertedNotes);
      
      if (midiSequence.current) {
        midiSequence.current.dispose();
      }
      
      if (pianoSampler.current) {
        midiSequence.current = new Tone.Part((time, note) => {
          pianoSampler.current?.triggerAttackRelease(note.note, note.duration, time);
          
          Tone.Draw.schedule(() => {
            setActiveNotes(prev => [...prev, note.note]);
            
            setTimeout(() => {
              setActiveNotes(prev => prev.filter(n => n !== note.note));
            }, note.duration * 1000);
          }, time);
        }, convertedNotes.map(note => ({
          time: note.time,
          note: note.note,
          duration: note.duration
        }))).start(0);
      }
      
      setMidiLoaded(true);
      toast.success(`MIDI file "${parsedMidi.name}" loaded successfully!`);
      
    } catch (error) {
      console.error('Error parsing MIDI file:', error);
      toast.error('Failed to parse MIDI file. Is it a valid MIDI file?');
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
              fallingNotes={fallingNotes}
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
