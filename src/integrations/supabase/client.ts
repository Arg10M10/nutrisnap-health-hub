import { createClient } from '@supabase/supabase-js';
import CapacitorStorage from '@/lib/capacitorStorage';

const SUPABASE_URL = "https://ttuhcqlimhdjcyfglnsw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dWhjcWxpbWhkamN5ZmdsbnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Njk3MzgsImV4cCI6MjA4MDA0NTczOH0.BOxiBDq_vyxDdH2-JUfKSYCrdsibyG9S-yl6tzt3tvg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: CapacitorStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Importante para apps nativas para evitar conflictos con deep links
  },
});