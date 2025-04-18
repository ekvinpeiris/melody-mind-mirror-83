
import { MidiNote } from './midiUtils';

// Different scales and modes for procedural generation
export const SCALES = {
  MAJOR: [0, 2, 4, 5, 7, 9, 11],
  MINOR: [0, 2, 3, 5, 7, 8, 10],
  PENTATONIC: [0, 2, 4, 7, 9],
  BLUES: [0, 3, 5, 6, 7, 10]
};

export interface NoteGenerationOptions {
  scale?: number[];
  baseOctave?: number;
  notesCount?: number;
  randomize?: boolean;
}

export function generateProceduralMidiNotes(options: NoteGenerationOptions = {}): MidiNote[] {
  const {
    scale = SCALES.MAJOR,
    baseOctave = 4,
    notesCount = 8,
    randomize = false
  } = options;

  const notes: MidiNote[] = [];
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  for (let i = 0; i < notesCount; i++) {
    const scaleIndex = randomize 
      ? Math.floor(Math.random() * scale.length) 
      : i % scale.length;

    const midiPitch = (baseOctave * 12) + scale[scaleIndex];
    const noteName = noteNames[midiPitch % 12] + Math.floor(midiPitch / 12);

    notes.push({
      name: noteName,
      time: i * 0.5,  // 0.5 second interval between notes
      duration: 0.4,  // Each note plays for 0.4 seconds
      velocity: randomize 
        ? Math.random() * 0.8 + 0.2  // Random velocity between 0.2 and 1
        : 0.7
    });
  }

  return notes;
}

// Example usage for generating different types of note sequences
export const generateSequences = {
  majorScale: () => generateProceduralMidiNotes(),
  minorScale: () => generateProceduralMidiNotes({ scale: SCALES.MINOR }),
  randomBlues: () => generateProceduralMidiNotes({ 
    scale: SCALES.BLUES, 
    randomize: true 
  })
};
