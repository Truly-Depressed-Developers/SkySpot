'use client';

import { PageHeader } from '@/components/PageHeader';

export default function NewSpotPage() {
  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Dodaj lądowisko" />
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <p className="mb-6 text-muted-foreground">Wypełnij formularz, aby zgłosić nowe miejsce do lądowania.</p>
        {/* Tu znajdzie się LandingSpotForm */}
        <div className="space-y-4 opacity-50">
          <div className="h-10 bg-muted rounded animate-pulse" />
          <div className="h-40 bg-muted rounded animate-pulse" />
          <div className="h-10 bg-muted rounded animate-pulse" />
        </div>
      </main>
    </div>
  );
}
