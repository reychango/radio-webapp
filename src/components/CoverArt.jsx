import { useState, useEffect } from 'react';

const CoverArt = ({ artist, title }) => {
    const [coverUrl, setCoverUrl] = useState("/logo.png");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If we receive the cover URL directly from prop (future proofing), use it.
        // For now, we fetch based on artist/title
        if (!artist || artist === "La Espárrago Rock") {
            setCoverUrl("/logo.png");
            return;
        }

        const fetchCover = async () => {
            setLoading(true);
            try {
                const query = encodeURIComponent(`${artist} ${title}`);
                const response = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`);
                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    const highResUrl = data.results[0].artworkUrl100.replace('100x100bb', '800x800bb');
                    setCoverUrl(highResUrl);
                } else {
                    setCoverUrl("/logo.png");
                }
            } catch (error) {
                setCoverUrl("/logo.png");
            } finally {
                setLoading(false);
            }
        };

        fetchCover();
    }, [artist, title]);

    return (
        <div className="w-full aspect-square max-w-[500px] rounded-xl overflow-hidden shadow-2xl border border-[var(--color-glass-border)] bg-[#1a0505] relative group">
            <img
                src={coverUrl}
                alt="Album Cover"
                className={`w-full h-full object-cover transition-all duration-700 ${loading ? 'opacity-50 blur-sm' : 'opacity-100'} group-hover:scale-105`}
            />
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
        </div>
    );
};

export default CoverArt;
