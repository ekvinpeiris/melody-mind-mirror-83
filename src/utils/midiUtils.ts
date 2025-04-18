
import { Midi } from '@tonejs/midi';

export interface MidiNote {
  name: string;
  time: number;
  duration: number;
  velocity: number;
}

export interface Track {
  name: string;
  notes: MidiNote[];
}

export interface ParsedMidi {
  name: string;
  tracks: Track[];
  duration: number;
}

export const parseMidiFile = async (file: File): Promise<ParsedMidi> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        if (!e.target?.result) {
          throw new Error('Failed to read file');
        }
        
        const midi = new Midi(e.target.result as ArrayBuffer);
        
        const tracks: Track[] = midi.tracks.map(track => ({
          name: track.name || 'Unnamed Track',
          notes: track.notes.map(note => ({
            name: note.name,
            time: note.time,
            duration: note.duration,
            velocity: note.velocity
          }))
        }));
        
        resolve({
          name: midi.name || file.name,
          tracks,
          duration: midi.duration
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Helper to get all notes from all tracks
export const getAllNotes = (parsedMidi: ParsedMidi): MidiNote[] => {
  return parsedMidi.tracks.flatMap(track => track.notes);
};

// Convert note name (e.g., "C4") to our keyboard format
export const normalizeNoteName = (noteName: string): string => {
  return noteName.replace(/([A-G])([#b]?)(\d)/, '$1$2$3');
};
