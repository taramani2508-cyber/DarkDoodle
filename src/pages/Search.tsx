import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Sparkles } from 'lucide-react';
import { searchMovies } from '../services/tmdb';
import { getAIRecommendations } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { motion, AnimatePresence } from 'motion/react';

export default function Search({ onMovieSelect }: { onMovieSelect: (id: number) => void }) {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        setPage(1);
        try {
          const res = await searchMovies(query, language.code, 1);
          setResults(res);
          setHasMore(res.length > 0);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setHasMore(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, language]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await searchMovies(query, language.code, nextPage);
      if (res.length === 0) {
        setHasMore(false);
      } else {
        setResults(prev => [...prev, ...res]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAISuggest = async () => {
    if (!query) return;
    setLoading(true);
    const suggestion = await getAIRecommendations([query], language.name);
    setAiSuggestions(suggestion);
    setLoading(false);
  };

  return (
    <div className="p-8 md:p-20 space-y-12">
      <div className="max-w-4xl space-y-4">
        <div className="flex items-center gap-3 mb-4 text-[10px] font-black tracking-[0.3em] text-red-600 uppercase">
          <span className="w-8 h-px bg-red-600"></span>
          Neural Discovery
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Search the <span className="text-red-600">Enigma</span></h1>
        <p className="text-white/50 text-sm font-medium tracking-wide">Enter the void to discover hidden cinematic horrors.</p>
        
        <div className="relative group pt-4">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-red-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search titles, killers, or hauntings..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-6 outline-none focus:border-red-600/50 transition-all text-xl font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={handleAISuggest}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all flex items-center gap-2 px-4 font-bold text-xs"
          >
            <Sparkles className="w-4 h-4" />
            AI SUGGEST
          </button>
        </div>
      </div>

      <AnimatePresence>
        {aiSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600/5 border border-red-600/20 rounded-3xl p-8 max-w-4xl"
          >
            <h3 className="text-red-600 font-black uppercase tracking-[0.2em] text-[10px] mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Gemini AI Recommendations
            </h3>
            <p className="text-white/80 leading-relaxed italic">
              {aiSuggestions}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {results.map((movie, idx) => (
          <MovieCard key={`${movie.id}-${idx}`} movie={movie} index={idx % 20} onSelect={onMovieSelect} />
        ))}
      </div>

      {hasMore && results.length > 0 && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-4 bg-red-600/10 border border-red-600/20 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all font-black uppercase tracking-widest text-xs flex items-center gap-2 group disabled:opacity-50"
          >
            {loadingMore ? 'Summoning...' : 'Summon More'}
          </button>
        </div>
      )}

      {!loading && query.length > 2 && results.length === 0 && (
        <div className="text-center py-20 text-white/20">
          <p className="text-2xl font-bold uppercase tracking-widest italic">No survivors found...</p>
        </div>
      )}
    </div>
  );
}
