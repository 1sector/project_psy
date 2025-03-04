import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Client {
  id: string;
  psychologist_id: string;
  user_id: string;
  name: string;
  email: string;
  notes: string;
  created_at: string;
}

export interface Session {
  id: string;
  client_id: string;
  date: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

interface ClientState {
  clients: Client[];
  currentClient: Client | null;
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  fetchClients: (psychologistId: string) => Promise<void>;
  fetchClientById: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'created_at'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  fetchClientSessions: (clientId: string) => Promise<void>;
  addSession: (session: Omit<Session, 'id' | 'created_at'>) => Promise<void>;
  updateSession: (id: string, session: Partial<Session>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  currentClient: null,
  sessions: [],
  isLoading: false,
  error: null,

  fetchClients: async (psychologistId) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('psychologist_id', psychologistId);

      if (error) throw error;
      set({ clients: data as Client[], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchClientById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentClient: data as Client, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addClient: async (client) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select();

      if (error) throw error;
      
      const newClient = data[0] as Client;
      set((state) => ({ 
        clients: [...state.clients, newClient],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateClient: async (id, client) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      const updatedClient = data[0] as Client;
      set((state) => ({
        clients: state.clients.map(c => c.id === id ? updatedClient : c),
        currentClient: state.currentClient?.id === id ? updatedClient : state.currentClient,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteClient: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        clients: state.clients.filter(c => c.id !== id),
        currentClient: state.currentClient?.id === id ? null : state.currentClient,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchClientSessions: async (clientId) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });

      if (error) throw error;
      set({ sessions: data as Session[], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addSession: async (session) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('sessions')
        .insert([session])
        .select();

      if (error) throw error;
      
      const newSession = data[0] as Session;
      set((state) => ({ 
        sessions: [...state.sessions, newSession],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateSession: async (id, session) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('sessions')
        .update(session)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      const updatedSession = data[0] as Session;
      set((state) => ({
        sessions: state.sessions.map(s => s.id === id ? updatedSession : s),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteSession: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));