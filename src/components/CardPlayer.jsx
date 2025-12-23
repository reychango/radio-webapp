import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';

const CardPlayer = ({ isPlaying, isStalled, onPlayPause, onStop, volume, onVolumeChange, metadata }) => {
    return (
        <div className="controls-wrapper">

            {/* Title & Artist */}
            <div>
                {isStalled ? (
                    <div className="status-badge" style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        RECUPERANDO...
                    </div>
                ) : null}
                <h2 className="title">{metadata.title}</h2>
                <p className="artist">{metadata.artist}</p>
            </div>

            {/* Vumeter Visualization */}
            <div className={`vumeter-container ${isPlaying ? 'vumeter-active' : ''}`} style={{ marginTop: '1.5rem' }}>
                {[...Array(24)].map((_, i) => (
                    <div key={i} className="vumeter-bar"></div>
                ))}
            </div>

            {/* Buttons: Play/Pause and Stop Only */}
            <div className="buttons-row" style={{ justifyContent: 'center', gap: '2rem' }}>
                <button onClick={onStop} className="small-btn hover:text-red-500" title="Detener">
                    <Square size={32} fill="currentColor" />
                </button>

                <button onClick={onPlayPause} className="play-btn shadow-lg" title={isPlaying ? "Pausar" : "Reproducir"}>
                    {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>
            </div>

            {/* Volume */}
            <div className="volume-area">
                <button onClick={() => onVolumeChange(volume === 0 ? 0.5 : 0)} className="small-btn">
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="volume-slider"
                />
            </div>

        </div>
    );
};

export default CardPlayer;
