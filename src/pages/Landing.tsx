import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Globe } from 'lucide-react';

export default function Landing() {
  const { isInitial, language, setLanguage, setUserEmail, completeInitial } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (!isInitial) return null;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEnter = () => {
    if (!validateEmail(email)) {
      setError('Please Enter a valid identity (Email)');
      return;
    }
    setUserEmail(email);
    completeInitial();
  };

  const isValid = validateEmail(email);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center p-6"
      >
        <div className="absolute inset-0 bg-neutral-900/50 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 to-transparent pointer-events-none"></div>
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="max-w-md w-full glass-card rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden text-center"
        >
          <div className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black tracking-tighter mb-2 uppercase italic"
            >
              DARK<span className="text-red-600">DODDLE</span>
            </motion.h1>
            <div className="text-[10px] font-black tracking-[0.5em] text-white/30 uppercase">Gatekeeper Entry</div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black tracking-widest text-white/40 uppercase ml-1">Your Identity</label>
              <div className="relative group">
                <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isValid ? 'text-red-600' : 'text-white/20 group-focus-within:text-red-600'}`} />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 transition-all font-medium"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                />
              </div>
              {error && <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest ml-1">{error}</p>}
            </div>

            <div className="space-y-3 text-left">
              <label className="text-[10px] font-black tracking-widest text-white/40 uppercase ml-1">Language of the Abyss</label>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto no-scrollbar pr-1 pb-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang)}
                    className={`py-3 px-3 rounded-xl text-[10px] font-black uppercase transition-all border whitespace-nowrap overflow-hidden text-ellipsis ${
                      language.code === lang.code 
                        ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                    }`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>

            <button 
              disabled={!isValid}
              className={`w-full py-5 rounded-xl font-black uppercase tracking-[0.3em] text-xs transition-all shadow-2xl relative overflow-hidden group/btn ${
                isValid ? 'bg-white text-black hover:bg-red-600 hover:text-white translate-y-0' : 'bg-white/10 text-white/30 cursor-not-allowed translate-y-2 opacity-50'
              }`}
              onClick={handleEnter}
            >
              <span className="relative z-10">Enter the Void</span>
              {isValid && <div className="absolute inset-0 bg-red-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>}
            </button>
            <p className="text-[9px] text-white/20 font-medium tracking-widest uppercase italic">By entering, you accept the darkness.</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
