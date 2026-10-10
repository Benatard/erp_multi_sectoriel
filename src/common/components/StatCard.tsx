import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';

export default function StatCard({ icon: Icon, label, value, hint }: { icon: IconType; label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="card-root p-6 flex items-start gap-4">
      <span className="h-11 w-11 bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-body dark:text-body-dark">{label}</p>
        <p className="text-2xl font-extrabold text-black dark:text-white truncate">{value}</p>
        {hint && <p className="text-xs text-body dark:text-body-dark">{hint}</p>}
      </div>
    </div>
  );
}