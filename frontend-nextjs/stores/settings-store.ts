'use client';

import { create } from 'zustand';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface SettingsState {
  visibilityEnabled: boolean;
  isLoading: boolean;
  setVisibilityEnabled: (enabled: boolean) => void;
  fetchVisibilityToggle: () => Promise<void>;
  updateVisibilityToggle: (enabled: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  visibilityEnabled: true,
  isLoading: false,

  setVisibilityEnabled: (enabled) => set({ visibilityEnabled: enabled }),

  fetchVisibilityToggle: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/visibility`);
      if (!response.ok) {
        throw new Error('Failed to fetch visibility toggle');
      }
      const data = await response.json();
      set({ visibilityEnabled: data.enabled, isLoading: false });
    } catch (error) {
      console.error('Error fetching visibility toggle:', error);
      set({ isLoading: false });
    }
  },

  updateVisibilityToggle: async (enabled: boolean) => {
    set({ isLoading: true });
    try {
      // Check if running on server-side
      if (typeof window === 'undefined') {
        console.warn('Cannot access localStorage on server-side');
        set({ isLoading: false });
        return;
      }

      const token = localStorage.getItem('auth-storage');
      const authData = token ? JSON.parse(token) : null;
      const accessToken = authData?.state?.token;

      const response = await fetch(`${API_BASE_URL}/api/settings/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) {
        throw new Error('Failed to update visibility toggle');
      }

      const data = await response.json();
      set({ visibilityEnabled: data.enabled, isLoading: false });
    } catch (error) {
      console.error('Error updating visibility toggle:', error);
      set({ isLoading: false });
      throw error;
    }
  },
}));
