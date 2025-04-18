
import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import * as Tone from 'tone';
import PianoKeyboard from '@/components/PianoKeyboard';

const Index = () => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [tempo, setTempo] = React.useState(120);
  const [activeNotes, setActiveNotes] = React.useState<string[]>([]);

  const handlePlayPause = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    if (isPlaying) {
      Tone.Transport.pause();
    } else {
      Tone.Transport.start();
    }
    setIsPlaying(!isPlaying);
  };

  React.useEffect(() => {
    // Set the initial tempo
    Tone.Transport.bpm.value = tempo;
    
    // Cleanup on component unmount
    return () => {
      Tone.Transport.stop();
    };
  }, []);

  // Update tempo when slider changes
  React.useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-8">Melody Mind Mirror</h1>
      
      <div className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg">
        {/* Piano visualization area */}
        <div className="h-60 bg-gray-700 rounded mb-4 flex items-end justify-center overflow-hidden">
          <div className="text-center p-4">
            Note visualization will appear here
          </div>
        </div>
        
        {/* Piano keyboard */}
        <div className="mb-4 overflow-x-auto">
          <PianoKeyboard activeNotes={activeNotes} />
        </div>
        
        {/* Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Button 
              onClick={handlePlayPause}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            
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
      
      <div className="mt-8 text-sm text-gray-400">
        <p>Use this application to learn and practice music!</p>
      </div>
    </div>
  );
};

export default Index;
