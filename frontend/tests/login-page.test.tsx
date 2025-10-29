import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import LoginPage from '@/app/login/page';

const loginSpy = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (state: any) => unknown) =>
    selector({
      login: loginSpy,
      logout: vi.fn(),
    }),
}));

const authServiceMock = {
  login: vi.fn().mockResolvedValue({ access_token: 'token', token_type: 'bearer' }),
  getCurrentUser: vi.fn().mockResolvedValue({ id: 1, username: 'demo' }),
};

vi.mock('@/lib/api', () => ({
  authService: authServiceMock,
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: toastSuccess,
    error: toastError,
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const locationMock = { href: '' } as Location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: locationMock,
      writable: true,
    });
  });

  it('submits credentials and stores the session', async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'demo' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'secret' } });

    fireEvent.click(screen.getByRole('button', { name: /ログイン/i }));

    await waitFor(() => {
      expect(authServiceMock.login).toHaveBeenCalledWith('demo', 'secret');
    });

    expect(authServiceMock.getCurrentUser).toHaveBeenCalledWith('token');
    expect(loginSpy).toHaveBeenCalledWith('token', { id: 1, username: 'demo' });
    expect(toastSuccess).toHaveBeenCalled();
    expect(window.location.href).toBe('/dashboard');
  });
});
