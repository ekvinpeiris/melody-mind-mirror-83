
import React from 'react';
import PianoKey from './PianoKey';
import * as Tone from 'tone';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [3, 4, 5]; // Middle 3 octaves

type PianoKeyboardProps = {
  activeNotes?: string[];
};

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ activeNotes = [] }) => {
  const synth = React.useRef<Tone.PolySynth | null>(null);
  
  React.useEffect(() => {
    // Initialize synth
    synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
    
    return () => {
      // Cleanup synth on unmount
      if (synth.current) {
        synth.current.dispose();
      }
    };
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
    <div className="relative flex justify-center overflow-x-auto py-4">
      <div className="flex">
        {allNotes.map(({ id, isBlackKey }) => (
          <PianoKey
            key={id}
            note={id}
            isBlackKey={isBlackKey}
            isPlaying={activeNotes.includes(id)}
            onClick={() => playNote(id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PianoKeyboard;
