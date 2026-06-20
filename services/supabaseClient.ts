import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://vemiyhvwyhjezgsolzag.supabase.co';
const supabaseAnonKey = 'sb_publishable_MxWdeQkE62kZEcF7XxyJvw_QdhfyTae';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);