import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'URL';
const supabaseAnonKey = 'KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
