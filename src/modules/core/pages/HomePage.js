import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiGrid, FiLayers, FiSettings } from 'react-icons/fi';
import PageMeta from '../../../common/components/PageMeta';
import Reveal from '../../../common/components/Reveal';
import { modules, sectors, company } from '../../../app/config/data';

export default function HomePage() {
  return (
    <div>
      <PageMeta title="Accueil" description={company.description} />

      <section className="relative overflow-hidden bg-white dark:bg-gray-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(74,108,247,0.12)_1px,transparent_0)] bg-[size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_72%)] pointer-events-none" />
        <div className="absolute -top-40 -right-32 w-[480px] h-[480px] rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="page-container relative pt-[110px] md:pt-[140px] pb-20 md:pb-28">
          <Reveal>
            <span className="eyebrow-root">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              MVP — Projet initialisé
            </span>
            <h1 className="mt-7 text-4xl sm:text-5xl lg:text-[60px] font-extrabold tracking-tight leading-[1.08] text-black dark:text-white">
              ERP{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                MULTI-SECTORIEL
              </span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-body dark:text-body-dark max-w-[620px]">
              {company.description}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/connexion" className="btn-primary-root">
                Accéder à l'ERP <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-gray2 dark:bg-black">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FiGrid, title: 'Modules', desc: 'Structure modulaire prête à recevoir les modules définis dans le cahier des charges.' },
              { icon: FiLayers, title: 'Secteurs', desc: 'Architecture multi-sectorielle : chaque secteur sera paramétrable et isolé.' },
              { icon: FiSettings, title: 'Intégration', desc: 'API REST versionnée (`/api/v1`) prête à être branchée sur le backend.' },
            ].map((c) => (
              <div key={c.title} className="card-root p-7">
                <span className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center">
                  <c.icon className="w-5 h-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-black dark:text-white">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body dark:text-body-dark">{c.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 card-root p-7">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-lg font-bold text-black dark:text-white">Squelette des modules</h3>
              <span className="badge-root">en attente CDC</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {modules.map((m) => (
                <span key={m.code} className="inline-flex items-center gap-2 border border-stroke dark:border-[#2C303B] bg-gray2 dark:bg-[#2C303B] px-4 py-2 text-sm font-medium text-dark dark:text-body-dark">
                  <span className="h-1.5 w-1.5 bg-primary" />
                  {m.label}
                </span>
              ))}
              {sectors.map((s) => (
                <span key={s.code} className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                  <span className="h-1.5 w-1.5 bg-primary" />
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}