import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getTrendingMovies, getDiscoverMovies, getMoviesByOriginalLanguage } from '../services/tmdb';
import { GENRE_IDS, TMDB_BACKDROP_BASE } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { Movie } from '../types';
import MovieSection from '../components/MovieSection';
import { Play, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const WOOD_NAMES: Record<string, string> = {
  'te': 'Tollywood',
  'hi': 'Bollywood',
  'ta': 'Kollywood',
  'ml': 'Mollywood',
  'kn': 'Sandalwood',
  'en': 'Hollywood'
};

export default function Home({ onMovieSelect }: { onMovieSelect: (id: number) => void }) {
  const { language } = useLanguage();
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  const regionalWoodName = useMemo(() => {
    const code = language.code.split('-')[0];
    return WOOD_NAMES[code] || `${language.name} Cinema`;
  }, [language]);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const trending = await getTrendingMovies(language.code, 1);
        if (trending.length > 0) {
          setHeroMovie(trending[0]);
        }
      } catch (error) {
        console.error("Hero movie fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHero();
  }, [language]);

  const fetchTrending = useCallback((lang: string, page: number) => getTrendingMovies(lang, page), []);
  const fetchRegional = useCallback((lang: string, page: number) => {
    const baseLang = lang.split('-')[0];
    return getMoviesByOriginalLanguage(baseLang, lang, page);
  }, []);
  const fetchHorror = useCallback((lang: string, page: number) => getDiscoverMovies([GENRE_IDS.HORROR], lang, page), []);
  const fetchCrime = useCallback((lang: string, page: number) => getDiscoverMovies([GENRE_IDS.CRIME], lang, page), []);
  const fetchThriller = useCallback((lang: string, page: number) => getDiscoverMovies([GENRE_IDS.THRILLER], lang, page), []);
  const fetchMystery = useCallback((lang: string, page: number) => getDiscoverMovies([GENRE_IDS.MYSTERY], lang, page), []);

  return (
    <div className="relative">
      {/* Hero Section */}
      {heroMovie && (
        <div className="relative h-[65vh] md:h-[80vh] w-full overflow-hidden shrink-0">
          <div className="absolute inset-0 z-0">
            <img 
              src={`${TMDB_BACKDROP_BASE}${heroMovie.backdrop_path}`}
              className="w-full h-full object-cover opacity-60 scale-105"
              alt={heroMovie.title}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10"></div>
          </div>

          <div className="absolute bottom-0 left-0 p-12 md:p-24 w-full md:w-3/4 z-20 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-6 text-[10px] font-black tracking-[0.3em] text-red-600">
                <span className="bg-red-600/20 px-2 py-1 border border-red-600/30 rounded uppercase tracking-widest">Hot Now</span>
                <span className="text-white/40 uppercase italic">Trending • {language.name} Edition</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6 drop-shadow-2xl">
                {heroMovie.title.toUpperCase()}
              </h1>
              <p className="text-lg text-white/60 line-clamp-2 max-w-xl font-medium italic">
                "{heroMovie.overview}"
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex items-center gap-4 pt-4"
            >
              <button 
                onClick={() => onMovieSelect(heroMovie.id)}
                className="px-10 py-4 bg-white text-black hover:bg-red-600 hover:text-white rounded-xl flex items-center gap-3 font-black uppercase tracking-tighter transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                Witness
              </button>
              <button 
                onClick={() => onMovieSelect(heroMovie.id)}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white rounded-xl flex items-center gap-3 font-bold transition-all active:scale-95"
              >
                <Info className="w-5 h-5" />
                Details
              </button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-24 right-20 w-80 z-20 glass-card rounded-2xl p-6 hidden lg:block"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
              <span className="text-[10px] font-black tracking-widest text-blue-300 uppercase">Gemini AI Brief</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-medium italic overflow-hidden line-clamp-4">
              {heroMovie.overview}
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[9px] font-bold text-blue-400/60 uppercase tracking-widest">
              <span>Smart Analysis</span>
              <button 
                onClick={() => onMovieSelect(heroMovie.id)}
                className="hover:text-blue-400"
              >
                View Insight
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Movie Sections with Pagination */}
      <div className="relative z-10 -mt-12 space-y-4">
        <MovieSection 
          title={`Popular in ${language.name}`} 
          fetcher={fetchTrending} 
          onMovieSelect={onMovieSelect}
        />
        <MovieSection 
          title={`${regionalWoodName} Picks`} 
          fetcher={fetchRegional} 
          onMovieSelect={onMovieSelect}
        />
        <MovieSection 
          title="Horror Nightmares" 
          fetcher={fetchHorror} 
          onMovieSelect={onMovieSelect}
        />
        <MovieSection 
          title="Crime Chronicles" 
          fetcher={fetchCrime} 
          onMovieSelect={onMovieSelect}
        />
        <MovieSection 
          title="Tense Thrillers" 
          fetcher={fetchThriller} 
          onMovieSelect={onMovieSelect}
        />
        <MovieSection 
          title="Shadowy Mysteries" 
          fetcher={fetchMystery} 
          onMovieSelect={onMovieSelect}
        />
      </div>
    </div>
  );
}
