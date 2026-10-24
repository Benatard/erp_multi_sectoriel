import React, { useMemo, useState } from 'react';
import { FiArchive, FiEdit2, FiFileText, FiPercent, FiPlus, FiTag } from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import DataTable from '../../../../common/components/DataTable';
import Modal from '../../../../common/components/Modal';
import ConfirmDialog from '../../../../common/components/ConfirmDialog';
import StatusBadge from '../../../../common/components/StatusBadge';
import { DateField, NumberField, SelectField, TextField, TextareaField } from '../../../../common/components/fields';
import { formatCurrency, formatDate } from '../../../../common/utils/labels';
import { showError, showSuccess } from '../../../../common/utils/notifications';
import { useAuth } from '../../../../app/providers/AuthContext';
import useFinanceData from '../hooks/useFinanceData';
import useStudents from '../../students/hooks/useStudents';
import { logAudit } from '../../utils/audit';
import useClasses from '../../classes/hooks/useClasses';
import {
  ACADEMIC_YEARS,
  CLASSES,
  FINANCE_ADJUSTMENT_MODES,
  FINANCE_ADJUSTMENT_STATUSES,
  FINANCE_ADJUSTMENT_TYPES,
  FINANCE_FEE_CATEGORIES,
  FINANCE_STUDENT_CATEGORIES,
  PERIODS,
  SECTIONS,
} from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { FeeAdjustment, FeeConfig, FeeType } from '../../types';

type Tab = 'types' | 'configs' | 'adjustments';
type ArchiveTarget = { kind: 'fee_type' | 'fee_config' | 'adjustment'; id: string; label: string };

const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Actif' },
  { value: 'false', label: 'Archivé' },
];

const smallAction = 'h-9 w-9 bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors';

