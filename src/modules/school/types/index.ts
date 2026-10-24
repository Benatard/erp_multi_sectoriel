export type AcademicYearStatus = 'planned' | 'active' | 'closed';
export type ClassStatus = 'active' | 'archived';
export type SubjectStatus = 'active' | 'archived';
export type TeacherStatus = 'active' | 'leave' | 'inactive';
export type AssignmentStatus = 'active' | 'ended';
export type StudentStatus = 'active' | 'graduated' | 'left' | 'transferred' | 'excluded';
export type EnrollmentStatus = 'enrolled' | 'withdrawn' | 'graduated' | 'transferred' | 'repeating';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'justified' | 'unjustified';
export type AssessmentType = 'interrogation' | 'homework' | 'practical' | 'oral' | 'exam' | 'other';
export type AssessmentStatus = 'draft' | 'open' | 'closed';
export type GradeStatus = 'draft' | 'submitted' | 'validated' | 'published';
export type ReportStatus = 'draft' | 'validated' | 'published';
export type Decision = 'admis' | 'redouble' | 'exclu' | 'transfere' | 'diplome' | 'en_cours';
export type Relation = 'father' | 'mother' | 'guardian' | 'other';
export type PaymentMethod = 'cash' | 'mobile' | 'bank' | 'transfer' | 'other';
export type PaymentStatus = 'paid' | 'pending' | 'late';
export type TimetableStatus = 'active' | 'changed' | 'cancelled';
export type NotificationType =
  | 'info'
  | 'assignment'
  | 'timetable'
  | 'grades'
  | 'deadline'
  | 'announcement'
  | 'correction'
  | 'appreciation';
export type AppreciationStatus = 'draft' | 'submitted' | 'validated';
export type CorrectionStatus = 'pending' | 'approved' | 'rejected';

export interface AcademicYear {
  id: string;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: AcademicYearStatus | string;
  notes?: string | null;
}

export interface SchoolClass {
  id: string;
  name: string;
  cycle?: string | null;
  level?: string | null;
  section?: string | null;
  option?: string | null;
  academic_year?: string | null;
  capacity?: number | null;
  status?: ClassStatus | string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string | null;
  coefficient?: number | null;
  level?: string | null;
  section?: string | null;
  description?: string | null;
  status?: SubjectStatus | string;
}

export interface Teacher {
  id: string;
  full_name: string;
  postnom?: string | null;
  first_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  qualification?: string | null;
  specialty?: string | null;
  hire_date?: string | null;
  status?: TeacherStatus | string;
}

export interface Assignment {
  id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  academic_year?: string | null;
  status?: AssignmentStatus | string;
}

export interface Student {
  id: string;
  matricule?: string | null;
  full_name?: string | null;
  postnom?: string | null;
  first_name?: string | null;
  class_name?: string | null;
  section?: string | null;
  birth_date?: string | null;
  birth_place?: string | null;
  nationality?: string | null;
  gender?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  guardian_email?: string | null;
  guardian_relation?: string | null;
  status?: StudentStatus | string;
}

export interface Parent {
  id: string;
  full_name: string;
  relation?: Relation | string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  profession?: string | null;
  status?: string | null;
}

export interface StudentParent {
  id: string;
  student_id: string;
  parent_id: string;
  relation?: Relation | string;
  is_primary?: boolean;
}

export interface Enrollment {
  id: string;
  student_id: string;
  academic_year?: string | null;
  class_name?: string | null;
  section?: string | null;
  option?: string | null;
  enrolled_at?: string | null;
  status?: EnrollmentStatus | string;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_name?: string | null;
  subject_id?: string | null;
  attendance_date?: string | null;
  status?: AttendanceStatus | string;
  note?: string | null;
  recorded_by?: string | null;
  updated_by?: string | null;
}

export interface Assessment {
  id: string;
  name: string;
  type?: AssessmentType | string;
  subject_id?: string | null;
  class_name?: string | null;
  teacher_id?: string | null;
  teacher_name?: string | null;
  period?: string | null;
  scale?: number | null;
  coefficient?: number | null;
  assessment_date?: string | null;
  status?: AssessmentStatus | string;
}

export interface Grade {
  id: string;
  assessment_id: string;
  student_id: string;
  score?: number | null;
  is_absent?: boolean | null;
  status?: GradeStatus | string;
  comment?: string | null;
  submitted_at?: string | null;
  validated_at?: string | null;
  validated_by?: string | null;
  updated_by?: string | null;
  updated_at?: string | null;
}

export interface TimetableSlot {
  id: string;
  academic_year?: string | null;
  class_name?: string | null;
  subject_id?: string | null;
  subject_name?: string | null;
  teacher_id?: string | null;
  teacher_name?: string | null;
  room?: string | null;
  day_of_week?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  status?: TimetableStatus | string;
  notes?: string | null;
  updated_at?: string | null;
}

