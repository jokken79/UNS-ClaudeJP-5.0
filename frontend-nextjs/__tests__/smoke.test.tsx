import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Home from '@/app/page';

const mockRouter = { push: vi.fn() };

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (state: any) => unknown) =>
    selector({
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      token: null,
      user: null,
    }),
}));

describe('Home smoke test', () => {
  it('renders loading spinner for unauthenticated users', async () => {
    const { container } = render(<Home />);

    expect(container.querySelector('.animate-spin')).toBeTruthy();

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });
});
