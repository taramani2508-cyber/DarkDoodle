import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { Movie } from '../types';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  loading?: boolean;
  onMovieSelect?: (id: number) => void;
}

export default function MovieRow({ title, movies, loading, onMovieSelect }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="px-8 py-8 space-y-4">
        <div className="h-6 w-48 bg-white/5 rounded-lg animate-pulse"></div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[2/3] w-56 bg-white/5 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <div className="relative group/row py-8">
      <div className="px-12 flex justify-between items-end mb-6">
        <h2 className="text-xl font-black flex items-center gap-3 uppercase tracking-tight">
          <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
          {title}
        </h2>
        <button className="text-[10px] font-bold text-white/30 hover:text-red-500 uppercase tracking-widest transition-colors">See All</button>
      </div>

      <div className="relative overflow-hidden px-12">
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {movies.map((movie, idx) => (
            <MovieCard key={movie.id} movie={movie} index={idx} onSelect={onMovieSelect} />
          ))}
        </div>

        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-20 bg-gradient-to-r from-[#050505] to-transparent flex items-center justify-start pl-4 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <div className="p-3 rounded-full bg-black/40 border border-white/5 backdrop-blur-xl hover:bg-red-600 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </div>
        </button>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-20 bg-gradient-to-l from-[#050505] to-transparent flex items-center justify-end pr-4 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <div className="p-3 rounded-full bg-black/40 border border-white/5 backdrop-blur-xl hover:bg-red-600 transition-colors">
            <ChevronRight className="w-6 h-6" />
          </div>
        </button>
      </div>
    </div>
  );
}
