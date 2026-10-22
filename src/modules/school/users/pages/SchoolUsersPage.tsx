import React, { useMemo, useState } from 'react';
import { FiPlus, FiShield, FiUserCheck, FiUsers, FiLock } from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import DataTable from '../../../../common/components/DataTable';
import Modal from '../../../../common/components/Modal';
import ConfirmDialog from '../../../../common/components/ConfirmDialog';
import StatusBadge from '../../../../common/components/StatusBadge';
import { TextField, SelectField } from '../../../../common/components/fields';
import { roleLabel, formatDate } from '../../../../common/utils/labels';
import { showError, showSuccess } from '../../../../common/utils/notifications';
import { useAuth, SCHOOL_ROLES } from '../../../../app/providers/AuthContext';
import { logAudit } from '../../utils/audit';
import useSchoolUsers from '../hooks/useSchoolUsers';
import type { SchoolUserInput, SchoolUserRow } from '../hooks/useSchoolUsers';
import useTeachers from '../../teachers/hooks/useTeachers';
import type { Column, Role } from '../../../../common/types';

const ROLE_OPTIONS = [{ value: 'admin', label: roleLabel('admin') }, ...SCHOOL_ROLES.map((role) => ({ value: role, label: roleLabel(role) }))];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
];

interface UserFormState extends SchoolUserInput {
  id?: string;
  password: string;
}

