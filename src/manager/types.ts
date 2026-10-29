// Row shapes of the Supabase tables used by the manager (see supabase/migrations).
export type Role = 'owner' | 'admin' | 'reception' | 'professional'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rejected' | 'expired'

export type Center = {
  id: string
  name: string
  slug: string
  timezone: string
  currency: string
  locale: string
  phone: string | null
  email: string | null
  address: string | null
  slot_interval_minutes: number
  min_notice_minutes: number
  max_advance_days: number
  cancellation_hours: number
  cancellation_policy: string | null
  online_booking_enabled: boolean
  online_requires_approval: boolean
}

export type Staff = {
  id: string
  center_id: string
  user_id: string | null
  display_name: string
  email: string | null
  phone: string | null
  role_title: string | null
  color: string
  bookable: boolean
  commission_percent: number
  active: boolean
}

export type Resource = { id: string; center_id: string; name: string; kind: string; active: boolean }

export type Service = {
  id: string
  center_id: string
  name: string
  category: string | null
  description: string | null
  duration_minutes: number
  buffer_minutes: number
  price_cents: number
  color: string
  online_bookable: boolean
  active: boolean
}

export type Client = {
  id: string
  center_id: string
  name: string
  phone: string | null
  email: string | null
  operational_notes: string | null
  marketing_consent_at: string | null
  anonymized_at: string | null
  created_at: string
}

export type Appointment = {
  id: string
  center_id: string
  client_id: string
  service_id: string
  staff_id: string
  resource_id: string | null
  starts_at: string
  ends_at: string
  block_ends_at: string
  status: BookingStatus
  service_name_snapshot: string
  duration_snapshot_minutes: number
  buffer_snapshot_minutes: number
  price_snapshot_cents: number
  notes: string | null
  source: 'staff' | 'online' | 'whatsapp' | 'import'
  cancel_reason: string | null
  public_token: string
  material_cost_cents: number | null
  commission_cents: number | null
  created_at: string
}

export type Payment = {
  id: string
  center_id: string
  appointment_id: string | null
  client_id: string | null
  amount_cents: number
  currency: string
  method: 'cash' | 'card' | 'transfer' | 'online' | 'other'
  status: string
  kind: 'charge' | 'refund'
  refunds_payment_id: string | null
  note: string | null
  created_at: string
}

export type OpeningHour = { id: string; center_id: string; weekday: number; opens_at: string; closes_at: string }
export type Closure = { id: string; center_id: string; starts_on: string; ends_on: string; reason: string | null }
export type WorkingHour = { id: string; center_id: string; staff_id: string; weekday: number; starts_at: string; ends_at: string; active: boolean }
export type TimeOff = { id: string; center_id: string; staff_id: string; starts_at: string; ends_at: string; reason: string | null }
export type Link = { service_id: string; staff_id?: string; resource_id?: string }

export type Product = {
  id: string
  center_id: string
  name: string
  sku: string | null
  unit: string
  quantity: number
  low_stock_threshold: number
  cost_per_unit_cents: number
  active: boolean
}

export type MovementType = 'purchase' | 'use' | 'adjustment' | 'waste' | 'return'
export type StockMovement = {
  id: string
  product_id: string
  movement_type: MovementType
  quantity_delta: number
  unit_cost_cents: number | null
  notes: string | null
  appointment_id: string | null
  created_at: string
}

export type ServiceMaterial = { center_id: string; service_id: string; product_id: string; quantity: number }

export type Expense = {
  id: string
  center_id: string
  description: string
  category: string
  amount_cents: number
  incurred_on: string
  recurring: boolean
  notes: string | null
}

type Count = { count: number; revenue: number; commissions: number; minutes: number }
export type BusinessReport = {
  from: string
  to: string
  collected_cents: number
  refunds_cents: number
  billed_cents: number
  material_cost_cents: number
  commission_cents: number
  expenses_cents: number
  expenses_by_category: Record<string, number>
  appointments: { completed: number; cancelled: number; no_show: number; upcoming: number; online: number }
  capacity_minutes: number
  booked_minutes: number
  by_service: (Count & { service_id: string; name: string; materials: number })[]
  by_staff: (Count & { staff_id: string; name: string; no_show: number })[]
  heatmap: { dow: number; hour: number; minutes: number }[]
  low_stock: { name: string; quantity: number; unit: string; threshold: number }[]
}
