import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  description: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'basic' | 'premium' | 'professional';
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  created_at: string;
}

interface PaymentState {
  payments: Payment[];
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  fetchPayments: (userId: string) => Promise<void>;
  createPayment: (payment: Omit<Payment, 'id' | 'created_at'>) => Promise<void>;
  fetchSubscription: (userId: string) => Promise<void>;
  createSubscription: (subscription: Omit<Subscription, 'id' | 'created_at'>) => Promise<void>;
  cancelSubscription: (id: string) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  subscription: null,
  isLoading: false,
  error: null,

  fetchPayments: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ payments: data as Payment[], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createPayment: async (payment) => {
    try {
      set({ isLoading: true, error: null });
      
      // In a real app, you would integrate with a payment processor here
      // This is just a simulation
      const simulatedPayment = {
        ...payment,
        status: 'completed' as const
      };
      
      const { data, error } = await supabase
        .from('payments')
        .insert([simulatedPayment])
        .select();

      if (error) throw error;
      
      const newPayment = data[0] as Payment;
      set((state) => ({ 
        payments: [...state.payments, newPayment],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchSubscription: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" which is fine
        throw error;
      }
      
      set({ subscription: data as Subscription | null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createSubscription: async (subscription) => {
    try {
      set({ isLoading: true, error: null });
      
      // In a real app, you would integrate with a subscription service here
      // This is just a simulation
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([subscription])
        .select();

      if (error) throw error;
      
      const newSubscription = data[0] as Subscription;
      set({ subscription: newSubscription, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  cancelSubscription: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select();

      if (error) throw error;
      
      set({ subscription: data[0] as Subscription, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));