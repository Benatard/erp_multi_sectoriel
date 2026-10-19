export interface Farm {
  id: string;
  name: string;
  code?: string | null;
  address?: string | null;
  location?: string | null;
  area_ha?: number | null;
  manager?: string | null;
  farm_type?: string | null;
  gps?: string | null;
  phone?: string | null;
  email?: string | null;
  status?: string | null;
  notes?: string | null;
}

export interface Plot {
  id: string;
  name: string;
  code?: string | null;
  farm_id?: string | null;
  farm_name?: string | null;
  area_ha?: number | null;
  location?: string | null;
  soil_type?: string | null;
  status?: string | null;
  current_crop?: string | null;
  previous_crop?: string | null;
  manager?: string | null;
  gps?: string | null;
  notes?: string | null;
}

export interface Season {
  id: string;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  objectives?: string | null;
  budget?: number | null;
  status?: string | null;
  notes?: string | null;
}

export interface Crop {
  id: string;
  name: string;
  code?: string | null;
  variety?: string | null;
  cycle?: string | null;
  duration_days?: number | null;
  expected_yield?: number | null;
  unit?: string | null;
  status?: string | null;
  notes?: string | null;
}

export interface CropPlan {
  id: string;
  season_id?: string | null;
  season_name?: string | null;
  plot_id?: string | null;
  plot_name?: string | null;
  crop_id?: string | null;
  crop_name?: string | null;
  area_ha?: number | null;
  variety?: string | null;
  planned_sowing?: string | null;
  planned_harvest?: string | null;
  expected_yield?: number | null;
  manager?: string | null;
  status?: string | null;
  notes?: string | null;
}

export interface FarmActivity {
  id: string;
  activity_date?: string | null;
  season_id?: string | null;
  plot_id?: string | null;
  plot_name?: string | null;
  crop?: string | null;
  activity_type?: string | null;
  workers?: number | null;
  equipment?: string | null;
  quantity?: number | null;
  unit?: string | null;
  cost?: number | null;
  manager?: string | null;
  status?: string | null;
  notes?: string | null;
}

export interface Harvest {
  id: string;
  harvest_date?: string | null;
  season_id?: string | null;
  plot_id?: string | null;
  plot_name?: string | null;
  crop?: string | null;
  quantity?: number | null;
  unit?: string | null;
  expected?: number | null;
  quality?: string | null;
  status?: string | null;
  notes?: string | null;
}

export interface ProductionLot {
  id: string;
  code: string;
  product: string;
  quantity?: number | null;
  unit?: string | null;
  harvest_id?: string | null;
  plot_id?: string | null;
  plot_name?: string | null;
  quality?: string | null;
  production_date?: string | null;
  warehouse_id?: string | null;
  status?: string | null;
  notes?: string | null;
}

export interface Warehouse {
  id: string;
  name: string;
  code?: string | null;
  location?: string | null;
  manager?: string | null;
  capacity?: number | null;
  status?: string | null;
  notes?: string | null;
}

export interface InventoryItem {
  id: string;
  name: string;
  code?: string | null;
  category?: string | null;
  unit?: string | null;
  quantity?: number | null;
  reorder_level?: number | null;
  unit_cost?: number | null;
  warehouse_id?: string | null;
  lot_code?: string | null;
  status?: string | null;
  notes?: string | null;
}

export interface InventoryMovement {
  id: string;
  movement_date?: string | null;
  movement_type?: string | null;
  item_id?: string | null;
  item_name?: string | null;
  lot_id?: string | null;
  quantity?: number | null;
  unit?: string | null;
  unit_cost?: number | null;
  reason?: string | null;
  plot_id?: string | null;
  warehouse_id?: string | null;
  reference?: string | null;
  notes?: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  category?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  payment_terms?: string | null;
  status?: string | null;
  notes?: string | null;
}

export interface Purchase {
  id: string;
  reference?: string | null;
  purchase_date?: string | null;
  supplier_id?: string | null;
  supplier_name?: string | null;
  product: string;
  quantity?: number | null;
  unit?: string | null;
  unit_price?: number | null;
  total?: number | null;
  status?: string | null;
  payment_status?: string | null;
  notes?: string | null;
}

export interface Customer {
  id: string;
  name: string;
  customer_type?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  payment_terms?: string | null;
  status?: string | null;
  notes?: string | null;
}

export interface Sale {
  id: string;
  reference?: string | null;
  sale_date?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  product: string;
  lot_code?: string | null;
  quantity?: number | null;
  unit?: string | null;
  unit_price?: number | null;
  total?: number | null;
  status?: string | null;
  payment_status?: string | null;
  delivery_date?: string | null;
  notes?: string | null;
}

export interface Expense {
  id: string;
  expense_date?: string | null;
  category?: string | null;
  season_id?: string | null;
  plot_id?: string | null;
  crop?: string | null;
  description: string;
  amount?: number | null;
  supplier_id?: string | null;
  payment_method?: string | null;
  notes?: string | null;
}

export interface Income {
  id: string;
  income_date?: string | null;
  category?: string | null;
  season_id?: string | null;
  source?: string | null;
  description: string;
  amount?: number | null;
  payment_method?: string | null;
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
