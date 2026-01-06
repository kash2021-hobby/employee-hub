import { createClient } from "@supabase/supabase-js";

// Replace these with your Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://qvvkqfotedgzssgbnose.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_fAfXBT-lJGiE5ZRwyvKhWQ_w0mL8XNw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
