import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBell, FiCheckCircle, FiPlus, FiCalendar, FiClipboard, FiEdit3, FiMessageSquare,
  FiVolume2, FiAlertCircle,
} from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import Modal from '../../../../common/components/Modal';
import Badge from '../../../../common/components/Badge';
import EmptyState from '../../../../common/components/EmptyState';
import { TextField, SelectField } from '../../../../common/components/fields';
import { formatDate, roleLabel } from '../../../../common/utils/labels';
import { showError, showSuccess } from '../../../../common/utils/notifications';
import { useAuth } from '../../../../app/providers/AuthContext';
import useNotifications, { notificationsFor } from '../hooks/useNotifications';
import { can } from '../../utils/permissions';
import { logAudit } from '../../utils/audit';
import { notifyRole } from '../../utils/schoolNotifications';
import { NOTIFICATION_TYPES } from '../../utils/constants';
import type { Role } from '../../../../common/types';
import type { NotificationType, SchoolNotification } from '../../types';

const AUDIENCE_ROLES: Role[] = [
  'school_manager', 'director', 'prefect', 'secretary', 'accountant', 'teacher', 'supervisor', 'admin',
];

const iconFor = (type?: string | null) => {
  switch (type) {
    case 'timetable': return <FiCalendar className="w-5 h-5" />;
    case 'grades': return <FiClipboard className="w-5 h-5" />;
    case 'assignment': return <FiEdit3 className="w-5 h-5" />;
    case 'correction': return <FiEdit3 className="w-5 h-5" />;
    case 'appreciation': return <FiMessageSquare className="w-5 h-5" />;
    case 'announcement': return <FiVolume2 className="w-5 h-5" />;
    case 'deadline': return <FiAlertCircle className="w-5 h-5" />;
    default: return <FiBell className="w-5 h-5" />;
  }
};

const typeLabel = (type?: string | null): string =>
  NOTIFICATION_TYPES.find((t) => t.value === type)?.label || 'Information';

