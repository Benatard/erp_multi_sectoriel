import type { Option } from '../../../common/types';

export const CLASSES: Option[] = [
  { value: '6e année A', label: '6e année A' },
  { value: '6e année B', label: '6e année B' },
  { value: '5e année A', label: '5e année A' },
  { value: '5e année B', label: '5e année B' },
  { value: '4e année A', label: '4e année A' },
  { value: '4e année B', label: '4e année B' },
  { value: '3e année A', label: '3e année A' },
  { value: '1ère Science', label: '1ère Science' },
  { value: '2ème Science', label: '2ème Science' },
];

export const ACADEMIC_YEARS: string[] = ['2026-2027', '2025-2026', '2024-2025', '2023-2024'];

export const CYCLES: Option[] = [
  { value: 'Primaire', label: 'Primaire' },
  { value: 'Secondaire', label: 'Secondaire' },
  { value: 'Humanités', label: 'Humanités' },
];

export const LEVELS: Option[] = [
  { value: '1ère', label: '1ère' },
  { value: '2ème', label: '2ème' },
  { value: '3ème', label: '3ème' },
  { value: '4ème', label: '4ème' },
  { value: '5ème', label: '5ème' },
  { value: '6ème', label: '6ème' },
];

export const SECTIONS: Option[] = [
  { value: 'Scientifique', label: 'Scientifique' },
  { value: 'Commerciale', label: 'Commerciale' },
  { value: 'Littéraire', label: 'Littéraire' },
  { value: 'Pédagogique', label: 'Pédagogique' },
  { value: 'Générale', label: 'Générale' },
];

export const GENDERS: Option[] = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
];

export const STUDENT_STATUSES: Option[] = [
  { value: 'active', label: 'Actif' },
  { value: 'graduated', label: 'Diplômé' },
  { value: 'transferred', label: 'Transféré' },
  { value: 'excluded', label: 'Exclu' },
  { value: 'left', label: 'Sorti' },
];

export const ENROLLMENT_STATUSES: Option[] = [
  { value: 'enrolled', label: 'Inscrit' },
  { value: 'repeating', label: 'Redoublant' },
  { value: 'transferred', label: 'Transféré' },
  { value: 'withdrawn', label: 'Abandonné' },
  { value: 'graduated', label: 'Diplômé' },
];

export const ACADEMIC_YEAR_STATUSES: Option[] = [
  { value: 'planned', label: 'Planifiée' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Clôturée' },
];

export const TEACHER_STATUSES: Option[] = [
  { value: 'active', label: 'En fonction' },
  { value: 'leave', label: 'En congé' },
  { value: 'inactive', label: 'Inactif' },
];

export const CLASS_STATUSES: Option[] = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archivée' },
];

export const SUBJECT_STATUSES: Option[] = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archivée' },
];

export const ASSIGNMENT_STATUSES: Option[] = [
  { value: 'active', label: 'Active' },
  { value: 'ended', label: 'Terminée' },
];

export const ATTENDANCE_STATUSES: Option[] = [
  { value: 'present', label: 'Présent' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Retard' },
  { value: 'justified', label: 'Absence justifiée' },
  { value: 'unjustified', label: 'Absence non justifiée' },
];

export const ASSESSMENT_TYPES: Option[] = [
  { value: 'interrogation', label: 'Interrogation' },
  { value: 'homework', label: 'Devoir' },
  { value: 'practical', label: 'Travail pratique' },
  { value: 'oral', label: 'Évaluation orale' },
  { value: 'exam', label: 'Examen' },
  { value: 'other', label: 'Autre' },
];

export const ASSESSMENT_STATUSES: Option[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'open', label: 'Ouverte' },
  { value: 'closed', label: 'Clôturée' },
];

export const GRADE_STATUSES: Option[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'submitted', label: 'Soumis' },
  { value: 'validated', label: 'Validé' },
  { value: 'published', label: 'Publié' },
];

export const DECISIONS: Option[] = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'admis', label: 'Admis' },
  { value: 'redouble', label: 'Redouble' },
  { value: 'transfere', label: 'Transféré' },
  { value: 'exclu', label: 'Exclu' },
  { value: 'diplome', label: 'Diplômé' },
];

export const RELATIONS: Option[] = [
  { value: 'father', label: 'Père' },
  { value: 'mother', label: 'Mère' },
  { value: 'guardian', label: 'Tuteur' },
  { value: 'other', label: 'Autre' },
];

export const PAYMENT_METHODS: Option[] = [
  { value: 'cash', label: 'Espèces' },
  { value: 'mobile', label: 'Mobile Money' },
  { value: 'bank', label: 'Banque' },
];

export const PAYMENT_STATUSES: Option[] = [
  { value: 'paid', label: 'Payé' },
  { value: 'pending', label: 'En attente' },
  { value: 'late', label: 'En retard' },
];

export const PERIODS: Option[] = [
  { value: 'Trimestre 1', label: 'Trimestre 1' },
  { value: 'Trimestre 2', label: 'Trimestre 2' },
  { value: 'Trimestre 3', label: 'Trimestre 3' },
  { value: 'Semestre 1', label: 'Semestre 1' },
  { value: 'Semestre 2', label: 'Semestre 2' },
  { value: 'Annuel', label: 'Annuel' },
];

export const SCALES: Option[] = [
  { value: '20', label: 'Sur 20' },
  { value: '10', label: 'Sur 10' },
  { value: '100', label: 'Sur 100' },
];

export const GRADE_COEFFICIENTS: Option[] = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
];

export const SCHOOL_SETTING_CATEGORIES: Option[] = [
  { value: 'establishment', label: 'Établissement' },
  { value: 'grading', label: 'Notation' },
  { value: 'attendance', label: 'Présence' },
  { value: 'documents', label: 'Documents' },
];

export default {
  CLASSES,
  ACADEMIC_YEARS,
  CYCLES,
  LEVELS,
  SECTIONS,
  GENDERS,
  STUDENT_STATUSES,
  ENROLLMENT_STATUSES,
  ACADEMIC_YEAR_STATUSES,
  TEACHER_STATUSES,
  CLASS_STATUSES,
  SUBJECT_STATUSES,
  ASSIGNMENT_STATUSES,
  ATTENDANCE_STATUSES,
  ASSESSMENT_TYPES,
  ASSESSMENT_STATUSES,
  GRADE_STATUSES,
  DECISIONS,
  RELATIONS,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PERIODS,
  SCALES,
  GRADE_COEFFICIENTS,
  SCHOOL_SETTING_CATEGORIES,
};
