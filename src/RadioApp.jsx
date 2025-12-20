import { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import CardPlayer from './components/CardPlayer';

const BASE_URL = "http://uk2freenew.listen2myradio.com:10718";
const STREAM_URL = `${BASE_URL}/;`;
const PROXY_URL = "https://api.cors.lol/?url=";
const STATS_URL = `${BASE_URL}/stats?sid=1&json=1`;

function RadioApp() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [metadata, setMetadata] = useState({ title: "Sintonizando...", artist: "La Espárrago Rock" });
  const [history, setHistory] = useState([]);
  const [coverUrl, setCoverUrl] = useState("/logo.png");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const audioRef = useRef(new Audio());
  const latestMetadataRef = useRef(metadata);
  const latestCoverRef = useRef(coverUrl);

  // Apply theme to body
  useEffect(() => {
    if (!isDarkMode) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [isDarkMode]);

  // Sync refs
  useEffect(() => { latestMetadataRef.current = metadata; }, [metadata]);
  useEffect(() => { latestCoverRef.current = coverUrl; }, [coverUrl]);

  // Fetch Cover Art
  useEffect(() => {
    if (!metadata.artist || metadata.artist === "La Espárrago Rock") {
      setCoverUrl("/logo.png");
      return;
    }
    const fetchCover = async () => {
      try {
        const query = encodeURIComponent(`${metadata.artist} ${metadata.title}`);
        const response = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setCoverUrl(data.results[0].artworkUrl100.replace('100x100bb', '600x600bb'));
        } else {
          setCoverUrl("/logo.png");
        }
      } catch (e) {
        setCoverUrl("/logo.png");
      }
    };
    fetchCover();
  }, [metadata.artist, metadata.title]);

  // JSONP Metadata polling
  useEffect(() => {
    const fetchMetadata = () => {
      // Define global callback if it doesn't exist
      window.shoutcastCallback = (data) => {
        if (data && data.songtitle) {
          const parts = data.songtitle.split(' - ');
          let artist = parts.length >= 2 ? parts[0].trim() : "La Espárrago Rock";
          let title = parts.length >= 2 ? parts.slice(1).join(' - ').trim() : data.songtitle.trim();

          const current = latestMetadataRef.current;
          if (current.title !== title) {
            // Add prev to history before updating metadata
            if (current.title !== "Sintonizando...") {
              setHistory(prevHistory => {
                const isDuplicate = prevHistory.some(song => song.title === current.title);
                if (!isDuplicate) {
                  return [{ artist: current.artist, title: current.title, cover: latestCoverRef.current }, ...prevHistory].slice(0, 5);
                }
                return prevHistory;
              });
            }
            setMetadata({ artist, title });
          }
        }
        // Cleanup script tag after execution
        const script = document.getElementById('shoutcast-jsonp');
        if (script) script.remove();
      };

      // Create and inject script
      const script = document.createElement('script');
      script.id = 'shoutcast-jsonp';
      script.src = `${STATS_URL}&callback=shoutcastCallback&t=${Date.now()}`;
      document.body.appendChild(script);
    };

    fetchMetadata();
    const interval = setInterval(fetchMetadata, 8000); // 8s for snappier updates
    return () => {
      clearInterval(interval);
      delete window.shoutcastCallback;
    };
  }, []);

  // Audio Initialization & Global Listeners
  useEffect(() => {
    const audio = audioRef.current;
    audio.crossOrigin = "anonymous"; // Server supports it (Access-Control-Allow-Origin: *)

    // Squelch noisy logs, only log true failures
    const handleError = (e) => {
      if (audio.error && audio.error.code !== 4) { // 4 often means "not playing yet" or manually stopped
        console.error("Audio internal error:", audio.error);
      }
    };

    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Playback Control
  useEffect(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      // Using semicolon-only URL which is most compatible
      const playUrl = `${STREAM_URL}?t=${Date.now()}`;
      audio.src = playUrl;
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      audio.src = "";
      audio.load();
    }
  }, [isPlaying]);

  // Volume Control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleStop = () => {
    setIsPlaying(false);
  };

  return (
    <div className="container fade-in">

      {/* Logo Header */}
      <header className="header" style={{ marginBottom: '1.5rem' }}>
        <button
          className="theme-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <img
          src="/logo.png"
          style={{ height: '200px', width: 'auto', borderRadius: '1.5rem', display: 'block', margin: '0 auto' }}
          className="logo-large"
          alt="Logo"
        />
      </header>

      {/* Widget Card */}
      <main className="card">

        {/* Player Section */}
        <div className="player-section">
          {/* Cover Art Left */}
          <div className="cover-wrapper">
            <img src={coverUrl} className="cover-img" alt="Cover" />
          </div>

          {/* Controls Right */}
          <CardPlayer
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onStop={handleStop}
            volume={volume}
            onVolumeChange={(v) => setVolume(v)}
            metadata={metadata}
          />
        </div>

        {/* History Section */}
        <section className="history-section">
          <div className="section-title">
            <span>Historial</span>
            <span style={{ color: '#3b82f6', fontSize: '0.75rem' }}>EN DIRECTO</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {history.map((song, i) => (
              <div key={i} className="history-item">
                <div className="item-index" style={{ padding: 0, overflow: 'hidden' }}>
                  <img
                    src={song.cover || "/logo.png"}
                    alt="Thumbnail"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => e.target.src = "/logo.png"}
                  />
                </div>
                <div className="item-info">
                  <div className="item-title">{song.title}</div>
                  <div className="item-artist">{song.artist}</div>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem', fontStyle: 'italic', fontSize: '0.875rem' }}>Buscando canciones...</p>
            )}
          </div>
        </section>

      </main>

      {/* Friends Links */}
      <section className="friends-links">
        <a href="https://www.reychango.es" target="_blank" rel="noopener noreferrer" className="friend-link">
          WWW.REYCHANGO.ES
        </a>
        <a href="https://www.huetortajar.com" target="_blank" rel="noopener noreferrer" className="friend-link">
          WWW.HUETORTAJAR.COM
        </a>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: '0.5rem', opacity: 0.3, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em' }}>
        &copy; {new Date().getFullYear()} LA ESPÁRRAGO ROCK
      </footer>

    </div>
  );
}

export default RadioApp;
