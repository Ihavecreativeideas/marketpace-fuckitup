import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.DATABASE_URL?.replace('postgresql://', 'https://').split('@')[1]?.split('/')[0] + '.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'fallback-for-direct-db-connection';

// Create Supabase client (fallback to direct database connection if Supabase not configured)
export const supabase = process.env.SUPABASE_URL ? 
  createClient(supabaseUrl, supabaseAnonKey) : 
  null;

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
};

// Supabase-specific functions (when configured)
export const supabaseStorage = {
  // User management with Supabase Auth
  async signUp(email: string, password: string, metadata?: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Real-time subscription for live updates
  async subscribeToUserData(userId: string, callback: (data: any) => void) {
    if (!supabase) throw new Error('Supabase not configured');
    
    return supabase
      .channel('user-data')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // File storage for user uploads
  async uploadFile(bucket: string, path: string, file: File) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    return data;
  },

  async getFileUrl(bucket: string, path: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
};

export default supabase;