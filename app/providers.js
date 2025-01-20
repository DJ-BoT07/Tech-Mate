'use client';

import { AuthProvider } from '../lib/context/AuthContext';
import { DatabaseProvider } from '../lib/context/DatabaseContext';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <DatabaseProvider>
        {children}
      </DatabaseProvider>
    </AuthProvider>
  );
} 