import { createClient } from "@supabase/supabase-js";

// Replace these with your Supabase project credentials
const supabaseUrl = "https://qvvkqfotedgzssgbnose.supabase.co";
const supabaseAnonKey = "sb_publishable_fAfXBT-lJGiE5ZRwyvKhWQ_w0mL8XNw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
