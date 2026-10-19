import React, { useMemo } from 'react';
import { FiTrendingDown, FiDollarSign, FiCalendar, FiLayers } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, DateField, TextareaField } from '../../../common/components/fields';
import { formatDate, formatCurrency } from '../../../common/utils/labels';
import useExpenses from '../hooks/useExpenses';
import useSeasons from '../hooks/useSeasons';
import usePlots from '../hooks/usePlots';
import useSuppliers from '../hooks/useSuppliers';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, CROPS, optionLabel } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { Expense } from '../types';

export default function ExpensesPage() {
  const crud = useExpenses();
  const seasons = useSeasons();
  const plots = usePlots();
  const suppliers = useSuppliers();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    amount: crud.rows.reduce((s, e) => s + Number(e.amount || 0), 0),
    categories: new Set(crud.rows.map((e) => e.category).filter(Boolean)).size,
    linked: crud.rows.filter((e) => e.plot_id).length,
  }), [crud.rows]);

  const columns: Column<Expense>[] = [
    { key: 'expense_date', label: 'Date', render: (r) => formatDate(r.expense_date) },
    { key: 'category', label: 'Catégorie', render: (r) => <span className="font-semibold text-primary">{optionLabel(EXPENSE_CATEGORIES, r.category)}</span> },
    { key: 'description', label: 'Description', render: (r) => r.description || '—' },
    { key: 'amount', label: 'Montant', render: (r) => formatCurrency(r.amount) },
    { key: 'payment_method', label: 'Moyen', render: (r) => <StatusBadge status={r.payment_method} /> },
    { key: 'crop', label: 'Culture', render: (r) => r.crop || '—' },
  ];

  return (
    <FarmCrudPage<Expense>
      metaTitle="Dépenses"
      title="Dépenses"
      subtitle="Semences, engrais, main-d'œuvre, carburant, maintenance, transport… centralisez tous les coûts."
      createLabel="Nouvelle dépense"
      crud={crud}
      columns={columns}
      defaults={{ payment_method: 'cash' }}
      searchable={['description', 'crop']}
      searchPlaceholder="Rechercher une dépense…"
      emptyTitle="Aucune dépense"
      deleteMessage={() => 'Supprimer cette dépense ?'}
      stats={[
        { icon: FiTrendingDown, label: 'Dépenses', value: stats.total },
        { icon: FiDollarSign, label: 'Montant total', value: formatCurrency(stats.amount) },
        { icon: FiLayers, label: 'Catégories', value: stats.categories },
        { icon: FiCalendar, label: 'Rattachées à une parcelle', value: stats.linked },
      ]}
      renderForm={(f, setField) => (
        <>
          <DateField label="Date" required value={f.expense_date || ''} onChange={(e) => setField('expense_date', e.target.value)} />
          <SelectField label="Catégorie" value={f.category || ''} onChange={(e) => setField('category', e.target.value)} placeholder="—" options={EXPENSE_CATEGORIES} />
          <div className="sm:col-span-2">
            <TextField label="Description" required value={f.description || ''} onChange={(e) => setField('description', e.target.value)} placeholder="Achat engrais NPK" />
          </div>
          <NumberField label="Montant (USD)" required value={f.amount ?? ''} onChange={(e) => setField('amount', Number(e.target.value))} placeholder="350" />
          <SelectField label="Moyen de paiement" value={f.payment_method || 'cash'} onChange={(e) => setField('payment_method', e.target.value)} options={PAYMENT_METHODS} />
          <SelectField label="Campagne" value={f.season_id || ''} onChange={(e) => setField('season_id', e.target.value || null)} placeholder="—" options={seasons.rows.map((x) => ({ value: x.id, label: x.name }))} />
          <SelectField label="Parcelle" value={f.plot_id || ''} onChange={(e) => setField('plot_id', e.target.value || null)} placeholder="—" options={plots.rows.map((x) => ({ value: x.id, label: x.name }))} />
          <SelectField label="Culture" value={f.crop || ''} onChange={(e) => setField('crop', e.target.value)} placeholder="—" options={CROPS.map((c) => ({ value: c, label: c }))} />
          <SelectField label="Fournisseur" value={f.supplier_id || ''} onChange={(e) => setField('supplier_id', e.target.value || null)} placeholder="—" options={suppliers.rows.map((x) => ({ value: x.id, label: x.name }))} />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </>
      )}
    />
  );
}
