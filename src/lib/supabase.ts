import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and Key from env or user settings in localStorage
const storedUrl = localStorage.getItem('sms_supabase_url');
const storedKey = localStorage.getItem('sms_supabase_key');

export const SUPABASE_URL = storedUrl || import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = storedKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    SUPABASE_URL && 
    SUPABASE_ANON_KEY && 
    SUPABASE_URL.startsWith('https://') &&
    SUPABASE_URL.includes('.supabase.co') &&
    SUPABASE_ANON_KEY.length > 20
  );
};

// Initialize client (graceful fallback if keys not yet provided)
export const supabase = createClient(
  isSupabaseConfigured() ? SUPABASE_URL : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured() ? SUPABASE_ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder'
);

/**
 * Upload file helper: uploads to Supabase storage or converts to persistent DataURL for demo
 */
export async function uploadFile(bucket: string, file: File, customPath?: string): Promise<{ url: string | null; error: Error | null }> {
  try {
    if (isSupabaseConfigured()) {
      const ext = file.name.split('.').pop();
      const fileName = customPath || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return { url: publicUrlData.publicUrl, error: null };
    } else {
      // Offline/Local file simulation using DataURL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ url: reader.result as string, error: null });
        };
        reader.onerror = () => {
          resolve({ url: null, error: new Error('Gagal membaca file') });
        };
        reader.readAsDataURL(file);
      });
    }
  } catch (err: any) {
    console.error('Upload error:', err);
    return { url: null, error: err };
  }
}
