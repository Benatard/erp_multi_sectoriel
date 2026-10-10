import React from 'react';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h2 className="text-2xl font-extrabold text-black dark:text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-body dark:text-body-dark">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3 flex-wrap">{children}</div>}
    </div>
  );
}