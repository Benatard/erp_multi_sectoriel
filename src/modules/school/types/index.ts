export type StudentStatus = 'active' | 'graduated' | 'left';

export interface Student {
  id: string;
  matricule?: string | null;
  full_name?: string | null;
  class_name?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  status?: StudentStatus | string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  academic_year?: string | null;
  class_name?: string | null;
  enrolled_at?: string | null;
  status?: string | null;
}

export interface Payment {
  id: string;
  student_id: string;
  academic_year?: string | null;
  term_phase?: string | null;
  amount?: number | null;
  method?: string | null;
  reference?: string | null;
  paid_at?: string | null;
  status?: string | null;
}