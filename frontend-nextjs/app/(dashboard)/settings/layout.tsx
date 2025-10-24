import { ReactNode } from 'react';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {children}
    </div>
  );
}
