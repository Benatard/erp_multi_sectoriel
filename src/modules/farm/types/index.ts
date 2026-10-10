export interface Plot {
  id: string;
  name: string;
  area_ha?: number | null;
  crop_type?: string | null;
  sowing_date?: string | null;
  harvest_date?: string | null;
  status?: string | null;
  notes?: string | null;
}

export interface Livestock {
  id: string;
  tag_code: string;
  species?: string | null;
  breed?: string | null;
  quantity?: number | null;
  birth_date?: string | null;
  health_status?: string | null;
  last_checkup?: string | null;
  notes?: string | null;
}