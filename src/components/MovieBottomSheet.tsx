import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Star, Clock, Calendar, Volume2, Plus, Check, ExternalLink } from 'lucide-react';
import { getMovieDetails, getMovieVideos } from '../services/tmdb';
import { generateMovieExplanation, generateVoiceOver } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import { MovieDetails as MovieDetailsType } from '../types';
import { TMDB_BACKDROP_BASE, TMDB_IMAGE_BASE, t } from '../constants';
import { useWatchlist } from '../context/WatchlistContext';
import { playPcm } from '../lib/pcmPlayer';

interface MovieBottomSheetProps {
  movieId: number | null;
  onClose: () => void;
}

export default function MovieBottomSheet({ movieId, onClose }: MovieBottomSheetProps) {
  const { language } = useLanguage();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [trailer, setTrailer] = useState<{ key: string } | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [voiceAudio, setVoiceAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!movieId) {
      setMovie(null);
      setTrailer(null);
      setAiExplanation(null);
      setVoiceAudio(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [details, videos] = await Promise.all([
          getMovieDetails(movieId, language.code),
          getMovieVideos(movieId, language.code),
        ]);
        setMovie(details);

        const youtubeVideos = videos.filter(v => v.site === 'YouTube');
        const bestTrailer = youtubeVideos.find(v => v.type === 'Trailer') || youtubeVideos.find(v => v.type === 'Teaser') || youtubeVideos[0];
        setTrailer(bestTrailer ? { key: bestTrailer.key } : null);

        const aiExp = await generateMovieExplanation(details.title, details.overview, language.name);
        setAiExplanation(aiExp);
      } catch (error) {
        console.error("Bottom sheet fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId, language]);

  const triggerVoice = async () => {
    if (!aiExplanation || loadingAudio || isPlaying) return;
    if (voiceAudio) {
      setIsPlaying(true);
      const source = await playPcm(voiceAudio);
      if (source) source.onended = () => setIsPlaying(false);
      else setIsPlaying(false);
      return;
    }

    setLoadingAudio(true);
    const audio = await generateVoiceOver(aiExplanation);
    if (audio) {
      setVoiceAudio(audio);
      setIsPlaying(true);
      const source = await playPcm(audio);
      if (source) source.onended = () => setIsPlaying(false);
      else setIsPlaying(false);
    }
    setLoadingAudio(false);
  };

  const inWatchlist = movieId ? isInWatchlist(movieId) : false;
  
  // Find providers for India or Default
  const providers = movie?.['watch/providers']?.results?.['IN'] || 
                    movie?.['watch/providers']?.results?.['US'] || 
                    (movie?.['watch/providers']?.results && Object.values(movie['watch/providers'].results)[0]);

  return (
    <AnimatePresence>
      {movieId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[70] bg-[#0a0a0a] border-t border-white/10 rounded-t-[32px] max-h-[95vh] overflow-y-auto no-scrollbar"
          >
            <div className="sticky top-0 w-full flex justify-center py-4 bg-[#0a0a0a]/80 backdrop-blur-md z-20">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              <button 
                onClick={onClose}
                className="absolute right-6 top-3 p-2 rounded-full bg-white/10 text-white/60 hover:text-white transition-all active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {loading || !movie ? (
              <div className="h-96 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-red-600 font-black tracking-widest uppercase text-xs">{t('SUMMONING_DETAILS', language.code)}</p>
              </div>
            ) : (
              <div className="pb-12">
                <div className="relative aspect-video w-full bg-black overflow-hidden shadow-2xl">
                  {trailer ? (
                    <iframe 
                      src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&modestbranding=1&rel=0`}
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img 
                        src={`${TMDB_BACKDROP_BASE}${movie.backdrop_path}`} 
                        className="w-full h-full object-cover opacity-60"
                        alt="" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                    </>
                  )}
                </div>

                <div className="px-6 relative z-10 -mt-6">
                  <div className="flex gap-5">
                    <div className="relative group/poster">
                      <img 
                        src={`${TMDB_IMAGE_BASE}${movie.poster_path}`} 
                        className="w-28 h-40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 relative z-10 transition-transform group-hover/poster:scale-105"
                        alt="" 
                      />
                      <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-2xl -z-10 group-hover/poster:bg-red-600/40 transition-all" />
                    </div>
                    <div className="flex-1 pt-8">
                      <h2 className="text-3xl font-black tracking-tighter leading-[0.95] uppercase italic mb-2">
                        {movie.title}
                      </h2>
                      <div className="flex items-center gap-3 mt-2 text-white/40 font-bold text-[10px] uppercase tracking-widest">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-white">{movie.vote_average.toFixed(1)}</span>
                        </div>
                        <span>{movie.runtime}m</span>
                        <span>{movie.release_date?.split('-')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-8">
                    {/* OTT Platforms */}
                    <div>
                      <h3 className="text-[10px] font-black tracking-[0.2em] text-red-600 uppercase mb-4 flex items-center gap-2">
                        <span className="w-4 h-0.5 bg-red-600" />
                        {t('WHERE_TO_WITNESS', language.code)}
                      </h3>
                      {providers?.flatrate ? (
                        <div className="flex gap-4">
                          {providers.flatrate.map(p => (
                            <div key={p.provider_id} className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
                                <img src={`${TMDB_IMAGE_BASE}${p.logo_path}`} className="w-full h-full object-cover" alt={p.provider_name} />
                              </div>
                              <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter w-12 text-center truncate">{p.provider_name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/40 text-[10px] font-bold tracking-widest italic">{t('NOT_AVAILABLE', language.code)}</p>
                      )}
                      
                      {providers?.link && (
                        <div className="mt-6 w-full flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-widest text-[10px] rounded-xl italic">
                          Availability based on region
                        </div>
                      )}
                    </div>

                    {/* AI Insight */}
                    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                       <div className="flex items-center gap-2 mb-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                          <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">{t('AI_INTRUSION', language.code)}</span>
                       </div>
                       <p className="text-sm font-medium leading-relaxed italic text-white/80">
                         {aiExplanation || t('EXTRACTING_DATA', language.code)}
                       </p>
                       {aiExplanation && (
                         <button 
                            onClick={triggerVoice}
                            disabled={loadingAudio || isPlaying}
                            className="mt-4 flex items-center gap-2 text-blue-400 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                         >
                           <Volume2 size={16} className={(loadingAudio || isPlaying) ? 'animate-bounce' : ''} />
                           {loadingAudio ? t('GENERATIVE_VOICE', language.code) : isPlaying ? t('TRANSMITTING', language.code) : t('LISTEN_TO_BRIEF', language.code)}
                         </button>
                       )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black tracking-[0.2em] text-red-600 uppercase flex items-center gap-2">
                        <span className="w-4 h-0.5 bg-red-600" />
                        {t('THE_WITNESSES', language.code)}
                      </h3>
                      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {movie.credits?.cast?.slice(0, 10).map(actor => (
                          <div key={actor.id} className="flex-shrink-0 w-20 flex flex-col items-center text-center gap-2">
                            <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 ring-1 ring-white/5 shadow-inner">
                              {actor.profile_path ? (
                                <img src={`${TMDB_IMAGE_BASE}${actor.profile_path}`} className="w-full h-full object-cover" alt={actor.name} />
                              ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20 font-black text-xs">?</div>
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[9px] font-black text-white truncate w-20 tracking-tighter">{actor.name}</p>
                              <p className="text-[8px] font-medium text-white/40 truncate w-20 italic">{actor.character}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black tracking-[0.2em] text-red-600 uppercase flex items-center gap-2">
                        <span className="w-4 h-0.5 bg-red-600" />
                        {t('OVERVIEW', language.code)}
                      </h3>
                      <p className="text-sm text-white/60 leading-relaxed font-medium">
                        {movie.overview}
                      </p>
                    </div>

                    <div className="flex gap-4">
                       <button 
                        onClick={() => {
                          if (inWatchlist) removeFromWatchlist(movie.id);
                          else addToWatchlist(movie.id);
                        }}
                        className={`flex-1 py-4 px-6 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                          inWatchlist ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-white'
                        }`}
                      >
                        {inWatchlist ? <Check size={16}/> : <Plus size={16}/>}
                        {inWatchlist ? t('WATCHLISTED', language.code) : t('THE_VAULT', language.code)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