export default function NotificationsPage() {
  const { user } = useAuth();
  const notifications = useNotifications();
  const navigate = useNavigate();

  const canAnnounce = can(user?.role, 'announcements.manage');

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [type, setType] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'announcement' as NotificationType,
    audience: '' as '' | Role,
  });
  const [saving, setSaving] = useState(false);

  const mine = useMemo(() => notificationsFor(notifications.rows, user), [notifications.rows, user]);

  const rows = useMemo(() => {
    let base = mine;
    if (filter === 'unread') base = base.filter((n) => !n.is_read);
    if (filter === 'read') base = base.filter((n) => !!n.is_read);
    if (type) base = base.filter((n) => (n.type || 'info') === type);
    return base;
  }, [mine, filter, type]);

  const stats = useMemo(
    () => ({
      total: mine.length,
      unread: mine.filter((n) => !n.is_read).length,
      announcements: mine.filter((n) => n.type === 'announcement').length,
      today: mine.filter((n) => String(n.created_at || '').slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
    }),
    [mine]
  );

  const visibleUnread = rows.filter((n) => !n.is_read).length;

  const openItem = async (item: SchoolNotification) => {
    if (!item.is_read) await notifications.markRead(item.id);
    if (item.link) navigate(item.link);
  };

  const markAll = async () => {
    const ids = rows.filter((n) => !n.is_read).map((n) => n.id);
    if (!ids.length) return;
    await notifications.markAllRead(ids);
    showSuccess('Notifications marquées comme lues.');
  };

  const publish = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      showError('Le titre et le message sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      const input = {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        link: null,
        actor: user,
      };
      if (form.audience) {
        await notifyRole(form.audience, input);
      } else {
        await notifications.create({
          user_id: null,
          role: null,
          title: input.title,
          message: input.message,
          type: input.type,
          link: null,
          is_read: false,
          created_by: user?.id || null,
          created_at: new Date().toISOString(),
        });
      }
      await logAudit({
        user,
        action: 'annonce.publication',
        entity: 'school_notifications',
        entityId: null,
        newValue: { ...input, audience: form.audience || 'all' },
      });
      showSuccess('Annonce publiée.');
      setComposeOpen(false);
      setForm({ title: '', message: '', type: 'announcement', audience: '' });
    } catch (err) {
      showError((err as any)?.response?.data?.error || (err as any)?.message || 'Publication impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Notifications" />
      <PageHeader
        title="Notifications & annonces"
        subtitle="Centre personnel : emploi du temps, affectations, notes, corrections, appréciations et annonces de la direction."
      >
        {canAnnounce && (
          <button className="btn-primary-root" onClick={() => setComposeOpen(true)}>
            <FiPlus className="w-4 h-4" /> Publier une annonce
          </button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiBell} label="Notifications" value={stats.total} />
        <StatCard icon={FiAlertCircle} label="Non lues" value={stats.unread} />
        <StatCard icon={FiVolume2} label="Annonces" value={stats.announcements} />
        <StatCard icon={FiCalendar} label="Aujourd’hui" value={stats.today} />
      </div>

      <div className="card-root p-5 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="sm:w-48">
          <SelectField
            label="Affichage"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            options={[
              { value: 'all', label: 'Toutes' },
              { value: 'unread', label: 'Non lues' },
              { value: 'read', label: 'Lues' },
            ]}
          />
        </div>
        <div className="sm:w-56">
          <SelectField
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Tous les types"
            options={NOTIFICATION_TYPES}
          />
        </div>
        <button className="btn-outline-root !px-5 !py-2.5" onClick={markAll} disabled={!visibleUnread}>
          <FiCheckCircle className="w-4 h-4" /> Tout marquer comme lu
        </button>
      </div>

      {!rows.length ? (
        <div className="card-root">
          <EmptyState
            title="Aucune notification"
            desc={filter === 'unread' ? 'Vous avez tout lu.' : 'Les notifications liées à votre activité apparaîtront ici.'}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((item) => (
            <div
              key={item.id}
              className={`card-root p-4 flex items-start gap-4 ${item.is_read ? '' : 'border-l-4 border-l-primary'}`}
            >
              <div className={`h-11 w-11 flex items-center justify-center shrink-0 ${item.is_read ? 'bg-gray2 text-body dark:bg-[#2C303B] dark:text-body-dark' : 'bg-primary/10 text-primary'}`}>
                {iconFor(item.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-dark dark:text-white">{item.title}</p>
                  <Badge tone={item.type === 'announcement' ? 'warning' : 'info'}>{typeLabel(item.type)}</Badge>
                  {!item.is_read && <Badge tone="success">Nouveau</Badge>}
                </div>
                {item.message && <p className="text-sm text-body dark:text-body-dark mt-1">{item.message}</p>}
                <p className="text-xs text-body dark:text-body-dark mt-2">
                  {formatDate(item.created_at)}
                  {item.role ? ` · ${roleLabel(item.role)}` : ''}
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {item.link && (
                  <button className="btn-outline-root !px-3 !py-1.5 text-xs" onClick={() => openItem(item)}>
                    Ouvrir
                  </button>
                )}
                {!item.is_read && (
                  <button className="text-xs font-semibold text-primary hover:underline" onClick={() => notifications.markRead(item.id)}>
                    Marquer lu
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={composeOpen}
        title="Publier une annonce"
        onClose={() => setComposeOpen(false)}
        size="max-w-2xl"
        footer={
          <>
            <button className="btn-outline-root !px-5 !py-2.5" onClick={() => setComposeOpen(false)}>Annuler</button>
            <button className="btn-primary-root" onClick={publish} disabled={saving}>
              {saving ? 'Publication…' : 'Publier'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField
            label="Titre"
            required
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Réunion pédagogique, rappel de dépôt des notes…"
          />
          <label className="block">
            <span className="label-root mb-1.5">Message</span>
            <textarea
              className="input-root min-h-[120px]"
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Détail de l’annonce…"
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Type"
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as NotificationType }))}
              options={NOTIFICATION_TYPES}
            />
            <SelectField
              label="Destinataires"
              value={form.audience}
              onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value as '' | Role }))}
              options={[{ value: '', label: 'Tous les utilisateurs' }, ...AUDIENCE_ROLES.map((r) => ({ value: r, label: roleLabel(r) }))]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

