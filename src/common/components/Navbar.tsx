import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiSun, FiMoon, FiArrowRight } from 'react-icons/fi';
import config from '../../app/config/config';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nameParts = config.APP_NAME.split(' ');
  const first = nameParts[0];
  const rest = nameParts.slice(1).join(' ');

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-dark/90 backdrop-blur-md shadow-card'
          : 'bg-white/70 dark:bg-gray-dark/70 backdrop-blur-sm'
      }`}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img src="/images/logo-mark.svg" alt={config.APP_NAME} className="h-10 w-10" />
            <span className="text-xl font-extrabold tracking-tight text-black dark:text-white">
              {first} {rest && <span className="text-primary">{rest}</span>}
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setDark(!dark)}
              aria-label="Basculer le thème"
              className="h-10 w-10  bg-gray2 dark:bg-[#2C303B] flex items-center justify-center text-dark dark:text-white hover:text-primary hover:ring-4 hover:ring-primary/15 transition-all"
            >
              {dark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>
            <Link
              to="/connexion"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white  bg-primary shadow-btn hover:bg-primary-dark hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
            >
              Accéder à l'ERP <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={() => setDark(!dark)}
              aria-label="Basculer le thème"
              className="h-10 w-10  bg-gray2 dark:bg-[#2C303B] flex items-center justify-center text-dark dark:text-white hover:text-primary transition-colors"
            >
              {dark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-dark dark:text-white" aria-label="Menu">
              {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden py-4 space-y-3 border-t border-stroke/70 dark:border-[#2C303B]">
            <div className="pt-2">
              <Link to="/connexion" className="btn-primary-root w-full" onClick={() => setMobileOpen(false)}>
                Accéder à l'ERP <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}