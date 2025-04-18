
import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import * as Tone from 'tone';
import PianoKeyboard from '@/components/PianoKeyboard';
import { Play, Pause, Square, Upload } from 'lucide-react';

const Index = () => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [tempo, setTempo] = React.useState(120);
  const [activeNotes, setActiveNotes] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleStop = () => {
    Tone.Transport.stop();
    setIsPlaying(false);
    setActiveNotes([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // We'll implement MIDI file handling in the next iteration
    console.log('MIDI file selected:', file);
  };

  React.useEffect(() => {
    Tone.Transport.bpm.value = tempo;
    return () => {
      Tone.Transport.stop();
    };
  }, [tempo]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-8">Melody Mind Mirror</h1>
      
      <div className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg">
        {/* Piano visualization area */}
        <div className="h-60 bg-gray-700 rounded mb-4 overflow-hidden relative">
          {/* This is where falling notes will appear */}
        </div>
        
        {/* Piano keyboard */}
        <div className="mb-4 overflow-x-auto bg-gray-900 p-4 rounded-lg">
          <PianoKeyboard activeNotes={activeNotes} />
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
