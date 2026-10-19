import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';

export type Role = 'admin' | 'school_manager' | 'farm_manager' | 'mine_director';

export type Sector = 'core' | 'school' | 'farm' | 'mine';

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  sector: Sector;
  phone?: string | null;
  is_active?: boolean;
}

export type DbRow = Record<string, any>;

export type CrudRow = { id: string } & DbRow;

export interface ListOptions {
  limit?: number | string;
  offset?: number | string;
  page?: number | string;
  order?: string;
  expand?: string;
  filters?: Record<string, any>;
}

export interface Option<T = string> {
  value: T;
  label: string;
}

export interface Column<T> {
  key: keyof T & string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export interface CrudBag<T extends { id: string }> {
  rows: T[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  create: (payload: Partial<T>) => Promise<T>;
  update: (id: string, payload: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<string>;
  form: Partial<T> | null;
  editingId: string | null;
  pendingDelete: T | null;
  saving: boolean;
  deleting: boolean;
  openCreate: (defaults?: Partial<T>) => void;
  openEdit: (row: T) => void;
  close: () => void;
  setField: (key: string, value: any) => void;
  save: () => Promise<void>;
  askDelete: (row: T) => void;
  cancelDelete: () => void;
  confirmDelete: () => Promise<void>;
}

export interface NavItem {
  label: string;
  path: string;
  icon: IconType;
  roles: Role[] | null;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface StatusInfo {
  label: string;
  tone: Tone;
}

export interface AppConfig {
  API_URL: string;
  APP_NAME: string;
  APP_TAGLINE: string;
  FORGE_URL: string;
  FORGE_PROJECT_KEY: string;
  FORGE_API_KEY: string;
  FORGE_ENABLED: boolean;
  FORGE_AUTH_ENABLED: boolean;
  SCHOOL_FORGE_URL: string;
  SCHOOL_FORGE_PROJECT_KEY: string;
  SCHOOL_FORGE_API_KEY: string;
  SCHOOL_FORGE_ENABLED: boolean;
  SCHOOL_FORGE_AUTH_ENABLED: boolean;
}