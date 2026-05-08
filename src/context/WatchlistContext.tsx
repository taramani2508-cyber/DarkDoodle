import React, { createContext, useContext, useState, useEffect } from 'react';

interface WatchlistContextType {
  watchlist: number[];
  addToWatchlist: (id: number) => void;
  removeFromWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<number[]>(() => {
    const saved = localStorage.getItem('darkdoddle_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('darkdoddle_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (id: number) => {
    if (!watchlist.includes(id)) {
      setWatchlist(prev => [...prev, id]);
    }
  };

  const removeFromWatchlist = (id: number) => {
    setWatchlist(prev => prev.filter(mid => mid !== id));
  };

  const isInWatchlist = (id: number) => watchlist.includes(id);

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used within WatchlistProvider');
  return context;
};