export default function SchoolUsersPage() {
  const { user } = useAuth();
  const users = useSchoolUsers();
  const teachers = useTeachers();

  const isAdmin = user?.role === 'admin';

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState<UserFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SchoolUserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return users.rows
      .filter((row) => (roleFilter ? row.role === roleFilter : true))
      .filter((row) => (statusFilter ? (statusFilter === 'active' ? row.is_active : !row.is_active) : true))
      .filter((row) =>
        term
          ? [row.full_name, row.email, row.phone, roleLabel(row.role)].some((value) =>
              String(value || '').toLowerCase().includes(term)
            )
          : true
      )
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [users.rows, roleFilter, statusFilter, query]);

  const stats = useMemo(() => ({
    total: users.rows.length,
    active: users.rows.filter((row) => row.is_active).length,
    staff: users.rows.filter((row) => row.role !== 'teacher').length,
    teachers: users.rows.filter((row) => row.role === 'teacher').length,
  }), [users.rows]);

  const teacherName = (teacherId?: string | null) =>
    teachers.rows.find((teacher) => teacher.id === teacherId)?.full_name || '—';

  const openCreate = () =>
    setForm({
      full_name: '',
      email: '',
      role: 'teacher',
      phone: '',
      teacher_id: '',
      is_active: true,
      password: '',
    });

  const openEdit = (row: SchoolUserRow) =>
    setForm({
      id: row.id,
      full_name: row.full_name,
      email: row.email,
      role: row.role,
      phone: row.phone || '',
      teacher_id: row.teacher_id || '',
      is_active: row.is_active,
      password: '',
    });

  const setField = (key: string, value: unknown) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const save = async () => {
    if (!form) return;
    if (!form.full_name.trim()) {
      showError('Le nom complet est obligatoire.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      showError('Adresse email invalide.');
      return;
    }
    if (!form.id && (!form.password || form.password.length < 6)) {
      showError('Le mot de passe initial doit contenir au moins 6 caractères.');
      return;
    }
    if (form.password && form.password.length < 6) {
      showError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    const email = form.email.trim().toLowerCase();
    if (users.rows.some((row) => row.email.toLowerCase() === email && row.id !== form.id)) {
      showError('Cette adresse email est déjà utilisée par un autre compte.');
      return;
    }
    if (form.id === user?.id && !form.is_active) {
      showError('Vous ne pouvez pas désactiver votre propre compte.');
      return;
    }

    setSaving(true);
    try {
      const payload: SchoolUserInput = {
        full_name: form.full_name,
        email,
        role: form.role,
        phone: form.phone,
        teacher_id: form.role === 'teacher' ? form.teacher_id || null : null,
        is_active: form.is_active,
        password: form.password || undefined,
      };
      if (form.id) {
        await users.updateUser(form.id, payload);
        await logAudit({
          user,
          action: 'utilisateur.modification',
          entity: 'school_users',
          entityId: form.id,
          newValue: { full_name: payload.full_name, email: payload.email, role: payload.role, is_active: payload.is_active },
        });
        showSuccess('Compte utilisateur mis à jour.');
      } else {
        await users.createUser(payload);
        await logAudit({
          user,
          action: 'utilisateur.creation',
          entity: 'school_users',
          entityId: null,
          newValue: { full_name: payload.full_name, email: payload.email, role: payload.role },
        });
        showSuccess('Compte utilisateur créé.');
      }
      setForm(null);
    } catch (err) {
      showError((err as any)?.response?.data?.error || (err as any)?.message || 'Opération impossible.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.id === user?.id) {
      showError('Vous ne pouvez pas supprimer votre propre compte.');
      return;
    }
    setDeleting(true);
    try {
      await users.removeUser(deleteTarget.id);
      await logAudit({
        user,
        action: 'utilisateur.suppression',
        entity: 'school_users',
        entityId: deleteTarget.id,
        oldValue: { full_name: deleteTarget.full_name, email: deleteTarget.email, role: deleteTarget.role },
      });
      showSuccess('Compte utilisateur supprimé.');
      setDeleteTarget(null);
    } catch (err) {
      showError((err as any)?.response?.data?.error || (err as any)?.message || 'Suppression impossible.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<SchoolUserRow>[] = [
    {
      key: 'full_name',
      label: 'Utilisateur',
      render: (row) => (
        <div>
          <p className="font-semibold text-primary">{row.full_name}</p>
          <p className="text-xs text-body dark:text-body-dark">{row.email}</p>
        </div>
      ),
    },
    { key: 'role', label: 'Rôle', render: (row) => roleLabel(row.role) },
    { key: 'phone', label: 'Téléphone', render: (row) => row.phone || '—' },
    { key: 'teacher_id', label: 'Fiche enseignant', render: (row) => (row.role === 'teacher' ? teacherName(row.teacher_id) : '—') },
    {
      key: 'password_hash',
      label: 'Mot de passe',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-body dark:text-body-dark">
          <FiLock className="w-3.5 h-3.5" /> {row.password_hash ? 'Défini' : 'Non défini'}
        </span>
      ),
    },
    { key: 'is_active', label: 'Statut', render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} /> },
    { key: 'last_login_at', label: 'Dernière connexion', render: (row) => formatDate(row.last_login_at) },
    { key: 'created_at', label: 'Créé le', render: (row) => formatDate(row.created_at) },
  ];

  return (
    <div className="space-y-6">
      <PageMeta title="Utilisateurs" />
      <PageHeader
        title="Utilisateurs School"
        subtitle="Tous les comptes du module scolaire et leurs données. La consultation est ouverte à tous les rôles School ; seul l'administrateur général peut ajouter, modifier ou supprimer un compte."
      >
        {isAdmin && (
          <button className="btn-primary-root" onClick={openCreate}>
            <FiPlus className="w-4 h-4" /> Nouvel utilisateur
          </button>
        )}
      </PageHeader>

      {!isAdmin && (
        <div className="card-root p-4 flex items-center gap-3 border-l-4 border-amber-400">
          <FiShield className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-body dark:text-body-dark">
            Lecture seule : seul l'administrateur général peut ajouter, modifier, désactiver ou supprimer des comptes.
            Les mots de passe ne sont jamais affichés.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiUsers} label="Comptes" value={stats.total} />
        <StatCard icon={FiUserCheck} label="Comptes actifs" value={stats.active} />
        <StatCard icon={FiShield} label="Administration / staff" value={stats.staff} />
        <StatCard icon={FiUsers} label="Enseignants" value={stats.teachers} />
      </div>

      <div className="card-root p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextField
          label="Recherche"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom, email, téléphone, rôle…"
        />
        <SelectField
          label="Rôle"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          placeholder="Tous les rôles"
          options={ROLE_OPTIONS}
        />
        <SelectField
          label="Statut"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="Tous les statuts"
          options={STATUS_OPTIONS}
        />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={users.loading}
        onEdit={isAdmin ? openEdit : undefined}
        onDelete={isAdmin ? setDeleteTarget : undefined}
        emptyTitle="Aucun utilisateur"
        emptyDesc="Aucun compte ne correspond aux filtres."
      />

      <Modal
        open={!!form}
        title={form?.id ? 'Modifier un utilisateur' : 'Nouvel utilisateur'}
        onClose={() => setForm(null)}
        size="max-w-2xl"
        footer={
          <>
            <button className="btn-outline-root !px-5 !py-2.5" onClick={() => setForm(null)}>
              Annuler
            </button>
            <button className="btn-primary-root" onClick={save} disabled={saving}>
              {saving ? 'Enregistrement…' : form?.id ? 'Enregistrer' : 'Créer le compte'}
            </button>
          </>
        }
      >
        {form && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Nom complet"
              required
              value={form.full_name}
              onChange={(e) => setField('full_name', e.target.value)}
              placeholder="Nadine Mwape"
            />
            <TextField
              label="Adresse email"
              required
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="utilisateur@aelimu.cd"
            />
            <SelectField
              label="Rôle"
              required
              value={form.role}
              onChange={(e) => setField('role', e.target.value as Role)}
              options={ROLE_OPTIONS}
            />
            <TextField
              label="Téléphone"
              value={form.phone || ''}
              onChange={(e) => setField('phone', e.target.value)}
              placeholder="+243 810 000 000"
            />
            {form.role === 'teacher' && (
              <SelectField
                label="Fiche enseignant liée"
                value={form.teacher_id || ''}
                onChange={(e) => setField('teacher_id', e.target.value)}
                placeholder="Aucune fiche liée"
                options={teachers.rows.map((teacher) => ({ value: teacher.id, label: teacher.full_name }))}
              />
            )}
            <SelectField
              label="Statut du compte"
              value={form.is_active ? 'active' : 'inactive'}
              onChange={(e) => setField('is_active', e.target.value === 'active')}
              options={STATUS_OPTIONS}
            />
            <TextField
              label={form.id ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe initial'}
              type="password"
              required={!form.id}
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              placeholder={form.id ? 'Laisser vide pour conserver' : 'Minimum 6 caractères'}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer l'utilisateur"
        message={`Supprimer définitivement le compte de ${deleteTarget?.full_name || ''} (${deleteTarget?.email || ''}) ? Cette action est réservée à l'administrateur général.`}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
