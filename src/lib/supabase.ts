import { createClient } from "@supabase/supabase-js";

// Replace these with your Supabase project credentials
const supabaseUrl = "https://qvvkqfotedgzssgbnose.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dmtxZm90ZWRnenNzZ2Jub3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2Nzg1MjUsImV4cCI6MjA4MzI1NDUyNX0.PR2Q0szbMgne4HacvT3tYc8kOr-rfRNQTSf9eRm5Bdc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
