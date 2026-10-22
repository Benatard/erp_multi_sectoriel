import db from '../../../services/db';
import { demoUsers } from '../../../services/demoData';
import { schoolTables } from '../api/schoolApi';
import type { Role, User } from '../../../common/types';
import type { NotificationType } from '../types';

interface NotifyInput {
  title: string;
  message: string;
  type?: NotificationType | string;
  link?: string | null;
  actor?: User | null;
}

interface Recipient {
  id: string;
  role: string;
  teacher_id?: string | null;
}

const loadRecipients = async (): Promise<Recipient[]> => {
  if (db.isSchoolForge()) {
    try {
      const rows = await db.list('school_users', { limit: 200 });
      return rows.map((row) => ({
        id: String(row.id),
        role: String(row.role || ''),
        teacher_id: row.teacher_id ? String(row.teacher_id) : null,
      }));
    } catch {
      return [];
    }
  }
  return demoUsers.map((user) => ({
    id: user.id,
    role: String(user.role),
    teacher_id: user.teacher_id || null,
  }));
};

const createFor = async (userId: string | null, role: string | null, input: NotifyInput) => {
  try {
    await db.create(schoolTables.notifications, {
      user_id: userId,
      role,
      title: input.title,
      message: input.message,
      type: input.type || 'info',
      link: input.link || null,
      is_read: false,
      created_by: input.actor?.id || null,
      created_at: new Date().toISOString(),
    });
  } catch {
    return;
  }
};

export async function notifyUserIds(userIds: string[], input: NotifyInput): Promise<void> {
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  for (const id of ids) {
    if (input.actor?.id === id) continue;
    await createFor(id, null, input);
  }
}

export async function notifyRole(role: Role, input: NotifyInput): Promise<void> {
  const recipients = (await loadRecipients()).filter((user) => user.role === role);
  if (!recipients.length) {
    await createFor(null, role, input);
    return;
  }
  await notifyUserIds(recipients.map((user) => user.id), input);
}

export async function notifyTeacher(teacherId: string | null | undefined, input: NotifyInput): Promise<void> {
  if (!teacherId) {
    await notifyRole('teacher', input);
    return;
  }
  const recipients = (await loadRecipients()).filter((user) => user.teacher_id === teacherId);
  if (!recipients.length) {
    await createFor(null, 'teacher', input);
    return;
  }
  await notifyUserIds(recipients.map((user) => user.id), input);
}

export async function notifyValidators(input: NotifyInput): Promise<void> {
  const roles: Role[] = ['admin', 'school_manager', 'director', 'prefect'];
  const recipients = (await loadRecipients()).filter((user) => roles.includes(user.role as Role));
  await notifyUserIds(recipients.map((user) => user.id), input);
}
