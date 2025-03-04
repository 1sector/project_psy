import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Test {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  created_at: string;
  created_by: string;
  is_public: boolean;
  price: number | null;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface Option {
  id: string;
  text: string;
  value: number;
}

export interface TestResult {
  id: string;
  test_id: string;
  user_id: string;
  score: number;
  answers: Record<string, string>;
  analysis: string;
  created_at: string;
}

interface TestState {
  tests: Test[];
  userTests: Test[];
  currentTest: Test | null;
  results: TestResult[];
  isLoading: boolean;
  error: string | null;
  fetchTests: () => Promise<void>;
  fetchUserTests: (userId: string) => Promise<void>;
  fetchTestById: (id: string) => Promise<void>;
  createTest: (test: Omit<Test, 'id' | 'created_at'>) => Promise<void>;
  updateTest: (id: string, test: Partial<Test>) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  submitTestResult: (result: Omit<TestResult, 'id' | 'created_at'>) => Promise<void>;
  fetchUserResults: (userId: string) => Promise<void>;
}

export const useTestStore = create<TestState>((set, get) => ({
  tests: [],
  userTests: [],
  currentTest: null,
  results: [],
  isLoading: false,
  error: null,

  fetchTests: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('is_public', true);

      if (error) throw error;
      set({ tests: data as Test[], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchUserTests: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('created_by', userId);

      if (error) throw error;
      set({ userTests: data as Test[], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchTestById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentTest: data as Test, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createTest: async (test) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('tests')
        .insert([test])
        .select();

      if (error) throw error;
      
      const newTest = data[0] as Test;
      set((state) => ({ 
        tests: [...state.tests, newTest],
        userTests: [...state.userTests, newTest],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateTest: async (id, test) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('tests')
        .update(test)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      const updatedTest = data[0] as Test;
      set((state) => ({
        tests: state.tests.map(t => t.id === id ? updatedTest : t),
        userTests: state.userTests.map(t => t.id === id ? updatedTest : t),
        currentTest: state.currentTest?.id === id ? updatedTest : state.currentTest,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteTest: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        tests: state.tests.filter(t => t.id !== id),
        userTests: state.userTests.filter(t => t.id !== id),
        currentTest: state.currentTest?.id === id ? null : state.currentTest,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  submitTestResult: async (result) => {
    try {
      set({ isLoading: true, error: null });
      
      // Calculate analysis based on the test and answers
      // This is a simplified example - in a real app, you'd have more complex analysis logic
      const test = get().tests.find(t => t.id === result.test_id) || 
                  get().userTests.find(t => t.id === result.test_id);
      
      if (!test) throw new Error("Test not found");
      
      let analysis = "";
      if (result.score < 30) {
        analysis = "Low score: Consider consulting with a specialist for further evaluation.";
      } else if (result.score < 70) {
        analysis = "Medium score: Some areas may need attention. Follow-up recommended.";
      } else {
        analysis = "High score: Results indicate positive psychological well-being.";
      }
      
      const resultWithAnalysis = {
        ...result,
        analysis
      };
      
      const { data, error } = await supabase
        .from('test_results')
        .insert([resultWithAnalysis])
        .select();

      if (error) throw error;
      
      const newResult = data[0] as TestResult;
      set((state) => ({ 
        results: [...state.results, newResult],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchUserResults: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('test_results')
        .select('*, tests(title)')
        .eq('user_id', userId);

      if (error) throw error;
      set({ results: data as TestResult[], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));