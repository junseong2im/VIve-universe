'use client';

import { SlotProvider } from '@/contexts/SlotContext';
import { UserProvider } from '@/contexts/UserContext';
import { DeepWorkProvider } from '@/contexts/DeepWorkContext';
import { DataInitializer } from './DataInitializer';
import { NicknameModal } from './NicknameModal';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SlotProvider>
      <UserProvider>
        <DeepWorkProvider>
          <DataInitializer />
          <NicknameModal />
          {children}
        </DeepWorkProvider>
      </UserProvider>
    </SlotProvider>
  );
}