export default function FinanceFeesPage() {
  const { user } = useAuth();
  const finance = useFinanceData();
  const students = useStudents();
  const classes = useClasses();
  const [tab, setTab] = useState<Tab>('types');
  const [search, setSearch] = useState('');
  const [typeForm, setTypeForm] = useState<Partial<FeeType> | null>(null);
  const [configForm, setConfigForm] = useState<Partial<FeeConfig> | null>(null);
  const [adjustmentForm, setAdjustmentForm] = useState<Partial<FeeAdjustment> | null>(null);
  const [saving, setSaving] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<ArchiveTarget | null>(null);
  const [archiving, setArchiving] = useState(false);

  const classOptions = classes.rows.length
    ? classes.rows.map((item) => ({ value: item.name, label: item.name }))
    : CLASSES;

  const feeTypeOptions = finance.feeTypes.map((type) => ({ value: type.id, label: `${type.name} (${type.code || type.category})` }));
  const studentOptions = students.rows.map((student) => ({ value: student.id, label: `${student.full_name} (${student.matricule || '-'})` }));
  const feeTypeName = (id?: string | null) => finance.feeTypes.find((type) => type.id === id)?.name || '-';
  const studentName = (id?: string | null) => students.rows.find((student) => student.id === id)?.full_name || '-';

  const filteredTypes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return finance.feeTypes.filter((type) => !term || [type.name, type.code, type.category].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [finance.feeTypes, search]);

  const filteredConfigs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return finance.feeConfigs.filter((config) => !term || [feeTypeName(config.fee_type_id), config.academic_year, config.class_name, config.section, config.student_category].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [finance.feeConfigs, search, finance.feeTypes]);

  const filteredAdjustments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return finance.adjustments.filter((adjustment) => !term || [studentName(adjustment.student_id), feeTypeName(adjustment.fee_type_id), adjustment.reason, adjustment.status].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [finance.adjustments, search, students.rows, finance.feeTypes]);

  const activeTypes = finance.feeTypes.filter((type) => type.is_active !== false).length;
  const activeConfigs = finance.feeConfigs.filter((config) => config.is_active !== false).length;
  const approvedAdjustments = finance.adjustments.filter((adjustment) => adjustment.status === 'approved').length;

  const saveType = async () => {
    if (!typeForm?.name?.trim() || !typeForm.category) {
      showError('Le nom et la catégorie du frais sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      const saved = await finance.saveEntity('fee_type', {
        ...typeForm,
        name: typeForm.name.trim(),
        code: typeForm.code?.trim() || null,
        is_active: typeForm.is_active !== false,
      });
      await logAudit({ user, action: typeForm.id ? 'finance.fee_type.updated' : 'finance.fee_type.created', entity: 'school_fee_types', entityId: saved.id, newValue: saved });
      showSuccess('Type de frais enregistré.');
      setTypeForm(null);
    } catch (error) {
      showError((error as any)?.message || "Erreur d'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const saveConfig = async () => {
    if (!configForm?.fee_type_id || !configForm.academic_year || configForm.amount == null) {
      showError('Le type de frais, l’année et le montant sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      const saved = await finance.saveEntity('fee_config', {
        ...configForm,
        amount: Number(configForm.amount || 0),
        class_name: configForm.class_name || null,
        section: configForm.section || null,
        student_category: configForm.student_category || 'all',
        due_date: configForm.due_date || null,
        period: configForm.period || null,
        notes: configForm.notes || null,
        is_active: configForm.is_active !== false,
      });
      await logAudit({ user, action: configForm.id ? 'finance.fee_config.updated' : 'finance.fee_config.created', entity: 'school_fee_configs', entityId: saved.id, newValue: saved });
      showSuccess('Échéancier enregistré.');
      setConfigForm(null);
    } catch (error) {
      showError((error as any)?.message || "Erreur d'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const saveAdjustment = async () => {
    if (!adjustmentForm?.student_id || !adjustmentForm.fee_type_id || !adjustmentForm.academic_year) {
      showError('L’élève, le type de frais et l’année sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      const approved = adjustmentForm.status === 'approved';
      const saved = await finance.saveEntity('adjustment', {
        ...adjustmentForm,
        value: Number(adjustmentForm.value || 0),
        type: adjustmentForm.type || 'discount',
        mode: adjustmentForm.mode || 'percentage',
        status: adjustmentForm.status || 'approved',
        reason: adjustmentForm.reason || 'Réduction autorisée',
        approved_by: approved ? user?.id || null : null,
        approved_by_name: approved ? user?.full_name || null : null,
      });
      await logAudit({ user, action: adjustmentForm.id ? 'finance.adjustment.updated' : 'finance.adjustment.created', entity: 'school_fee_adjustments', entityId: saved.id, newValue: saved });
      showSuccess('Réduction / exonération enregistrée.');
      setAdjustmentForm(null);
    } catch (error) {
      showError((error as any)?.message || "Erreur d'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      if (archiveTarget.kind === 'adjustment') {
        const adjustment = finance.adjustments.find((item) => item.id === archiveTarget.id);
        if (adjustment) {
          const saved = await finance.saveEntity('adjustment', { ...adjustment, status: 'rejected' });
          await logAudit({ user, action: 'finance.adjustment.rejected', entity: 'school_fee_adjustments', entityId: saved.id, oldValue: adjustment, newValue: saved });
        }
      } else {
        const saved = await finance.archiveEntity(archiveTarget.kind, archiveTarget.id);
        await logAudit({ user, action: `finance.${archiveTarget.kind}.archived`, entity: `school_${archiveTarget.kind}s`, entityId: archiveTarget.id, newValue: saved });
      }
      showSuccess('Élément archivé.');
      setArchiveTarget(null);
    } catch (error) {
      showError((error as any)?.message || "Erreur d'archivage.");
    } finally {
      setArchiving(false);
    }
  };

  const typeColumns: Column<FeeType>[] = [
    { key: 'name', label: 'Type de frais', render: (row) => (
      <div>
        <p className="font-medium text-dark dark:text-white">{row.name}</p>
        <p className="text-xs text-body dark:text-body-dark">{row.code || '-'}</p>
      </div>
    ) },
    { key: 'category', label: 'Catégorie', render: (row) => <StatusBadge status={row.category} /> },
    { key: 'description', label: 'Description', render: (row) => row.description || '-' },
    { key: 'is_active', label: 'Statut', render: (row) => <StatusBadge status={row.is_active === false ? 'archived' : 'active'} /> },
    { key: 'actions' as keyof FeeType, label: '', render: (row) => (
      <div className="flex items-center justify-end gap-2">
        <button className={smallAction} onClick={() => setTypeForm(row)} aria-label="Modifier"><FiEdit2 className="w-4 h-4" /></button>
        {row.is_active !== false && (
          <button className={smallAction} onClick={() => setArchiveTarget({ kind: 'fee_type', id: row.id, label: row.name })} aria-label="Archiver"><FiArchive className="w-4 h-4" /></button>
        )}
      </div>
    ) },
  ];

  const configColumns: Column<FeeConfig>[] = [
    { key: 'fee_type_id', label: 'Frais', render: (row) => (
      <div>
        <p className="font-medium text-dark dark:text-white">{feeTypeName(row.fee_type_id)}</p>
        <p className="text-xs text-body dark:text-body-dark">{row.academic_year}</p>
      </div>
    ) },
    { key: 'class_name', label: 'Classe / Section', render: (row) => `${row.class_name || 'Toutes les classes'}${row.section ? ` · ${row.section}` : ''}` },
    { key: 'student_category', label: 'Catégorie', render: (row) => <StatusBadge status={row.student_category || 'all'} /> },
    { key: 'amount', label: 'Montant', render: (row) => <span className="font-semibold">{formatCurrency(row.amount)}</span> },
    { key: 'due_date', label: 'Échéance', render: (row) => formatDate(row.due_date) },
    { key: 'is_active', label: 'Statut', render: (row) => <StatusBadge status={row.is_active === false ? 'archived' : 'active'} /> },
    { key: 'actions' as keyof FeeConfig, label: '', render: (row) => (
      <div className="flex items-center justify-end gap-2">
        <button className={smallAction} onClick={() => setConfigForm(row)} aria-label="Modifier"><FiEdit2 className="w-4 h-4" /></button>
        {row.is_active !== false && (
          <button className={smallAction} onClick={() => setArchiveTarget({ kind: 'fee_config', id: row.id, label: feeTypeName(row.fee_type_id) })} aria-label="Archiver"><FiArchive className="w-4 h-4" /></button>
        )}
      </div>
    ) },
  ];

  const adjustmentColumns: Column<FeeAdjustment>[] = [
    { key: 'student_id', label: 'Élève', render: (row) => studentName(row.student_id) },
    { key: 'fee_type_id', label: 'Frais', render: (row) => feeTypeName(row.fee_type_id) },
    { key: 'type', label: 'Type', render: (row) => <StatusBadge status={row.type} /> },
    { key: 'value', label: 'Valeur', render: (row) => row.mode === 'percentage' ? `${row.value} %` : formatCurrency(row.value) },
    { key: 'reason', label: 'Motif', render: (row) => row.reason || '-' },
    { key: 'status', label: 'Statut', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'actions' as keyof FeeAdjustment, label: '', render: (row) => (
      <div className="flex items-center justify-end gap-2">
        <button className={smallAction} onClick={() => setAdjustmentForm(row)} aria-label="Modifier"><FiEdit2 className="w-4 h-4" /></button>
        {row.status !== 'rejected' && (
          <button className={smallAction} onClick={() => setArchiveTarget({ kind: 'adjustment', id: row.id, label: `${studentName(row.student_id)} · ${feeTypeName(row.fee_type_id)}` })} aria-label="Rejeter"><FiArchive className="w-4 h-4" /></button>
        )}
      </div>
    ) },
  ];

  const tabs: Array<{ key: Tab; label: string; icon: typeof FiTag; count: number }> = [
    { key: 'types', label: 'Types de frais', icon: FiTag, count: finance.feeTypes.length },
    { key: 'configs', label: 'Échéanciers', icon: FiFileText, count: finance.feeConfigs.length },
    { key: 'adjustments', label: 'Réductions & exonérations', icon: FiPercent, count: finance.adjustments.length },
  ];

  const addLabel = tab === 'types' ? 'Nouveau type de frais' : tab === 'configs' ? 'Nouvel échéancier' : 'Nouvelle réduction';

  return (
    <div className="space-y-6">
      <PageMeta title="Frais & échéanciers" />
      <PageHeader
        title="Configuration des frais"
        subtitle="Frais d’inscription, scolarité, examen, transport, documents et autres frais autorisés."
      >
        <button
          className="btn-primary-root"
          onClick={() => {
            if (tab === 'types') setTypeForm({ category: 'tuition', is_active: true });
            if (tab === 'configs') setConfigForm({ academic_year: '2025-2026', student_category: 'all', amount: 0, is_active: true });
            if (tab === 'adjustments') setAdjustmentForm({ academic_year: '2025-2026', type: 'discount', mode: 'percentage', value: 10, status: 'approved' });
          }}
        >
          <FiPlus className="w-4 h-4" /> {addLabel}
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <StatCard icon={FiTag} label="Types de frais actifs" value={activeTypes} hint={`${finance.feeTypes.length} au total`} />
        <StatCard icon={FiFileText} label="Échéanciers actifs" value={activeConfigs} hint={`${finance.feeConfigs.length} au total`} />
        <StatCard icon={FiPercent} label="Réductions approuvées" value={approvedAdjustments} hint={`${finance.adjustments.length} demandes`} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => { setTab(item.key); setSearch(''); }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border transition-colors ${tab === item.key ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-dark text-dark dark:text-body-dark border-stroke dark:border-[#2C303B] hover:border-primary'}`}
            >
              <item.icon className="w-4 h-4" /> {item.label} <span className={`text-xs ${tab === item.key ? 'text-white/80' : 'text-body dark:text-body-dark'}`}>({item.count})</span>
            </button>
          ))}
        </div>
        <input className="input-root max-w-xs ml-auto" placeholder="Rechercher…" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      {tab === 'types' && <DataTable columns={typeColumns} rows={filteredTypes} loading={finance.loading} emptyTitle="Aucun type de frais" emptyDesc="Créez les frais applicables aux élèves." />}
      {tab === 'configs' && <DataTable columns={configColumns} rows={filteredConfigs} loading={finance.loading} emptyTitle="Aucun échéancier" emptyDesc="Associez les frais aux années, classes et catégories." />}
      {tab === 'adjustments' && <DataTable columns={adjustmentColumns} rows={filteredAdjustments} loading={finance.loading} emptyTitle="Aucune réduction" emptyDesc="Ajoutez les réductions ou exonérations approuvées." />}

      <Modal
        open={!!typeForm}
        title={typeForm?.id ? 'Modifier le type de frais' : 'Nouveau type de frais'}
        onClose={() => setTypeForm(null)}
        footer={<><button onClick={() => setTypeForm(null)} className="btn-outline-root !px-5 !py-2.5">Annuler</button><button onClick={saveType} disabled={saving} className="btn-primary-root !px-5 !py-2.5">{saving ? 'Enregistrement…' : 'Enregistrer'}</button></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Nom" required value={typeForm?.name || ''} onChange={(event) => setTypeForm((form) => ({ ...form, name: event.target.value }))} placeholder="Frais de scolarité" />
          <TextField label="Code" value={typeForm?.code || ''} onChange={(event) => setTypeForm((form) => ({ ...form, code: event.target.value }))} placeholder="SCOL" />
          <SelectField label="Catégorie" required value={typeForm?.category || 'tuition'} onChange={(event) => setTypeForm((form) => ({ ...form, category: event.target.value }))} options={FINANCE_FEE_CATEGORIES} />
          <SelectField label="Statut" value={String(typeForm?.is_active !== false)} onChange={(event) => setTypeForm((form) => ({ ...form, is_active: event.target.value === 'true' }))} options={ACTIVE_OPTIONS} />
          <div className="sm:col-span-2">
            <TextareaField label="Description" value={typeForm?.description || ''} onChange={(event) => setTypeForm((form) => ({ ...form, description: event.target.value }))} placeholder="Description du frais et règles applicables." />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!configForm}
        title={configForm?.id ? 'Modifier l’échéancier' : 'Nouvel échéancier'}
        onClose={() => setConfigForm(null)}
        footer={<><button onClick={() => setConfigForm(null)} className="btn-outline-root !px-5 !py-2.5">Annuler</button><button onClick={saveConfig} disabled={saving} className="btn-primary-root !px-5 !py-2.5">{saving ? 'Enregistrement…' : 'Enregistrer'}</button></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Type de frais" required value={configForm?.fee_type_id || ''} onChange={(event) => setConfigForm((form) => ({ ...form, fee_type_id: event.target.value }))} placeholder="Sélectionner" options={feeTypeOptions} />
          <SelectField label="Année scolaire" required value={configForm?.academic_year || ''} onChange={(event) => setConfigForm((form) => ({ ...form, academic_year: event.target.value }))} options={ACADEMIC_YEARS.map((year) => ({ value: year, label: year }))} />
          <SelectField label="Classe" value={configForm?.class_name || ''} onChange={(event) => setConfigForm((form) => ({ ...form, class_name: event.target.value }))} placeholder="Toutes les classes" options={classOptions} />
          <SelectField label="Section" value={configForm?.section || ''} onChange={(event) => setConfigForm((form) => ({ ...form, section: event.target.value }))} placeholder="Toutes les sections" options={SECTIONS} />
          <SelectField label="Catégorie d’élève" value={configForm?.student_category || 'all'} onChange={(event) => setConfigForm((form) => ({ ...form, student_category: event.target.value }))} options={FINANCE_STUDENT_CATEGORIES} />
          <NumberField label="Montant (USD)" required value={configForm?.amount ?? ''} onChange={(event) => setConfigForm((form) => ({ ...form, amount: Number(event.target.value) }))} />
          <DateField label="Échéance" value={configForm?.due_date || ''} onChange={(event) => setConfigForm((form) => ({ ...form, due_date: event.target.value }))} />
          <SelectField label="Période" value={configForm?.period || ''} onChange={(event) => setConfigForm((form) => ({ ...form, period: event.target.value }))} placeholder="-" options={PERIODS} />
          <SelectField label="Statut" value={String(configForm?.is_active !== false)} onChange={(event) => setConfigForm((form) => ({ ...form, is_active: event.target.value === 'true' }))} options={ACTIVE_OPTIONS} />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={configForm?.notes || ''} onChange={(event) => setConfigForm((form) => ({ ...form, notes: event.target.value }))} placeholder="Règles particulières, remises, etc." />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!adjustmentForm}
        title={adjustmentForm?.id ? 'Modifier la réduction' : 'Nouvelle réduction / exonération'}
        onClose={() => setAdjustmentForm(null)}
        footer={<><button onClick={() => setAdjustmentForm(null)} className="btn-outline-root !px-5 !py-2.5">Annuler</button><button onClick={saveAdjustment} disabled={saving} className="btn-primary-root !px-5 !py-2.5">{saving ? 'Enregistrement…' : 'Enregistrer'}</button></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Élève" required value={adjustmentForm?.student_id || ''} onChange={(event) => setAdjustmentForm((form) => ({ ...form, student_id: event.target.value }))} placeholder="Sélectionner" options={studentOptions} />
          <SelectField label="Type de frais" required value={adjustmentForm?.fee_type_id || ''} onChange={(event) => setAdjustmentForm((form) => ({ ...form, fee_type_id: event.target.value }))} placeholder="Sélectionner" options={feeTypeOptions} />
          <SelectField label="Année scolaire" required value={adjustmentForm?.academic_year || ''} onChange={(event) => setAdjustmentForm((form) => ({ ...form, academic_year: event.target.value }))} options={ACADEMIC_YEARS.map((year) => ({ value: year, label: year }))} />
          <SelectField label="Nature" value={adjustmentForm?.type || 'discount'} onChange={(event) => setAdjustmentForm((form) => ({ ...form, type: event.target.value }))} options={FINANCE_ADJUSTMENT_TYPES} />
          <SelectField label="Mode" value={adjustmentForm?.mode || 'percentage'} onChange={(event) => setAdjustmentForm((form) => ({ ...form, mode: event.target.value }))} options={FINANCE_ADJUSTMENT_MODES} />
          <NumberField label="Valeur" required value={adjustmentForm?.value ?? ''} onChange={(event) => setAdjustmentForm((form) => ({ ...form, value: Number(event.target.value) }))} />
          <SelectField label="Statut" value={adjustmentForm?.status || 'approved'} onChange={(event) => setAdjustmentForm((form) => ({ ...form, status: event.target.value }))} options={FINANCE_ADJUSTMENT_STATUSES} />
          <div className="sm:col-span-2">
            <TextareaField label="Motif / approbation" required value={adjustmentForm?.reason || ''} onChange={(event) => setAdjustmentForm((form) => ({ ...form, reason: event.target.value }))} placeholder="Motif de la réduction ou référence de l’approbation." />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!archiveTarget}
        title={archiveTarget?.kind === 'adjustment' ? 'Rejeter la réduction' : 'Archiver l’élément'}
        message={archiveTarget ? `Confirmer l’archivage de « ${archiveTarget.label} » ? L’historique sera conservé.` : ''}
        onClose={() => setArchiveTarget(null)}
        onConfirm={confirmArchive}
        loading={archiving}
      />
    </div>
  );
}
