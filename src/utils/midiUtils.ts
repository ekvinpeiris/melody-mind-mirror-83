
import { Midi } from '@tonejs/midi';

export interface MidiNote {
  name: string;
  time: number;
  duration: number;
  velocity: number;
  isDummy?: boolean; // Added for dummy notes
}

export const DUMMY_NOTE_NAME = "C-1"; // Out of standard MIDI range
export const MIN_GAP_THRESHOLD = 0.1; // Minimum gap in seconds to fill

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
  // Notes within a track are usually sorted, but flatMap can mix them if multiple tracks exist.
  // Sorting here ensures consistent order for subsequent processing.
  return parsedMidi.tracks.flatMap(track => track.notes).sort((a, b) => a.time - b.time);
};

export const insertDummyNotes = (notes: MidiNote[]): MidiNote[] => {
  if (notes.length === 0) {
    return [];
  }

  // Ensure notes are sorted by time as a prerequisite for gap detection.
  // getAllNotes should now handle this, but an explicit sort here is safer
  // if this function is ever called with unsorted notes from another source.
  const sortedNotes = [...notes].sort((a, b) => a.time - b.time);

  const notesWithDummies: MidiNote[] = [];
  let currentTime = 0;

  // 1. Handle gap at the beginning
  if (sortedNotes[0].time > MIN_GAP_THRESHOLD) {
    notesWithDummies.push({
      name: DUMMY_NOTE_NAME,
      time: 0,
      duration: sortedNotes[0].time,
      velocity: 0,
      isDummy: true,
    });
  }
  currentTime = sortedNotes[0].time; // Though this currentTime isn't strictly used for dummy note creation time.

  // 2. Iterate and handle gaps between notes
  for (let i = 0; i < sortedNotes.length; i++) {
    const currentNote = sortedNotes[i];
    notesWithDummies.push(currentNote); // Add the real note

    const currentNoteEndTime = currentNote.time + currentNote.duration;

    if (i < sortedNotes.length - 1) {
      const nextNote = sortedNotes[i + 1];
      const gapDuration = nextNote.time - currentNoteEndTime;

      if (gapDuration > MIN_GAP_THRESHOLD) {
        notesWithDummies.push({
          name: DUMMY_NOTE_NAME,
          time: currentNoteEndTime,
          duration: gapDuration,
          velocity: 0,
          isDummy: true,
        });
      }
    }
    // No explicit handling for gap after the last note as per current requirements.
  }

  return notesWithDummies;
};

// Convert note name (e.g., "C4") to our keyboard format
export const normalizeNoteName = (noteName: string): string => {
  return noteName.replace(/([A-G])([#b]?)(\d)/, '$1$2$3');
};
