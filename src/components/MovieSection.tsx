import React, { useEffect, useState, useRef } from 'react';
import { Movie } from '../types';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from './MovieCard';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface MovieSectionProps {
  title: string;
  fetcher: (language: string, page: number) => Promise<Movie[]>;
  onMovieSelect?: (id: number) => void;
}

export default function MovieSection({ title, fetcher, onMovieSelect }: MovieSectionProps) {
  const { language } = useLanguage();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      try {
        const results = await fetcher(language.code, 1);
        setMovies(results);
        setPage(1);
        setHasMore(results.length > 0);
      } catch (error) {
        console.error(`Error fetching section ${title}:`, error);
      } finally {
        setLoading(false);
      }
    };
    initFetch();
  }, [language, fetcher]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const results = await fetcher(language.code, nextPage);
      if (results.length === 0) {
        setHasMore(false);
      } else {
        setMovies(prev => [...prev, ...results]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error(`Error loading more for ${title}:`, error);
    } finally {
      setLoadingMore(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="px-8 md:px-12 py-8 space-y-4">
        <div className="h-6 w-48 bg-white/5 rounded-lg animate-pulse"></div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[2/3] w-44 md:w-56 bg-white/5 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <div className="relative group/row py-8">
      <div className="px-8 md:px-12 flex justify-between items-end mb-6">
        <h2 className="text-xl font-black flex items-center gap-3 uppercase tracking-tight">
          <span className="w-1.5 h-6 bg-red-600 rounded-full text-red-600"></span>
          {title}
        </h2>
        <button 
          onClick={loadMore}
          disabled={loadingMore || !hasMore}
          className="text-[10px] font-black text-red-600 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          {loadingMore ? 'Witnessing...' : hasMore ? 'See More' : 'EndOfDarkness'}
        </button>
      </div>

      <div className="relative overflow-hidden px-8 md:px-12">
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4"
        >
          {movies.map((movie, idx) => (
            <MovieCard 
              key={`${movie.id}-${idx}`} 
              movie={movie} 
              index={idx % 20} 
              onSelect={onMovieSelect}
            />
          ))}
          
          {hasMore && (
             <button 
               onClick={loadMore}
               className="flex-shrink-0 w-44 md:w-56 aspect-[2/3] bg-white/5 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:bg-red-600/10 hover:border-red-600/50 transition-all group/more"
             >
                <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center text-red-600 group-hover/more:bg-red-600 group-hover/more:text-white transition-all">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover/more:opacity-100 italic">Witness More</span>
             </button>
          )}
        </div>

        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-20 bg-gradient-to-r from-[#050505] to-transparent flex items-center justify-start pl-4 opacity-0 group-hover/row:opacity-100 transition-opacity hidden md:flex"
        >
          <div className="p-3 rounded-full bg-black/40 border border-white/5 backdrop-blur-xl hover:bg-red-600 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </div>
        </button>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-20 bg-gradient-to-l from-[#050505] to-transparent flex items-center justify-end pr-4 opacity-0 group-hover/row:opacity-100 transition-opacity hidden md:flex"
        >
          <div className="p-3 rounded-full bg-black/40 border border-white/5 backdrop-blur-xl hover:bg-red-600 transition-colors">
            <ChevronRight className="w-6 h-6" />
          </div>
        </button>
      </div>
    </div>
  );
}
