import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase environment variables are missing. ' +
    'Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Type definitions
export interface User {
  id: string;
  name: string;
  phone: string | null;
  village: string | null;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  crop: string;
  quantity: number;
  unit: 'kg' | 'quintal' | 'tonne';
  expected_price: number;
  ready_date: string | null;
  description: string | null;
  photos: string[];
  village: string | null;
  district: string;
  state: string;
  status: 'active' | 'sold' | 'expired';
  views: number;
  created_at: string;
  expires_at: string;
}

export interface Interest {
  id: string;
  listing_id: string;
  buyer_id: string;
  created_at: string;
}
