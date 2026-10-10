export interface ProductionRecord {
  id: string;
  production_date?: string | null;
  shift?: string | null;
  ore_type?: string | null;
  tonnage?: number | null;
  grade?: number | null;
  site?: string | null;
}

export interface Equipment {
  id: string;
  code: string;
  name: string;
  category?: string | null;
  status?: string | null;
  operator?: string | null;
  last_service?: string | null;
}

export interface Incident {
  id: string;
  incident_date?: string | null;
  severity?: string | null;
  type?: string | null;
  location?: string | null;
  description?: string | null;
  reported_by?: string | null;
  status?: string | null;
}