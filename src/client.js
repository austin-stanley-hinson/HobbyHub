import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL;
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// One shared Supabase client for the whole app
export const supabase = createClient(URL, PUBLISHABLE_KEY);
