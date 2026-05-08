import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Check, Play } from 'lucide-react';
import { Movie } from '../types';
import { TMDB_IMAGE_BASE } from '../constants';
import { motion } from 'motion/react';
import { useWatchlist } from '../context/WatchlistContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MovieCardProps {
  movie: Movie;
  index?: number;
  onSelect?: (id: number) => void;
  key?: React.Key;
}

export default function MovieCard({ movie, index = 0, onSelect }: MovieCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.id);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie.id);
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(movie.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex-shrink-0 w-44 md:w-56 group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] shadow-2xl transition-all duration-300 group-hover:border-red-600/50">
        <img
          src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button 
                onClick={toggleWatchlist}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  inWatchlist ? "bg-red-600 text-white" : "bg-white/20 text-white hover:bg-white/30"
                )}
              >
                {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
              <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-lg backdrop-blur-md">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold">{movie.vote_average.toFixed(1)}</span>
              </div>
            </div>
            <div className="bg-red-600 p-2 rounded-xl flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-lg">
              <Play className="w-4 h-4 fill-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 px-1">
        <h3 className="font-black text-sm tracking-tighter truncate uppercase">{movie.title}</h3>
        <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] mt-1 italic">
          {movie.release_date?.split('-')[0] || 'TBA'} • WITNESS
        </p>
      </div>
    </motion.div>
  );
}
