import { useState, useEffect } from 'react';
import { Sun, Moon, ExternalLink } from 'lucide-react';

const OFFICIAL_PLAYER_URL = "https://esparragorock.radio12345.com";
const CODETABS_METADATA_URL = "https://api.codetabs.com/v1/proxy?quest=http://88.150.230.110:10718/7.html";

function RadioApp() {
    const [metadata, setMetadata] = useState({ title: "Cargando...", artist: "La Espárrago Rock" });
    const [coverUrl, setCoverUrl] = useState("/logo.png");
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showPlayer, setShowPlayer] = useState(false);

    // Fetch cover art from iTunes
    useEffect(() => {
        if (metadata.title === "Cargando..." || metadata.title === "Sintonizando...") return;

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

    // Metadata polling via Codetabs
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await fetch(`${CODETABS_METADATA_URL}&t=${Date.now()}`);
                if (res.ok) {
                    const html = await res.text();
                    const bodyMatch = html.match(/<body>(.*)<\/body>/i);
                    const rawData = bodyMatch ? bodyMatch[1] : html;
                    const parts = rawData.split(',');
                    const songTitle = parts.length >= 7 ? parts.slice(6).join(',') : "La Espárrago Rock";

                    if (songTitle) {
                        const titleParts = songTitle.split(' - ');
                        const artist = titleParts.length >= 2 ? titleParts[0].trim() : "La Espárrago Rock";
                        const title = titleParts.length >= 2 ? titleParts.slice(1).join(' - ').trim() : songTitle.trim();
                        setMetadata({ artist, title });
                    }
                }
            } catch (e) { }
        };

        fetchMetadata();
        const interval = setInterval(fetchMetadata, 15000);
        return () => clearInterval(interval);
    }, []);

    // Dark mode toggle
    useEffect(() => {
        document.body.classList.toggle('light-mode', !isDarkMode);
    }, [isDarkMode]);

    return (
        <div className="app-container">
            {/* Header */}
            <header className="header">
                <img src="/logo.png" alt="La Espárrago Rock" className="header-logo" />
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="theme-toggle">
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <div className="player-card">
                    {/* Cover Art */}
                    <div className="cover-container">
                        <img src={coverUrl} alt="Cover" className="cover-art" />
                    </div>

                    {/* Info */}
                    <div className="player-info">
                        <h2 className="song-title">{metadata.title}</h2>
                        <p className="artist-name">{metadata.artist}</p>

                        {/* Play Button - Opens embedded player */}
                        {!showPlayer ? (
                            <button
                                className="play-button-large"
                                onClick={() => setShowPlayer(true)}
                            >
                                ▶ Reproducir Radio
                            </button>
                        ) : (
                            <div className="embedded-player">
                                <iframe
                                    src={OFFICIAL_PLAYER_URL}
                                    title="La Espárrago Rock Player"
                                    className="player-iframe"
                                    allow="autoplay"
                                />
                                <button
                                    className="close-player-btn"
                                    onClick={() => setShowPlayer(false)}
                                >
                                    ✕ Cerrar reproductor
                                </button>
                            </div>
                        )}

                        {/* External link */}
                        <a
                            href={OFFICIAL_PLAYER_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="external-link"
                        >
                            <ExternalLink size={16} /> Abrir en ventana nueva
                        </a>

                        <span className="live-badge">EN DIRECTO</span>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-links">
                    <a href="https://www.reychango.es" target="_blank" rel="noopener noreferrer">www.reychango.es</a>
                    <a href="https://www.huetortajar.com" target="_blank" rel="noopener noreferrer">www.huetortajar.com</a>
                </div>
                <p className="copyright">© 2023 LA ESPÁRRAGO ROCK</p>
            </footer>
        </div>
    );
}

export default RadioApp;
