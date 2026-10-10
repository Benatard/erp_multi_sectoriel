export interface AppSetting {
  id: string;
  key: string;
  category?: string | null;
  value?: string | null;
}

export interface ActivityLog {
  id: string;
  user_id?: string | null;
  action?: string | null;
  entity?: string | null;
  entity_id?: string | null;
  created_at?: string | null;
}