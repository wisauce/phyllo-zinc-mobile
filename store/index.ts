import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

// Export API_BASE_URL for use in other files
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://phyllo-zinc-final-deployment.vercel.app';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
}

export interface Session {
  user: User;
  token: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
  categoryName?: string;
  createdAt?: string;
  readTime?: string;
  status?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Auth Store
interface AuthState {
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isLoading: true,
  isAdmin: false,
  
  setSession: (session) => {
    set({ 
      session, 
      isAdmin: session?.user?.emailVerified || false 
    });
  },

  signIn: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Sign in failed' };
      }

      const session: Session = {
        user: data.user,
        token: data.token || data.session?.token,
      };

      await AsyncStorage.setItem('session', JSON.stringify(session));
      set({ 
        session, 
        isAdmin: session.user?.emailVerified || false 
      });

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  signUp: async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Sign up failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  signOut: async () => {
    try {
      await AsyncStorage.removeItem('session');
      set({ session: null, isAdmin: false });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  loadSession: async () => {
    try {
      const sessionStr = await AsyncStorage.getItem('session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr) as Session;
        set({ 
          session, 
          isAdmin: session.user?.emailVerified || false,
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Load session error:', error);
      set({ isLoading: false });
    }
  },
}));

// Articles Store
interface ArticlesState {
  articles: Article[];
  isLoading: boolean;
  error: string | null;
  fetchArticles: () => Promise<void>;
  getArticleById: (id: string) => Article | undefined;
  createArticle: (article: Omit<Article, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateArticle: (id: string, article: Partial<Article>) => Promise<{ success: boolean; error?: string }>;
  deleteArticle: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const useArticlesStore = create<ArticlesState>((set, get) => ({
  articles: [],
  isLoading: false,
  error: null,

  fetchArticles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles`, {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json();
      set({ articles: data, isLoading: false });
    } catch (error) {
      console.error('Fetch articles error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch articles',
        isLoading: false 
      });
    }
  },

  getArticleById: (id) => {
    return get().articles.find(article => article.id === id);
  },

  createArticle: async (article) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      });

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.message || 'Failed to create article' };
      }

      await get().fetchArticles();
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  updateArticle: async (id, article) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      });

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.message || 'Failed to update article' };
      }

      await get().fetchArticles();
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  deleteArticle: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.message || 'Failed to delete article' };
      }

      await get().fetchArticles();
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
}));

// Chat Store
interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (message: ChatMessage) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: '1',
      content: "Hello! I'm here to help you learn about our green synthesis research. What would you like to know?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ],
  isLoading: false,

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  sendMessage: async (content) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    set((state) => ({ 
      messages: [...state.messages, userMessage],
      isLoading: true 
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.text || "Sorry, I couldn't generate a response.",
        role: 'assistant',
        timestamp: new Date(),
      };

      set((state) => ({ 
        messages: [...state.messages, botMessage],
        isLoading: false 
      }));
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        content: "Oops! Something went wrong while connecting to the AI service.",
        role: 'assistant',
        timestamp: new Date(),
      };

      set((state) => ({ 
        messages: [...state.messages, errorMessage],
        isLoading: false 
      }));
    }
  },

  clearMessages: () => {
    set({
      messages: [
        {
          id: '1',
          content: "Hello! I'm here to help you learn about our green synthesis research. What would you like to know?",
          role: 'assistant',
          timestamp: new Date(),
        },
      ],
    });
  },
}));

// Virtual Lab Store
interface VirtualLabState {
  currentScene: number;
  globalState: {
    leavesCollected: boolean;
    isGrounded: boolean;
    solventMixed: boolean;
    macerationDone: boolean;
    extractFiltered: boolean;
    zincPrepared: boolean;
    finalMixDone: boolean;
    applicationMethod: string | null;
  };
  setCurrentScene: (scene: number) => void;
  updateState: (key: string, value: any) => void;
  setScene: (scene: number) => void;
  nextScene: () => void;
  prevScene: () => void;
  resetLab: () => void;
  completeScene: (sceneIndex: number) => void;
}

const initialGlobalState = {
  leavesCollected: false,
  isGrounded: false,
  solventMixed: false,
  macerationDone: false,
  extractFiltered: false,
  zincPrepared: false,
  finalMixDone: false,
  applicationMethod: null,
};

export const useVirtualLabStore = create<VirtualLabState>((set) => ({
  currentScene: 0,
  globalState: { ...initialGlobalState },

  setCurrentScene: (scene) => set({ currentScene: scene }),
  setScene: (scene) => set({ currentScene: scene }),
  
  updateState: (key, value) => set((state) => ({
    globalState: { ...state.globalState, [key]: value }
  })),
  
  nextScene: () => set((state) => ({ 
    currentScene: Math.min(6, state.currentScene + 1) 
  })),
  
  prevScene: () => set((state) => ({ 
    currentScene: Math.max(0, state.currentScene - 1) 
  })),

  completeScene: (sceneIndex) => set((state) => {
    const stateUpdates: Record<number, Partial<typeof initialGlobalState>> = {
      0: { leavesCollected: true },
      1: { isGrounded: true },
      2: { solventMixed: true },
      3: { macerationDone: true },
      4: { extractFiltered: true },
      5: { zincPrepared: true },
      6: { finalMixDone: true },
    };
    return {
      currentScene: Math.min(6, sceneIndex + 1),
      globalState: { 
        ...state.globalState, 
        ...stateUpdates[sceneIndex] 
      },
    };
  }),

  resetLab: () => set({
    currentScene: 0,
    globalState: { ...initialGlobalState },
  }),
}));
