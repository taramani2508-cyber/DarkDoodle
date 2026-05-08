import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMovieDetails, getRecommendations, getMovieVideos } from '../services/tmdb';
import { generateMovieExplanation, generateVoiceOver } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import { MovieDetails as MovieDetailsType, Movie } from '../types';
import { TMDB_BACKDROP_BASE, TMDB_IMAGE_BASE, t } from '../constants';
import { Play, Star, Clock, Calendar, Volume2, Plus, Check, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MovieRow from '../components/MovieRow';
import { useWatchlist } from '../context/WatchlistContext';

import { playPcm } from '../lib/pcmPlayer';

export default function MoviePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [trailer, setTrailer] = useState<{ key: string } | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [voiceAudio, setVoiceAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);

  const inWatchlist = id ? isInWatchlist(parseInt(id)) : false;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setAiExplanation(null);
      setVoiceAudio(null);
      setIsPlaying(false);
      setTrailer(null);
      try {
        const [details, recs, videos] = await Promise.all([
          getMovieDetails(parseInt(id), language.code),
          getRecommendations(parseInt(id), language.code),
          getMovieVideos(parseInt(id), language.code),
        ]);
        setMovie(details);
        setRecommendations(recs);

        // Selection Logic: YouTube, priority Trailer > Teaser
        const youtubeVideos = videos.filter(v => v.site === 'YouTube');
        const bestTrailer = 
          youtubeVideos.find(v => v.type === 'Trailer') || 
          youtubeVideos.find(v => v.type === 'Teaser') ||
          youtubeVideos[0];
        
        setTrailer(bestTrailer ? { key: bestTrailer.key } : null);
        
        // Fetch AI Explanation
        const aiExp = await generateMovieExplanation(details.title, details.overview, language.name);
        setAiExplanation(aiExp);
      } catch (error) {
        console.error("Movie page fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, language]);

  const triggerVoice = async () => {
    if (!aiExplanation || loadingAudio || isPlaying) return;
    
    if (voiceAudio) {
      setIsPlaying(true);
      const source = await playPcm(voiceAudio);
      if (source) {
        source.onended = () => setIsPlaying(false);
      } else {
        setIsPlaying(false);
      }
      return;
    }

    setLoadingAudio(true);
    const audio = await generateVoiceOver(aiExplanation);
    if (audio) {
      setVoiceAudio(audio);
      setIsPlaying(true);
      const source = await playPcm(audio);
      if (source) {
        source.onended = () => setIsPlaying(false);
      } else {
        setIsPlaying(false);
      }
    }
    setLoadingAudio(false);
  };

  if (loading || !movie) {
    return <div className="h-screen flex items-center justify-center text-red-600 font-bold animate-pulse">{t('LOADING_DARKNESS', language.code)}</div>;
  }

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Header: Backdrop or Trailer */}
      <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {showTrailer && trailer ? (
            <motion.div 
              key="trailer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-30"
            >
              <iframe 
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&modestbranding=1&rel=0`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
              <button 
                onClick={() => setShowTrailer(false)}
                className="absolute top-8 right-8 z-40 bg-black/60 hover:bg-red-600 p-3 rounded-full text-white transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img 
                src={`${TMDB_BACKDROP_BASE}${movie.backdrop_path}`}
                className="w-full h-full object-cover opacity-60"
                alt={movie.title}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative -mt-32 md:-mt-64 px-8 md:px-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Poster */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-4 lg:col-span-3"
          >
            <div className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl shadow-red-600/20 border border-white/10">
              <img 
                src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                className="w-full h-full object-cover"
                alt={movie.title}
                referrerPolicy="no-referrer"
              />
              {trailer && (
                <button 
                  onClick={() => setShowTrailer(true)}
                  className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center group"
                >
                  <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </div>
                </button>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <div className="md:col-span-8 lg:col-span-9 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-6 text-[10px] font-black tracking-[0.3em] text-red-600">
                <span className="bg-red-600/20 px-2 py-1 border border-red-600/30 rounded uppercase">{t('SPECIAL_SELECTION', language.code)}</span>
                <span className="text-white/40 uppercase italic">{movie.genres?.map(g => g.name).join(' • ')}</span>
              </div>
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-6 uppercase drop-shadow-2xl">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-8 text-white/40 font-bold tracking-widest text-xs uppercase">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-white text-base">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-[10px]">{t('TMDB_SCORE', language.code)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{movie.runtime}m</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{movie.release_date}</span>
                </div>
                <div className="px-2 py-1 border border-white/20 rounded text-[9px] tracking-tighter">{t('UA_RATING', language.code)}</div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3 space-y-8">
                <div>
                  <h3 className="text-red-600 font-black uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
                    <span className="w-4 h-1 bg-red-600"></span>
                    {t('STORYBOARD_DATA', language.code)}
                  </h3>
                  <p className="text-2xl leading-tight text-white/90 font-black italic mb-6">
                    {movie.tagline ? `"${movie.tagline}"` : `Observe the unknown.`}
                  </p>
                  <p className="text-white/60 leading-relaxed font-medium">
                    {movie.overview}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      if (inWatchlist) removeFromWatchlist(movie.id);
                      else addToWatchlist(movie.id);
                    }}
                    className={inWatchlist 
                      ? "px-10 py-4 bg-red-600 text-white rounded-xl flex items-center gap-3 font-black uppercase tracking-tighter transition-all"
                      : "px-10 py-4 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-3 font-black uppercase tracking-tighter transition-all"
                    }
                  >
                    {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {inWatchlist ? t('WATCHLISTED', language.code) : t('WITNESS_LATER', language.code)}
                  </button>
                  {trailer && (
                    <button 
                      onClick={() => setShowTrailer(true)}
                      className="px-10 py-4 bg-white text-black hover:bg-red-600 hover:text-white rounded-xl flex items-center gap-3 font-black uppercase tracking-tighter transition-all"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Play Trailer
                    </button>
                  )}
                </div>
              </div>

              {/* Gemini Section */}
              <div className="lg:col-span-2 glass-card rounded-[32px] p-8 space-y-6 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                  <Volume2 className="w-40 h-40 text-blue-400" />
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                  <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">{t('AI_INTELLIGENCE', language.code)}</span>
                </div>

                <AnimatePresence mode="wait">
                  {aiExplanation ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <p className="text-white/80 leading-relaxed font-medium italic text-lg">
                        "{aiExplanation}"
                      </p>
                      <button 
                        onClick={triggerVoice}
                        disabled={loadingAudio || isPlaying}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600/10 border border-blue-600/20 hover:bg-blue-600 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all group/voice"
                      >
                        <Volume2 className={(loadingAudio || isPlaying) ? "w-4 h-4 animate-bounce" : "w-4 h-4"} />
                        <span>{loadingAudio ? t('NEURAL_AUDIO', language.code) : isPlaying ? t('STREAMING_BRIEF', language.code) : t('STREAM_AUDIO', language.code)}</span>
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 bg-white/5 rounded w-full"></div>
                      <div className="h-4 bg-white/5 rounded w-2/3"></div>
                      <div className="h-4 bg-white/5 rounded w-3/4"></div>
                    </div>
                  )}
                </AnimatePresence>
                
                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                   <div className="flex -space-x-2">
                     {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border border-black bg-white/10"></div>)}
                   </div>
                   <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">{t('ANALYSIS_COMPLETE', language.code)}</span>
                </div>
              </div>
            </div>

            {/* Cast */}
            <div className="pt-8">
               <h3 className="text-white/40 uppercase tracking-widest text-[10px] font-bold mb-6">{t('STARRING_CAST', language.code)}</h3>
               <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 pr-20">
                 {movie.credits?.cast.slice(0, 10).map(person => (
                   <div key={person.id} className="flex-shrink-0 text-center space-y-2 group">
                     <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 group-hover:border-red-600 transition-colors">
                       <img 
                         src={`${TMDB_IMAGE_BASE}${person.profile_path}`}
                         className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                         alt={person.name}
                         referrerPolicy="no-referrer"
                       />
                     </div>
                     <div className="w-24">
                        <p className="text-[10px] font-bold truncate">{person.name}</p>
                        <p className="text-[9px] text-white/40 truncate italic">{person.character}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Watch Providers */}
            {movie['watch/providers']?.results && (
              <div className="pt-8">
                <h3 className="text-white/40 uppercase tracking-widest text-[10px] font-bold mb-6">{t('AVAILABLE_OTT', language.code)}</h3>
                <div className="flex gap-4">
                  {(Object.values(movie['watch/providers'].results)[0] as any)?.flatrate?.map((p: any) => (
                    <div key={p.provider_name} className="group relative">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 group-hover:border-red-600 transition-colors">
                        <img 
                          src={`${TMDB_IMAGE_BASE}${p.logo_path}`}
                          className="w-full h-full object-cover"
                          alt={p.provider_name}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-red-600 uppercase">
                        {p.provider_name}
                      </div>
                    </div>
                  )) || <p className="text-white/40 text-xs italic">{t('NO_STREAMING', language.code)}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-20">
          <MovieRow 
            title={t('TWISTED_TALES', language.code)} 
            movies={recommendations} 
            onMovieSelect={(id) => {
               navigate(`/movie/${id}`);
               window.scrollTo(0, 0);
            }} 
          />
        </div>
      </div>
    </div>
  );
}
