import { useCallback, useMemo } from 'react';
import { useAuth } from '../../../app/providers/AuthContext';
import useRows from '../../../common/hooks/useRows';
import { schoolTables } from '../api/schoolApi';
import type { Assignment, SchoolClass, Subject } from '../types';

export interface ScopeOption {
  value: string;
  label: string;
}

export interface TeacherScope {
  isTeacher: boolean;
  teacherId: string | null;
  loading: boolean;
  subjectIds: string[];
  classNames: string[];
  subjectOptions: ScopeOption[];
  classOptions: ScopeOption[];
  assignments: Assignment[];
  allows: (subjectId?: string | null, className?: string | null) => boolean;
}

export default function useTeacherScope(): TeacherScope {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const teacherId = user?.teacher_id || null;

  const { rows: assignments, loading } = useRows<Assignment>(schoolTables.assignments);
  const { rows: subjects } = useRows<Subject>(schoolTables.subjects);
  const { rows: classes } = useRows<SchoolClass>(schoolTables.classes);

  const mine = useMemo(
    () =>
      isTeacher && teacherId
        ? assignments.filter((a) => a.teacher_id === teacherId && a.status !== 'ended')
        : [],
    [assignments, isTeacher, teacherId]
  );

  const subjectIds = useMemo(() => Array.from(new Set(mine.map((a) => a.subject_id))), [mine]);

  const classNames = useMemo(() => {
    const ids = new Set(mine.map((a) => a.class_id));
    return classes.filter((c) => ids.has(c.id)).map((c) => c.name);
  }, [mine, classes]);

  const subjectOptions = useMemo(
    () =>
      isTeacher
        ? subjects.filter((s) => subjectIds.includes(s.id)).map((s) => ({ value: s.id, label: s.name }))
        : [],
    [isTeacher, subjects, subjectIds]
  );

  const classOptions = useMemo(
    () => (isTeacher ? classNames.map((n) => ({ value: n, label: n })) : []),
    [isTeacher, classNames]
  );

  const allows = useCallback(
    (subjectId?: string | null, className?: string | null) => {
      if (!isTeacher) return true;
      if (!subjectId || !className) return false;
      return subjectIds.includes(subjectId) && classNames.includes(className);
    },
    [isTeacher, subjectIds, classNames]
  );

  return { isTeacher, teacherId, loading, subjectIds, classNames, subjectOptions, classOptions, assignments: mine, allows };
}
