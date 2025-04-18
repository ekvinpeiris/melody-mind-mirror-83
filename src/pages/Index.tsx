
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/sonner";
import * as Tone from 'tone';
import PianoKeyboard from '@/components/PianoKeyboard';
import { Play, Pause, Square, Upload, Music } from 'lucide-react';
import { parseMidiFile, getAllNotes, normalizeNoteName } from '@/utils/midiUtils';

interface FallingNote {
  id: string;
  note: string;
  duration: number;
  time: number;
}

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [midiLoaded, setMidiLoaded] = useState(false);
  const [midiName, setMidiName] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const midiSequence = useRef<Tone.Part | null>(null);
  const notesRef = useRef<FallingNote[]>([]);

  // Effect to update Tone.js transport tempo
  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
    return () => {
      Tone.Transport.stop();
      if (midiSequence.current) {
        midiSequence.current.dispose();
      }
    };
  }, [tempo]);

  // Handle play/pause
  const handlePlayPause = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    if (isPlaying) {
      Tone.Transport.pause();
    } else {
      Tone.Transport.start();
      
      // If we have midi loaded, don't need to do anything else
      if (midiLoaded && midiSequence.current) {
        // Already handled by the MIDI sequence
      } else {
        // Simple demo pattern if no MIDI is loaded
        playDemoPattern();
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Play a simple demo pattern if no MIDI is loaded
  const playDemoPattern = () => {
    // Clear any existing sequence
    if (midiSequence.current) {
      midiSequence.current.dispose();
    }

    // Create a simple C major scale
    const demoNotes = [
      { note: 'C4', time: 0, duration: 0.5 },
      { note: 'D4', time: 0.5, duration: 0.5 },
      { note: 'E4', time: 1, duration: 0.5 },
      { note: 'F4', time: 1.5, duration: 0.5 },
      { note: 'G4', time: 2, duration: 0.5 },
      { note: 'A4', time: 2.5, duration: 0.5 },
      { note: 'B4', time: 3, duration: 0.5 },
      { note: 'C5', time: 3.5, duration: 0.5 },
    ];

    // Add the demo notes for visualization
    setFallingNotes(demoNotes.map((note, index) => ({
      id: `demo-${index}`,
      note: note.note,
      duration: note.duration,
      time: note.time
    })));

    // Create a Tone.js sequence to play the notes
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    
    midiSequence.current = new Tone.Part((time, note) => {
      synth.triggerAttackRelease(note.note, note.duration, time);
      
      // Update active notes for highlighting on the keyboard
      Tone.Draw.schedule(() => {
        setActiveNotes(prev => [...prev, note.note]);
        
        // Remove the note after its duration
        setTimeout(() => {
          setActiveNotes(prev => prev.filter(n => n !== note.note));
        }, note.duration * 1000);
      }, time);
    }, demoNotes).start(0);
    
    // Loop the pattern
    midiSequence.current.loop = true;
    midiSequence.current.loopEnd = 4;
  };

  // Handle stop
  const handleStop = () => {
    Tone.Transport.stop();
    if (midiSequence.current) {
      midiSequence.current.stop();
    }
    setIsPlaying(false);
    setActiveNotes([]);
    setFallingNotes([]);
  };

  // Handle MIDI file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Reset state
      handleStop();
      
      // Parse the MIDI file
      const parsedMidi = await parseMidiFile(file);
      setMidiName(parsedMidi.name);
      
      // Get all notes from all tracks
      const allNotes = getAllNotes(parsedMidi);
      
      // Convert to our format and update state
      const convertedNotes: FallingNote[] = allNotes.map((note, index) => ({
        id: `midi-${index}`,
        note: normalizeNoteName(note.name),
        duration: note.duration,
        time: note.time
      }));
      
      notesRef.current = convertedNotes;
      setFallingNotes(convertedNotes);
      
      // Create a Tone.js sequence
      const synth = new Tone.PolySynth(Tone.Synth).toDestination();
      
      if (midiSequence.current) {
        midiSequence.current.dispose();
      }
      
      midiSequence.current = new Tone.Part((time, note) => {
        synth.triggerAttackRelease(note.note, note.duration, time);
        
        // Update active notes for highlighting on the keyboard
        Tone.Draw.schedule(() => {
          setActiveNotes(prev => [...prev, note.note]);
          
          // Remove the note after its duration
          setTimeout(() => {
            setActiveNotes(prev => prev.filter(n => n !== note.note));
          }, note.duration * 1000);
        }, time);
      }, convertedNotes.map(note => ({
        time: note.time,
        note: note.note,
        duration: note.duration
      }))).start(0);
      
      setMidiLoaded(true);
      toast.success(`MIDI file "${parsedMidi.name}" loaded successfully!`);
      
    } catch (error) {
      console.error('Error parsing MIDI file:', error);
      toast.error('Failed to parse MIDI file. Is it a valid MIDI file?');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-8">Melody Mind Mirror</h1>
      
      <div className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg">
        {/* Piano visualization area */}
        <div className="h-60 bg-gray-700 rounded mb-4 overflow-hidden relative">
          <PianoKeyboard 
            activeNotes={activeNotes} 
            fallingNotes={fallingNotes}
            isPlaying={isPlaying} 
          />
        </div>
        
        {/* Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                onClick={handlePlayPause}
                variant="default"
                size="icon"
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button 
                onClick={handleStop}
                variant="secondary"
                size="icon"
              >
                <Square className="h-4 w-4" />
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload MIDI
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".mid,.midi"
                onChange={handleFileUpload}
                className="hidden"
              />

              {midiLoaded && midiName && (
                <div className="flex items-center gap-2 ml-2 px-3 py-1 bg-gray-700 rounded text-sm">
                  <Music className="h-4 w-4" />
                  <span className="truncate max-w-[120px]">{midiName}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm">Tempo: {tempo} BPM</span>
              <div className="w-40">
                <Slider
                  value={[tempo]}
                  min={40}
                  max={240}
                  step={1}
                  onValueChange={(value) => setTempo(value[0])}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
