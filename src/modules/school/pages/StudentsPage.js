import React, { useMemo, useState } from 'react';
import { FiUsers, FiUserCheck, FiUserX, FiPlus } from 'react-icons/fi';
import PageMeta from '../../../common/components/PageMeta';
import PageHeader from '../../../common/components/PageHeader';
import StatCard from '../../../common/components/StatCard';
import DataTable from '../../../common/components/DataTable';
import Modal from '../../../common/components/Modal';
import ConfirmDialog from '../../../common/components/ConfirmDialog';
import { TextField, SelectField, DateField } from '../../../common/components/fields';
import StatusBadge from '../../../common/components/StatusBadge';
import { formatDate } from '../../../common/utils/labels';
import useStudents from '../hooks/useStudents';
import { CLASSES } from '../utils/constants';

export default function StudentsPage() {
  const crud = useStudents();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return crud.rows;
    return crud.rows.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(term) ||
        s.matricule?.toLowerCase().includes(term) ||
        s.class_name?.toLowerCase().includes(term) ||
        s.guardian_name?.toLowerCase().includes(term)
    );
  }, [crud.rows, search]);

  const stats = useMemo(() => ({
    total: crud.rows.length,
    active: crud.rows.filter((s) => s.status === 'active').length,
    left: crud.rows.filter((s) => s.status === 'left').length,
  }), [crud.rows]);

  const columns = [
    { key: 'matricule', label: 'Matricule', render: (r) => <span className="font-semibold text-primary">{r.matricule}</span> },
    { key: 'full_name', label: 'Nom complet' },
    { key: 'class_name', label: 'Classe' },
    { key: 'guardian_name', label: 'Tuteur' },
    { key: 'guardian_phone', label: 'Contact' },
    { key: 'birth_date', label: 'Naissance', render: (r) => formatDate(r.birth_date) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const f = crud.form || {};

  return (
    <div className="space-y-6">
      <PageMeta title="Élèves" />
      <PageHeader title="Gestion des élèves" subtitle="Fiches élèves : liste, ajout et modification (nom, classe, tuteur, contact).">
        <button className="btn-primary-root" onClick={() => crud.openCreate({ status: 'active' })}>
          <FiPlus className="w-4 h-4" /> Nouvel élève
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard icon={FiUsers} label="Total élèves" value={stats.total} />
        <StatCard icon={FiUserCheck} label="Actifs" value={stats.active} hint="Inscrits cette année" />
        <StatCard icon={FiUserX} label="Sortis / diplômés" value={stats.left} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input
          className="input-root max-w-xs"
          placeholder="Rechercher (nom, matricule, classe, tuteur)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={crud.loading}
        onEdit={crud.openEdit}
        onDelete={crud.askDelete}
        emptyTitle="Aucun élève"
        emptyDesc="Ajoutez votre premier élève avec le bouton « Nouvel élève »."
      />

      <Modal
        open={!!crud.form}
        title={crud.editingId ? 'Modifier l’élève' : 'Nouvel élève'}
        onClose={crud.close}
        footer={
          <>
            <button onClick={crud.close} className="btn-outline-root !px-5 !py-2.5">Annuler</button>
            <button onClick={crud.save} disabled={crud.saving} className="btn-primary-root !px-5 !py-2.5">
              {crud.saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Nom complet" required value={f.full_name || ''} onChange={(e) => crud.setField('full_name', e.target.value)} placeholder="Ex : Grace Mutombo" />
          <TextField label="Matricule" required value={f.matricule || ''} onChange={(e) => crud.setField('matricule', e.target.value)} placeholder="Ex : ELEV-2026-001" />
          <SelectField label="Classe" required value={f.class_name || ''} onChange={(e) => crud.setField('class_name', e.target.value)}
            placeholder="Sélectionner une classe" options={CLASSES.map((c) => ({ value: c, label: c }))} />
          <SelectField label="Sexe" value={f.gender || ''} onChange={(e) => crud.setField('gender', e.target.value)}
            placeholder="—" options={[{ value: 'M', label: 'Masculin' }, { value: 'F', label: 'Féminin' }]} />
          <TextField label="Tuteur" value={f.guardian_name || ''} onChange={(e) => crud.setField('guardian_name', e.target.value)} placeholder="Ex : Albert Mutombo" />
          <TextField label="Contact tuteur" value={f.guardian_phone || ''} onChange={(e) => crud.setField('guardian_phone', e.target.value)} placeholder="Ex : +243 811 111 111" />
          <DateField label="Date de naissance" value={f.birth_date || ''} onChange={(e) => crud.setField('birth_date', e.target.value)} />
          <SelectField label="Statut" value={f.status || 'active'} onChange={(e) => crud.setField('status', e.target.value)}
            options={[{ value: 'active', label: 'Actif' }, { value: 'graduated', label: 'Diplômé' }, { value: 'left', label: 'Sorti' }]} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!crud.pendingDelete}
        message={`Supprimer la fiche de « ${crud.pendingDelete?.full_name || ''} » ? Cette action est irréversible.`}
        onClose={crud.cancelDelete}
        onConfirm={crud.confirmDelete}
        loading={crud.deleting}
      />
    </div>
  );
}