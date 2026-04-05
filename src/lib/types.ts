export type UserRole = 'agent' | 'broker' | 'fsbo' | 'admin'
export type UserPlan = 'free' | 'basic' | 'pro' | 'enterprise'
export type PropertyStatus = 'active' | 'pending' | 'sold' | 'withdrawn' | 'cancelled' | 'draft'
export type PropertyType = 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'land' | 'commercial'
export type ShowingStatus = 'pending' | 'approved' | 'denied' | 'completed' | 'cancelled'
export type ContractType = 'listing_agreement' | 'purchase_offer' | 'counteroffer'
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'executed' | 'expired'

export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  role: UserRole
  license_number: string | null
  license_state: string | null
  brokerage_name: string | null
  verified: boolean
  plan: UserPlan
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  mls_id: string
  owner_id: string
  status: PropertyStatus
  address: string
  city: string
  state: string
  zip: string
  county: string | null
  lat: number | null
  lng: number | null
  price: number
  price_history: { date: string; price: number }[]
  bedrooms: number
  bathrooms: number
  sqft: number
  lot_size: number | null
  year_built: number | null
  property_type: PropertyType
  description: string | null
  features: string[]
  photos: string[]
  virtual_tour_url: string | null
  listing_date: string
  expiration_date: string | null
  days_on_market: number
  showing_instructions: string | null
  commission_rate: number | null
  created_at: string
  updated_at: string
  // Joined fields
  owner?: Profile
}

export interface Showing {
  id: string
  property_id: string
  requesting_agent_id: string
  listing_agent_id: string
  requested_date: string
  requested_time: string
  status: ShowingStatus
  notes: string | null
  feedback: string | null
  created_at: string
  property?: Property
  requesting_agent?: Profile
  listing_agent?: Profile
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  property_id: string | null
  subject: string
  body: string
  read: boolean
  created_at: string
  sender?: Profile
  recipient?: Profile
}

export interface Contract {
  id: string
  property_id: string
  agent_id: string
  client_id: string
  contract_type: ContractType
  state: string
  status: ContractStatus
  document_url: string | null
  created_at: string
  signed_at: string | null
  property?: Property
  agent?: Profile
}

export interface CmaReport {
  id: string
  agent_id: string
  property_id: string
  comparable_properties: { property_id: string; adjustments: Record<string, number> }[]
  suggested_price: number
  price_range_low: number
  price_range_high: number
  report_url: string | null
  created_at: string
  property?: Property
}

export interface TradesProfessional {
  id: string
  name: string
  company: string
  category: string
  phone: string | null
  email: string | null
  website: string | null
  state: string
  city: string
  zip: string
  verified: boolean
  rating: number
  review_count: number
}

export interface SavedSearch {
  id: string
  user_id: string
  name: string
  criteria: Record<string, unknown>
  notification_frequency: 'instant' | 'daily' | 'weekly' | 'never'
}
