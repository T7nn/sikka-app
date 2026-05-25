import { createClient } from "@supabase/supabase-js";

// Hardcoding the public variables to bypass the Windows .env file issues
const supabaseUrl = "https://rfaudnhanozluohspals.supabase.co";
const supabaseAnonKey = "sb_publishable_ULMYc03gfbHVb2_msneByg_3cczgdb3";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
