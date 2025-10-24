/**
 * Navigation Context
 *
 * Global navigation state management for route transitions,
 * loading states, and navigation preferences.
 */

'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  useEffect,
} from 'react';
import { usePathname } from 'next/navigation';
import {
  type TransitionVariant,
  type NavigationDirection,
  getNavigationDirection,
  getTransitionForRoute,
} from '@/lib/route-transitions';

export interface NavigationState {
  currentRoute: string;
  previousRoute: string | null;
  direction: NavigationDirection;
  transitionVariant: TransitionVariant;
  isNavigating: boolean;
  history: string[];
  scrollPositions: Map<string, number>;
}

export interface NavigationPreferences {
  enableTransitions: boolean;
  enableProgressBar: boolean;
  enablePrefetch: boolean;
  transitionDuration: number;
}

interface NavigationContextValue {
  state: NavigationState;
  preferences: NavigationPreferences;
  setPreference: <K extends keyof NavigationPreferences>(
    key: K,
    value: NavigationPreferences[K]
  ) => void;
  navigate: (path: string) => void;
  goBack: () => void;
  saveScrollPosition: (path: string, position: number) => void;
  getScrollPosition: (path: string) => number | undefined;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

/**
 * Navigation Provider Component
 */
export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [state, setState] = useState<NavigationState>({
    currentRoute: pathname,
    previousRoute: null,
    direction: 'forward',
    transitionVariant: 'fade',
    isNavigating: false,
    history: [pathname],
    scrollPositions: new Map(),
  });

  const [preferences, setPreferences] = useState<NavigationPreferences>({
    enableTransitions: true,
    enableProgressBar: true,
    enablePrefetch: true,
    transitionDuration: 300,
  });

  // Update state when pathname changes
  useEffect(() => {
    if (pathname !== state.currentRoute) {
      const direction = getNavigationDirection(state.currentRoute, pathname);
      const transitionVariant = getTransitionForRoute(pathname, state.currentRoute);

      setState((prev) => ({
        ...prev,
        previousRoute: prev.currentRoute,
        currentRoute: pathname,
        direction,
        transitionVariant,
        history: [...prev.history, pathname],
        isNavigating: false,
      }));
    }
  }, [pathname, state.currentRoute]);

  // Set preference
  const setPreference = useCallback(
    <K extends keyof NavigationPreferences>(
      key: K,
      value: NavigationPreferences[K]
    ) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: value,
      }));

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('navigation-preferences');
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem(
          'navigation-preferences',
          JSON.stringify({ ...parsed, [key]: value })
        );
      }
    },
    []
  );

  // Navigate to path
  const navigate = useCallback((path: string) => {
    setState((prev) => ({
      ...prev,
      isNavigating: true,
    }));
  }, []);

  // Go back in history
  const goBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  }, []);

  // Save scroll position for route
  const saveScrollPosition = useCallback((path: string, position: number) => {
    setState((prev) => {
      const newScrollPositions = new Map(prev.scrollPositions);
      newScrollPositions.set(path, position);
      return {
        ...prev,
        scrollPositions: newScrollPositions,
      };
    });
  }, []);

  // Get saved scroll position for route
  const getScrollPosition = useCallback(
    (path: string) => {
      return state.scrollPositions.get(path);
    },
    [state.scrollPositions]
  );

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('navigation-preferences');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPreferences((prev) => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Failed to parse navigation preferences:', error);
        }
      }
    }
  }, []);

  const value: NavigationContextValue = {
    state,
    preferences,
    setPreference,
    navigate,
    goBack,
    saveScrollPosition,
    getScrollPosition,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

/**
 * Hook to access navigation context
 */
export function useNavigation() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }

  return context;
}

/**
 * Hook to check if currently navigating
 */
export function useIsNavigating() {
  const { state } = useNavigation();
  return state.isNavigating;
}

/**
 * Hook to get current navigation direction
 */
export function useNavigationDirection() {
  const { state } = useNavigation();
  return state.direction;
}

/**
 * Hook to get current transition variant
 */
export function useTransitionVariant() {
  const { state } = useNavigation();
  return state.transitionVariant;
}

/**
 * Hook to manage navigation preferences
 */
export function useNavigationPreferences() {
  const { preferences, setPreference } = useNavigation();
  return { preferences, setPreference };
}
