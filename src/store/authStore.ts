import { create } from 'zustand';
import { supabase, signIn, signUp, signOut, getCurrentUser } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  role: 'psychologist' | 'client';
  name?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'psychologist' | 'client', name: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true });
      const { data, error } = await getCurrentUser();
      
      if (error) {
        throw error;
      }

      if (data?.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            role: data.user.user_metadata.role,
            name: data.user.user_metadata.name,
          },
          isLoading: false,
        });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }

      if (data?.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            role: data.user.user_metadata.role,
            name: data.user.user_metadata.name,
          },
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  register: async (email, password, role, name) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await signUp(email, password, { role, name });
      
      if (error) {
        throw error;
      }

      if (data?.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            role,
            name,
          },
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      const { error } = await signOut();
      
      if (error) {
        throw error;
      }
      
      set({ user: null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));