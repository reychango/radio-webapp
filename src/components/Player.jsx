import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const Player = ({ isPlaying, onPlayPause, volume, onVolumeChange }) => {
    return (
        <div className="flex flex-col items-center gap-4 w-full px-4">
            {/* Play/Pause Button */}
            <button
                onClick={onPlayPause}
                className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(158,42,43,0.6)] cursor-pointer"
            >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-3 w-full max-w-[200px] mt-2">
                <button onClick={() => onVolumeChange(volume === 0 ? 0.5 : 0)} className="text-[var(--color-secondary)] hover:text-white">
                    {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-[var(--color-glass-border)] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[var(--color-secondary)] [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                />
            </div>
        </div>
    );
};

export default Player;
