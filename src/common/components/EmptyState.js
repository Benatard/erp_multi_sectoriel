import React from 'react';
import { FiInbox } from 'react-icons/fi';

export default function EmptyState({ icon: Icon = FiInbox, title = 'Aucune donnée', desc }) {
  return (
    <div className="py-16 text-center">
      <span className="mx-auto h-14 w-14 bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </span>
      <h4 className="mt-5 text-base font-bold text-black dark:text-white">{title}</h4>
      {desc && <p className="mt-1 text-sm text-body dark:text-body-dark">{desc}</p>}
    </div>
  );
}