export interface SubjectAppreciation {
  id: string;
  student_id: string;
  subject_id?: string | null;
  subject_name?: string | null;
  teacher_id?: string | null;
  teacher_name?: string | null;
  academic_year?: string | null;
  period?: string | null;
  appreciation?: string | null;
  status?: AppreciationStatus | string;
  validated_by?: string | null;
  validated_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GradeCorrection {
  id: string;
  grade_id: string;
  assessment_id?: string | null;
  assessment_name?: string | null;
  student_id: string;
  student_name?: string | null;
  old_score?: number | null;
  new_score?: number | null;
  old_absent?: boolean | null;
  new_absent?: boolean | null;
  reason: string;
  status?: CorrectionStatus | string;
  requested_by?: string | null;
  requested_by_name?: string | null;
  requested_at?: string | null;
  reviewed_by?: string | null;
  reviewed_by_name?: string | null;
  reviewed_at?: string | null;
}

export interface SchoolNotification {
  id: string;
  user_id?: string | null;
  role?: string | null;
  title: string;
  message?: string | null;
  type?: NotificationType | string;
  link?: string | null;
  is_read?: boolean | null;
  created_by?: string | null;
  created_at?: string | null;
  read_at?: string | null;
}

export interface ReportCard {
  id: string;
  student_id: string;
  academic_year?: string | null;
  period?: string | null;
  class_name?: string | null;
  average?: number | null;
  percentage?: number | null;
  rank?: number | null;
  total_students?: number | null;
  absences?: number | null;
  lates?: number | null;
  appreciation?: string | null;
  decision?: Decision | string;
  status?: ReportStatus | string;
  generated_by?: string | null;
  validated_by?: string | null;
  published_by?: string | null;
  published_at?: string | null;
}

export interface ReportLine {
  id: string;
  report_card_id: string;
  subject_id?: string | null;
  subject_name?: string | null;
  coefficient?: number | null;
  average?: number | null;
  appreciation?: string | null;
  teacher_name?: string | null;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor_name?: string | null;
  actor_role?: string | null;
  action: string;
  entity?: string | null;
  entity_id?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  reason?: string | null;
  created_at?: string | null;
}

export interface Payment {
  id: string;
  student_id: string;
  academic_year?: string | null;
  term_phase?: string | null;
  amount?: number | null;
  method?: PaymentMethod | string;
  reference?: string | null;
  paid_at?: string | null;
  status?: PaymentStatus | string;
}

export type FeeCategory = 'registration' | 'tuition' | 'exam' | 'transport' | 'documents' | 'other';
export type StudentCategory = 'all' | 'standard' | 'staff' | 'sibling' | 'scholarship';

export interface FeeType {
  id: string;
  name: string;
  code?: string | null;
  category: FeeCategory | string;
  description?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface FeeConfig {
  id: string;
  fee_type_id: string;
  academic_year: string;
  class_name?: string | null;
  section?: string | null;
  student_category?: StudentCategory | string | null;
  amount: number;
  due_date?: string | null;
  period?: string | null;
  notes?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type FeeAdjustmentType = 'discount' | 'exemption';
export type FeeAdjustmentMode = 'amount' | 'percentage';
export type FeeAdjustmentStatus = 'pending' | 'approved' | 'rejected';

export interface FeeAdjustment {
  id: string;
  student_id: string;
  fee_type_id: string;
  academic_year: string;
  type: FeeAdjustmentType | string;
  mode: FeeAdjustmentMode | string;
  value: number;
  reason: string;
  status: FeeAdjustmentStatus | string;
  approved_by?: string | null;
  approved_by_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface InvoiceLine {
  id: string;
  fee_type_id?: string | null;
  fee_type_name?: string | null;
  category?: FeeCategory | string | null;
  description: string;
  amount: number;
  discount_amount?: number | null;
  net_amount: number;
  due_date?: string | null;
  period?: string | null;
}

export type InvoiceStatus = 'draft' | 'issued' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoice_number: string;
  student_id: string;
  enrollment_id?: string | null;
  academic_year: string;
  class_name?: string | null;
  section?: string | null;
  issue_date: string;
  due_date?: string | null;
  lines: InvoiceLine[];
  total_amount: number;
  paid_amount?: number | null;
  balance_amount?: number | null;
  status?: InvoiceStatus | string;
  notes?: string | null;
  created_by?: string | null;
  created_by_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  cancelled_at?: string | null;
  cancelled_by?: string | null;
  cancel_reason?: string | null;
}

export type ReceiptStatus = 'confirmed' | 'cancelled' | 'corrected';

export interface ReceiptCorrection {
  at: string;
  by?: string | null;
  by_name?: string | null;
  reason: string;
  old_amount: number;
  new_amount: number;
  old_method?: string | null;
  new_method?: string | null;
}

export interface Receipt {
  id: string;
  receipt_number: string;
  invoice_id: string;
  invoice_number?: string | null;
  student_id: string;
  student_name?: string | null;
  class_name?: string | null;
  academic_year: string;
  amount: number;
  method: PaymentMethod | string;
  reference?: string | null;
  paid_at: string;
  notes?: string | null;
  status: ReceiptStatus | string;
  issued_by?: string | null;
  issued_by_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  cancelled_at?: string | null;
  cancelled_by?: string | null;
  cancel_reason?: string | null;
  corrections?: ReceiptCorrection[];
}

export interface SchoolSetting {
  id: string;
  key: string;
  value?: string | null;
  category?: string | null;
}
