import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { WatchlistProvider } from './context/WatchlistContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import MoviePage from './pages/MoviePage';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import Landing from './pages/Landing';
import MovieBottomSheet from './components/MovieBottomSheet';

export default function App() {
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const openMovie = (id: number) => {
    // If mobile-ish width, use bottom sheet, otherwise navigate? 
    // Or just always use bottom sheet for that "premium" app experience.
    if (window.innerWidth < 1024) {
      setSelectedMovieId(id);
    } else {
      // Desktop might still prefer a full page for cinematic feel, 
      // but let's try the bottom sheet for everything first as requested.
      setSelectedMovieId(id);
    }
  };

  return (
    <Router>
      <LanguageProvider>
        <WatchlistProvider>
          <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-600 selection:text-white">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home onMovieSelect={openMovie} />} />
                <Route path="movie/:id" element={<MoviePage />} />
                <Route path="search" element={<Search onMovieSelect={openMovie} />} />
                <Route path="watchlist" element={<Watchlist onMovieSelect={openMovie} />} />
              </Route>
            </Routes>
            <Landing />
            <MovieBottomSheet 
              movieId={selectedMovieId} 
              onClose={() => setSelectedMovieId(null)} 
            />
          </div>
        </WatchlistProvider>
      </LanguageProvider>
    </Router>
  );
}
