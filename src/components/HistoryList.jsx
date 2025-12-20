import { Music, BarChart3, Heart } from 'lucide-react';

const HistoryList = ({ history }) => {
    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-[var(--color-text-muted)] gap-2">
                <Music size={32} className="opacity-20" />
                <span className="text-sm">El historial está vacío</span>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-1">
            {/* Table Header */}
            <div className="flex items-center text-[var(--color-text-muted)] text-xs uppercase tracking-wider border-b border-[var(--color-glass-border)] pb-2 mb-2 px-4">
                <span className="w-8">#</span>
                <span className="flex-1">Título</span>
                <span className="flex-1 hidden sm:block">Artista</span>
                <span className="w-10 text-right">Amor</span>
            </div>

            {/* Rows */}
            {history.map((track, index) => (
                <div key={index} className="flex items-center gap-4 p-2 px-4 rounded-md hover:bg-[var(--color-glass)] transition-colors group cursor-default">

                    <div className="w-8 text-[var(--color-text-muted)] text-sm font-mono flex justify-center">
                        <span className="group-hover:hidden">{index + 1}</span>
                        <PlayIcon className="hidden group-hover:block text-white" />
                    </div>

                    <div className="flex-1 flex flex-col justify-center overflow-hidden">
                        <span className="text-white text-sm font-medium truncate">{track.title}</span>
                        <span className="text-[var(--color-text-muted)] text-xs truncate sm:hidden">{track.artist}</span>
                    </div>

                    <div className="flex-1 hidden sm:flex items-center text-[var(--color-text-muted)] text-sm overflow-hidden">
                        <span className="truncate">{track.artist}</span>
                    </div>

                    <div className="w-10 flex justify-end">
                        <button className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                            <Heart size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Mini Helper Icon
const PlayIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${className}`}>
        <path d="M8 5v14l11-7z" />
    </svg>
);

export default HistoryList;
