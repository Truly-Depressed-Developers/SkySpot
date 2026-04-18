'use client';

import { PageHeader } from '@/components/PageHeader';

export default function MapPage() {
  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Mapa lądowisk" />
      <main className="flex-1 flex items-center justify-center border-2 border-dashed rounded-lg mt-4">
        <p className="text-muted-foreground">Tutaj pojawi się interaktywna mapa z lądowiskami i dronami</p>
      </main>
    </div>
  );
}
