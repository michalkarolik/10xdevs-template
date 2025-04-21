import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/supabase-js';

// Load environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Setup drizzle with the Supabase client
export const db = {
  // Direct supabase client access for RPC calls and other features
  supabase: supabaseClient,
  
  // Query builder wrapper for common database operations
  query: {
    topics: {
      async findMany({ orderBy = null } = {}) {
        let query = supabaseClient
          .from('topics')
          .select('id, name, user_id, created_at, updated_at');
        
        if (orderBy) {
          // In this case, we're expecting something like { desc: 'createdAt' }
          const direction = Object.keys(orderBy)[0];
          const column = orderBy[direction];
          query = query.order(column, { ascending: direction !== 'desc' });
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching topics:', error);
          throw new Error(error.message);
        }
        
        return data || [];
      }
    },
    // Add other tables/models as needed
  }
};

// Export a helper to create a new database connection with a specific user token
export const createAuthenticatedClient = (token: string) => {
  const client = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
  return client;
};
