import React, { useMemo, useState } from 'react';
import { FiActivity, FiEye, FiShield, FiUsers } from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import DataTable from '../../../../common/components/DataTable';
import Modal from '../../../../common/components/Modal';
import Badge from '../../../../common/components/Badge';
import { TextField, SelectField } from '../../../../common/components/fields';
import { formatDateTime, roleLabel } from '../../../../common/utils/labels';
import useAuditLogs from '../hooks/useAuditLogs';
import type { Column } from '../../../../common/types';
import type { AuditLog } from '../../types';

const ACTION_LABELS: Record<string, string> = {
  'notes.submitted': 'Notes soumises',
  'notes.validated': 'Notes validées',
  'notes.published': 'Notes publiées',
  'notes.draft': 'Notes renvoyées en brouillon',
  'note.modification': 'Modification de note',
  'presence.correction': 'Correction de présence',
  'bulletins.generation': 'Génération de bulletins',
  'bulletins.validated': 'Bulletins validés',
  'bulletins.published': 'Bulletins publiés',
  'bulletins.draft': 'Bulletins renvoyés en brouillon',
  'bulletin.suppression': 'Suppression de bulletin',
};

const actionLabel = (action?: string | null): string =>
  ACTION_LABELS[action || ''] || action || '—';

const parseValue = (value?: string | null): string => {
  if (!value) return '—';
  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
};

export default function AuditLogsPage() {
  const logs = useAuditLogs();
  const [search, setSearch] = useState('');
  const [entity, setEntity] = useState('');
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const entityOptions = useMemo(() => {
    const values = Array.from(new Set(logs.rows.map((l) => l.entity).filter(Boolean))) as string[];
    return values.sort().map((v) => ({ value: v, label: v }));
  }, [logs.rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return logs.rows
      .filter((l) => (!entity || l.entity === entity))
      .filter((l) =>
        !term
          ? true
          : [l.actor_name, l.actor_role, l.action, l.entity, l.reason, l.entity_id]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(term))
      )
      .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  }, [logs.rows, entity, search]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: logs.rows.length,
      today: logs.rows.filter((l) => String(l.created_at || '').startsWith(today)).length,
      actors: new Set(logs.rows.map((l) => l.actor_id).filter(Boolean)).size,
      corrections: logs.rows.filter((l) => String(l.action || '').includes('modification') || String(l.action || '').includes('correction')).length,
    };
  }, [logs.rows]);

  const columns: Column<AuditLog>[] = [
    { key: 'created_at', label: 'Horodatage', render: (r) => formatDateTime(r.created_at) },
    { key: 'actor_name', label: 'Acteur', render: (r) => (
      <div>
        <p className="font-medium text-dark dark:text-white">{r.actor_name || '—'}</p>
        <p className="text-xs text-body dark:text-body-dark">{roleLabel(r.actor_role || undefined)}</p>
      </div>
    ) },
    { key: 'action', label: 'Action', render: (r) => <Badge tone="info">{actionLabel(r.action)}</Badge> },
    { key: 'entity', label: 'Entité', render: (r) => r.entity || '—' },
    { key: 'reason', label: 'Motif', render: (r) => r.reason || '—' },
    { key: 'detail' as keyof AuditLog, label: '', render: (r) => (
      <button
        type="button"
        onClick={() => setSelected(r)}
        className="inline-flex items-center gap-1.5 rounded bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
      >
        <FiEye className="w-3.5 h-3.5" /> Détails
      </button>
    ) },
  ];

  return (
    <div className="space-y-6">
      <PageMeta title="Journal d’audit" />
      <PageHeader
        title="Journal d’audit"
        subtitle="Traçabilité des opérations sensibles : qui a fait quoi, quand, avec l’ancienne et la nouvelle valeur."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiActivity} label="Événements" value={stats.total} />
        <StatCard icon={FiShield} label="Aujourd’hui" value={stats.today} />
        <StatCard icon={FiUsers} label="Acteurs" value={stats.actors} />
        <StatCard icon={FiEye} label="Corrections" value={stats.corrections} />
      </div>

      <div className="card-root p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Recherche" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Acteur, action, motif…" />
          <SelectField label="Entité" value={entity} onChange={(e) => setEntity(e.target.value)} placeholder="Toutes les entités" options={entityOptions} />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={logs.loading}
        emptyTitle="Aucun événement"
        emptyDesc="Les opérations sensibles apparaîtront ici."
      />

      <Modal open={!!selected} title="Détail de l’événement" onClose={() => setSelected(null)} size="max-w-2xl">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-body dark:text-body-dark">Horodatage</p>
                <p className="text-dark dark:text-body-dark">{formatDateTime(selected.created_at)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-body dark:text-body-dark">Acteur</p>
                <p className="text-dark dark:text-body-dark">{selected.actor_name || '—'} ({roleLabel(selected.actor_role || undefined)})</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-body dark:text-body-dark">Action</p>
                <p className="text-dark dark:text-body-dark">{actionLabel(selected.action)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-body dark:text-body-dark">Entité</p>
                <p className="text-dark dark:text-body-dark">{selected.entity || '—'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-body dark:text-body-dark">Identifiant</p>
                <p className="font-mono text-xs break-all text-dark dark:text-body-dark">{selected.entity_id || '—'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-body dark:text-body-dark">Motif</p>
                <p className="text-dark dark:text-body-dark">{selected.reason || '—'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-body dark:text-body-dark">Ancienne valeur</p>
                <pre className="max-h-56 overflow-auto rounded bg-gray2 p-3 text-xs text-dark dark:bg-[#2C303B] dark:text-body-dark">{parseValue(selected.old_value)}</pre>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-body dark:text-body-dark">Nouvelle valeur</p>
                <pre className="max-h-56 overflow-auto rounded bg-gray2 p-3 text-xs text-dark dark:bg-[#2C303B] dark:text-body-dark">{parseValue(selected.new_value)}</pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
