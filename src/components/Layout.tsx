import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, Globe, Bell, Home as HomeIcon, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Layout() {
  const { language, userEmail } = useLanguage();
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-red-600 selection:text-white">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Global Header */}
        <header className="h-16 px-6 md:px-8 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md z-50 shrink-0">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black tracking-tighter text-red-600 md:hidden">
              DARK<span className="text-white">DODDLE</span>
            </h1>
            <nav className="hidden lg:flex gap-6 text-sm font-medium text-white/50">
              <NavLink to="/" className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors"}>Home</NavLink>
              <NavLink to="/search" className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors"}>Movies</NavLink>
              <NavLink to="/watchlist" className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors"}>Watchlist</NavLink>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {userEmail && (
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[8px] font-black tracking-[0.2em] text-white/20 uppercase leading-none">Identity Confirmed</span>
                <span className="text-[10px] font-bold text-white/60 tracking-tight">{userEmail}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 border border-red-600/30 rounded-lg text-xs scale-90 md:scale-100">
              <span className="text-red-500 animate-pulse">●</span>
              <span className="font-bold uppercase tracking-tighter">{language.nativeName}</span>
            </div>
            <button className="hidden sm:block p-2 text-white/40 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-amber-600 border border-white/10 shadow-lg shadow-red-600/10"></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pb-24 md:pb-20"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
          
          {/* Subtle noise texture overlay */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden bg-black/80 backdrop-blur-xl fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-6 z-50 border-t border-white/5 pb-safe">
           <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? "text-red-500" : "text-white/40"}`}>
             <HomeIcon className="w-6 h-6" />
             <span className="text-[9px] uppercase font-black tracking-widest">Witness</span>
           </NavLink>
           <NavLink to="/search" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? "text-red-500" : "text-white/40"}`}>
             <SearchIcon className="w-6 h-6" />
             <span className="text-[9px] uppercase font-black tracking-widest">Enigma</span>
           </NavLink>
           <NavLink to="/watchlist" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? "text-red-500" : "text-white/40"}`}>
             <Heart className="w-6 h-6" />
             <span className="text-[9px] uppercase font-black tracking-widest">Vault</span>
           </NavLink>
        </nav>

        {/* Floating Mini Footer */}
        <footer className="hidden md:flex h-8 px-8 bg-black/80 border-t border-white/5 items-center justify-between text-[9px] text-white/30 tracking-widest uppercase z-40">
           <div className="flex gap-4">
             <span>Available On:</span>
             <span className="text-white/60">NETFLIX</span>
             <span className="text-white/60">PRIME VIDEO</span>
             <span className="text-white/60">HOTSTAR</span>
           </div>
           <div className="flex gap-4">
             <span>Powered by Google Gemini</span>
           </div>
        </footer>
      </div>
    </div>
  );
}
