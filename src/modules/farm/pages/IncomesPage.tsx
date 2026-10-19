import React, { useMemo } from 'react';
import { FiTrendingUp, FiDollarSign, FiCalendar } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, DateField, TextareaField } from '../../../common/components/fields';
import { formatDate, formatCurrency } from '../../../common/utils/labels';
import useIncomes from '../hooks/useIncomes';
import useSeasons from '../hooks/useSeasons';
import { INCOME_CATEGORIES, PAYMENT_METHODS, optionLabel } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { Income } from '../types';

export default function IncomesPage() {
  const crud = useIncomes();
  const seasons = useSeasons();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    amount: crud.rows.reduce((s, i) => s + Number(i.amount || 0), 0),
    sales: crud.rows.filter((i) => i.category === 'sales').length,
  }), [crud.rows]);

  const columns: Column<Income>[] = [
    { key: 'income_date', label: 'Date', render: (r) => formatDate(r.income_date) },
    { key: 'category', label: 'Catégorie', render: (r) => <span className="font-semibold text-primary">{optionLabel(INCOME_CATEGORIES, r.category)}</span> },
    { key: 'source', label: 'Source', render: (r) => r.source || '—' },
    { key: 'description', label: 'Description', render: (r) => r.description || '—' },
    { key: 'amount', label: 'Montant', render: (r) => formatCurrency(r.amount) },
    { key: 'payment_method', label: 'Moyen', render: (r) => <StatusBadge status={r.payment_method} /> },
  ];

  return (
    <FarmCrudPage<Income>
      metaTitle="Revenus"
      title="Revenus"
      subtitle="Ventes, subventions et autres revenus de l'exploitation."
      createLabel="Nouveau revenu"
      crud={crud}
      columns={columns}
      defaults={{ payment_method: 'cash', category: 'sales' }}
      searchable={['description', 'source']}
      searchPlaceholder="Rechercher un revenu…"
      emptyTitle="Aucun revenu"
      deleteMessage={() => 'Supprimer ce revenu ?'}
      stats={[
        { icon: FiTrendingUp, label: 'Revenus', value: stats.total },
        { icon: FiDollarSign, label: 'Montant total', value: formatCurrency(stats.amount) },
        { icon: FiCalendar, label: 'Issus des ventes', value: stats.sales },
      ]}
      renderForm={(f, setField) => (
        <>
          <DateField label="Date" required value={f.income_date || ''} onChange={(e) => setField('income_date', e.target.value)} />
          <SelectField label="Catégorie" value={f.category || 'sales'} onChange={(e) => setField('category', e.target.value)} options={INCOME_CATEGORIES} />
          <TextField label="Source" value={f.source || ''} onChange={(e) => setField('source', e.target.value)} placeholder="Supermarché XYZ" />
          <NumberField label="Montant (USD)" required value={f.amount ?? ''} onChange={(e) => setField('amount', Number(e.target.value))} placeholder="1600" />
          <SelectField label="Moyen de paiement" value={f.payment_method || 'cash'} onChange={(e) => setField('payment_method', e.target.value)} options={PAYMENT_METHODS} />
          <SelectField label="Campagne" value={f.season_id || ''} onChange={(e) => setField('season_id', e.target.value || null)} placeholder="—" options={seasons.rows.map((x) => ({ value: x.id, label: x.name }))} />
          <div className="sm:col-span-2">
            <TextField label="Description" required value={f.description || ''} onChange={(e) => setField('description', e.target.value)} placeholder="Vente 2 t de maïs" />
          </div>
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </>
      )}
    />
  );
}
