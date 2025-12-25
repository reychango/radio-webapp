import { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import CardPlayer from './components/CardPlayer';

const BASE_URL = "http://uk2freenew.listen2myradio.com:10718";
const STREAM_URL_BASE = "http://88.150.230.110:10718/stream";
const PROXY_URL = "/api/stream";
const STATS_URL = "/api/metadata";

function RadioApp() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [metadata, setMetadata] = useState({ title: "Sintonizando...", artist: "La Espárrago Rock" });
  const [history, setHistory] = useState([]);
  const [coverUrl, setCoverUrl] = useState("/logo.png");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStalled, setIsStalled] = useState(false);

  const audioRef = useRef(null);
  const latestMetadataRef = useRef(metadata);
  const latestCoverRef = useRef(coverUrl);
  const latestVolumeRef = useRef(volume);

  // Initialize audio on mount
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  // Network state detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync refs
  useEffect(() => { latestMetadataRef.current = metadata; }, [metadata]);
  useEffect(() => { latestCoverRef.current = coverUrl; }, [coverUrl]);
  useEffect(() => {
    latestVolumeRef.current = volume;
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Fetch Cover Art
  useEffect(() => {
    if (!metadata.artist || metadata.artist === "La Espárrago Rock") {
      setCoverUrl("/logo.png");
      return;
    }
    const controller = new AbortController();
    const fetchCover = async () => {
      try {
        const query = encodeURIComponent(`${metadata.artist} ${metadata.title}`);
        const response = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`, { signal: controller.signal });
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setCoverUrl(data.results[0].artworkUrl100.replace('100x100bb', '600x600bb'));
        } else {
          setCoverUrl("/logo.png");
        }
      } catch (e) {
        if (e.name !== 'AbortError') setCoverUrl("/logo.png");
      }
    };
    fetchCover();
    return () => controller.abort();
  }, [metadata.artist, metadata.title]);

  const metadataControllerRef = useRef(null);

  // Metadata polling
  useEffect(() => {
    let interval;
    const fetchMetadata = async () => {
      if (!isOnline) return;
      if (metadataControllerRef.current) metadataControllerRef.current.abort();
      const controller = new AbortController();
      metadataControllerRef.current = controller;

      try {
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        // We use our local API which is much more reliable
        const res = await fetch(`${STATS_URL}?t=${Date.now()}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res && res.ok) {
          const data = await res.json();
          const songTitle = data?.songtitle;
          if (songTitle) {
            const raw = songTitle || "";
            const parts = raw.split(' - ');
            const artist = parts.length >= 2 ? parts[0].trim() : "La Espárrago Rock";
            const title = parts.length >= 2 ? parts.slice(1).join(' - ').trim() : raw.trim();

            if (latestMetadataRef.current.title !== title) {
              if (latestMetadataRef.current.title !== "Sintonizando...") {
                setHistory(prev => {
                  if (prev.some(s => s.title === title)) return prev;
                  return [{ artist: latestMetadataRef.current.artist, title: latestMetadataRef.current.title, cover: latestCoverRef.current }, ...prev].slice(0, 5);
                });
              }
              setMetadata({ artist, title: title.includes("stats?") ? "Radio en Vivo" : title });
            }
          }
        }
      } catch (e) { } finally {
        if (metadataControllerRef.current === controller) metadataControllerRef.current = null;
      }
    };

    fetchMetadata();
    interval = setInterval(fetchMetadata, 15000);
    return () => {
      clearInterval(interval);
      if (metadataControllerRef.current) metadataControllerRef.current.abort();
    };
  }, [isOnline]);

  const setupAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
        // Force complete cleanup
        audioRef.current.onplay = null;
        audioRef.current.onpause = null;
        audioRef.current.onerror = null;
        audioRef.current.onended = null;
      } catch (e) { }
    }

    console.log("🛠️ Re-conectando (V19-SAVIOR)...");
    const newAudio = new Audio();
    newAudio.volume = latestVolumeRef.current;
    // For same-origin proxy, we don't need crossOrigin which can be stricter
    // newAudio.crossOrigin = "anonymous";

    newAudio.addEventListener('playing', () => {
      console.log("▶️ Música sonando");
      setIsStalled(false);
    });

    newAudio.addEventListener('waiting', () => setIsStalled(true));
    newAudio.addEventListener('stalled', () => {
      console.warn("⚠️ Stream buffering...");
      // NO reiniciamos el audio aquí, dejamos que el navegador gestione su buffer
    });

    newAudio.addEventListener('ended', () => {
      console.warn("🏁 Stream finalizado, re-intentando en 5s...");
      setTimeout(setupAudio, 5000);
    });

    newAudio.addEventListener('error', (e) => {
      console.error("❌ Error de audio (esperando 10s para re-intentar)...");
      if (isPlaying) setTimeout(setupAudio, 10000); // 10s de calma
    });

    audioRef.current = newAudio;

    if (isPlaying) {
      // Usamos el proxy (Vercel o Cloudflare Worker)
      const proxyUrl = `${PROXY_URL}?v=${Date.now()}`;
      newAudio.src = proxyUrl;
      newAudio.play().catch(() => {
        // Silently retry on next watchdog
      });
    }
  };

  // Lifecycle
  useEffect(() => {
    let lastTime = -1;
    let sameTimeCount = 0;

    let progressInterval = setInterval(() => {
      if (isPlaying && isOnline && audioRef.current) {
        const currentTime = audioRef.current.currentTime;

        if (currentTime === lastTime && !audioRef.current.paused) {
          sameTimeCount++;
          // Si pasan 5-6 segundos sin avance real, reiniciamos
          if (sameTimeCount >= 2) {
            console.warn("🚀 Watchdog (V19): Silencio total, reiniciando flujo...");
            sameTimeCount = 0;
            setupAudio();
          }
        } else {
          sameTimeCount = 0;
        }

        lastTime = currentTime;
      }
    }, 40000); // 40s para dar estabilidad absoluta al buffer

    return () => clearInterval(progressInterval);
  }, [isPlaying, isOnline, isStalled]);

  // Playback Control
  useEffect(() => {
    if (isPlaying && isOnline) {
      setupAudio();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, isOnline]);

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
            isStalled={isStalled}
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

      {/* Ad Placement */}
      <section className="ad-section">
        <div className="ad-wrapper">
          <div className="ad-label">Publicidad</div>
          {/* Aquí puedes pegar el código de AdSense o Monetag una vez lo tengas */}
          <div style={{ fontSize: '0.8rem', opacity: 0.3, fontStyle: 'italic' }}>Espacio reservado para anunciantes</div>
        </div>
      </section>

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
