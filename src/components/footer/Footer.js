import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { publicRoutes } from '../../routes/routes';
import { company, modules } from '../../config/data';
import config from '../../config/config';

export default function Footer() {
  const nameParts = config.APP_NAME.split(' ');
  const first = nameParts[0];
  const rest = nameParts.slice(1).join(' ');

  return (
    <footer className="relative bg-white dark:bg-gray-dark">
      <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="page-container pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/logo-mark.svg" alt={config.APP_NAME} className="h-10 w-10" />
              <span className="text-xl font-extrabold tracking-tight text-black dark:text-white">
                {first} {rest && <span className="text-primary">{rest}</span>}
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-body dark:text-body-dark max-w-xs">
              {company.description}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white">Liens rapides</h3>
            <ul className="mt-5 space-y-3 text-sm text-body dark:text-body-dark">
              {publicRoutes.map((route) => (
                <li key={route.path}>
                  <Link to={route.path} className="inline-flex items-center gap-2 hover:text-primary hover:translate-x-0.5 transition-all duration-300">
                    <span className="h-1 w-1  bg-primary/40" />
                    {route.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/connexion" className="inline-flex items-center gap-2 hover:text-primary hover:translate-x-0.5 transition-all duration-300">
                  <span className="h-1 w-1  bg-primary/40" /> Accéder à l'ERP
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white">Modules</h3>
            <ul className="mt-5 space-y-3 text-sm text-body dark:text-body-dark">
              {modules.slice(0, 5).map((m) => (
                <li key={m.code} className="inline-flex items-center gap-2">
                  <span className="h-1 w-1  bg-primary/40" /> {m.label}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white">Contact</h3>
            <ul className="mt-5 space-y-4 text-sm text-body dark:text-body-dark">
              <li className="flex items-start gap-3">
                <span className="h-9 w-9  bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="w-4 h-4 text-primary" />
                </span>
                <span className="mt-1.5">{company.address.split('\n')[0]}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-9 w-9  bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FiPhone className="w-4 h-4 text-primary" />
                </span>
                <span className="mt-0.5">{company.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-9 w-9  bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FiMail className="w-4 h-4 text-primary" />
                </span>
                <span className="mt-0.5">{company.email}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-14 pt-7 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-stroke/70 dark:border-[#2C303B]">
          <p className="text-sm text-body dark:text-body-dark">
            &copy; {new Date().getFullYear()} {company.legal}. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-sm text-body dark:text-body-dark">
            <span className="hover:text-primary transition-colors">MVP — en construction</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
