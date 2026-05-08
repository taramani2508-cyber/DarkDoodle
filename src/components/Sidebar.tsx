import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, TrendingUp, BookMarked, Ghost, Skull, ShieldAlert, Eye } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/watchlist', icon: BookMarked, label: 'Watchlist' },
];

const categories = [
  { id: 'horror', icon: Ghost, label: 'Horror' },
  { id: 'crime', icon: Skull, label: 'Crime' },
  { id: 'thriller', icon: ShieldAlert, label: 'Thriller' },
  { id: 'mystery', icon: Eye, label: 'Mystery' },
];

export default function Sidebar() {
  return (
    <aside className="w-20 md:w-64 bg-black border-r border-white/10 flex flex-col h-full z-40 transition-all duration-300 relative">
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tighter text-red-600">
          DARK<span className="text-white">DODDLE</span>
        </h1>
      </div>

      <nav className="flex-1 px-6 py-4 space-y-8 overflow-y-auto no-scrollbar">
        <div>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-2 mb-4 hidden md:block">
            Exploration
          </p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group",
                    isActive 
                      ? "bg-red-600/10 text-red-600" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )
                }
              >
                <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-medium hidden md:block">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest px-2 mb-4 hidden md:block">
            Genres
          </p>
          <div className="space-y-1">
            {categories.map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group text-white/60 hover:text-white hover:bg-white/5"
              >
                <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-medium hidden md:block">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 md:hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center font-bold">
            U
          </div>
          <div className="hidden md:block overflow-hidden">
            <p className="font-medium text-sm truncate">User Profile</p>
            <p className="text-[10px] text-white/40 uppercase tracking-tighter">Premium Agent</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
