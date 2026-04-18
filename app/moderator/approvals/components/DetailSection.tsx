'use client';

import { ReactNode } from 'react';

interface DetailSectionProps {
  label: string;
  children: ReactNode;
}

export function DetailSection({ label, children }: DetailSectionProps) {
  return (
    <section className="space-y-2">
      <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
        {label}
      </p>
      {children}
    </section>
  );
}
