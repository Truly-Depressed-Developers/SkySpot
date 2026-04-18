'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type NavbarContextType = {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
};

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <NavbarContext.Provider value={{ isVisible, setIsVisible }}>{children}</NavbarContext.Provider>
  );
}

export function useNavbar() {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
}
