
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Upload, Music } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TopBarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onFileClick: () => void;
  midiName: string | null;
}

const TopBar = ({ isPlaying, onPlayPause, onStop, onFileClick, midiName }: TopBarProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-2 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-white font-semibold text-lg">Melody Mind Mirror</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button 
              onClick={onPlayPause}
              variant="default"
              size="icon"
              className={cn(
                "transition-all duration-200",
                isPlaying ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button 
              onClick={onStop}
              variant="secondary"
              size="icon"
              className="hover:bg-gray-700"
            >
              <Square className="h-4 w-4" />
            </Button>

            <Button
              onClick={onFileClick}
              variant="outline"
              className="flex gap-2 hover:bg-gray-700"
            >
              <Upload className="h-4 w-4" />
              Upload MIDI
            </Button>
          </div>

          {midiName && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded text-sm text-gray-300">
              <Music className="h-4 w-4" />
              <span className="truncate max-w-[200px]">{midiName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
