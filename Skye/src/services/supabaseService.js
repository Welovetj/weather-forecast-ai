import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../constants/api';

const SEARCHES_TABLE = 'searches';

const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.');
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

const normalizeSearchRecord = (record) => ({
  id: record?.id ?? null,
  location: record?.location ?? null,
  latitude: record?.latitude ?? null,
  longitude: record?.longitude ?? null,
  date_from: record?.date_from ?? null,
  date_to: record?.date_to ?? null,
  temp_min: record?.temp_min ?? null,
  temp_max: record?.temp_max ?? null,
  condition: record?.condition ?? null,
  unit: record?.unit ?? null,
  created_at: record?.created_at ?? null,
});

export const syncSearchesToSupabase = async (records) => {
  if (!Array.isArray(records) || records.length === 0) {
    return { synced: 0 };
  }

  const supabase = getSupabaseClient();
  const payload = records.map(normalizeSearchRecord);

  const { error } = await supabase
    .from(SEARCHES_TABLE)
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    throw new Error(`Supabase sync failed: ${error.message}`);
  }

  return { synced: payload.length };
};

export const fetchSearchesFromSupabase = async () => {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(SEARCHES_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Supabase fetch failed: ${error.message}`);
  }

  return Array.isArray(data) ? data : [];
};

export { isSupabaseConfigured };
