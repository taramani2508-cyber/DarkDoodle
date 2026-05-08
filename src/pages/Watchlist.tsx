import React, { useEffect, useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { useLanguage } from '../context/LanguageContext';
import { getMovieDetails } from '../services/tmdb';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { BookMarked, Ghost } from 'lucide-react';
import { t } from '../constants';

export default function Watchlist({ onMovieSelect }: { onMovieSelect: (id: number) => void }) {
  const { watchlist } = useWatchlist();
  const { language, userEmail } = useLanguage();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true);
      try {
        const promises = watchlist.map(id => getMovieDetails(id, language.code));
        const res = await Promise.all(promises);
        setMovies(res);
      } catch (error) {
        console.error("Watchlist fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (watchlist.length > 0) {
      fetchWatchlist();
    } else {
      setMovies([]);
      setLoading(false);
    }
  }, [watchlist, language]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-red-600 font-bold animate-pulse uppercase tracking-widest">{t('GATHERING_TROPHIES', language.code)}</div>;
  }

  return (
    <div className="p-8 md:p-20 space-y-12">
      <div className="max-w-4xl space-y-4">
        <div className="flex items-center gap-3 mb-4 text-[10px] font-black tracking-[0.3em] text-red-600 uppercase">
          <span className="w-8 h-px bg-red-600"></span>
          {userEmail ? `${t('WITNESSED_BY', language.code)}: ${userEmail}` : 'Personal Collection'}
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{t('VAULT_TITLE', language.code).split(' ')[0]} <span className="text-red-600">{t('VAULT_TITLE', language.code).split(' ').slice(1).join(' ')}</span></h1>
        <p className="text-white/50 text-sm font-medium tracking-wide">{t('VAULT_SUB', language.code)}</p>
      </div>

      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {movies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} onSelect={onMovieSelect} />
          ))}
        </div>
      ) : (
        <div className="py-40 flex flex-col items-center justify-center space-y-6 opacity-30">
          <Ghost className="w-24 h-24" />
          <div className="text-center">
            <p className="text-2xl font-bold uppercase tracking-[0.3em] mb-2 font-serif italic">Your list is hollow</p>
            <p className="text-xs uppercase tracking-widest">Mark movies to witness them later</p>
          </div>
        </div>
      )}
    </div>
  );
}
