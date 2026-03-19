import { supabase } from '../lib/supabase';
import { User } from '../types';

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as User[];
};

export const updateUser = async (id: string, updates: { name?: string; role?: string }) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role: string;
}) => {
  // Save current admin session before signUp (signUp changes the active session)
  const { data: { session: currentSession } } = await supabase.auth.getSession();

  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
        role: userData.role,
      },
    },
  });

  if (error) throw error;

  // Restore the admin session so the admin doesn't get logged out
  if (currentSession) {
    await supabase.auth.setSession({
      access_token: currentSession.access_token,
      refresh_token: currentSession.refresh_token,
    });
  }

  return data;
};

export const deleteUser = async (id: string) => {
  // First delete the profile
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (profileError) throw profileError;

  // Then try to delete the auth user via admin endpoint
  // Note: This requires service_role key or an edge function.
  // For now, we delete the profile; the orphaned auth user
  // will fail to login since the profile check in AuthContext
  // will block access without a profile row.
};

