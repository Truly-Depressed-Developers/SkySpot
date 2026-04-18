'use client';

import { PageHeader } from '@/components/PageHeader';

export default function MyReportsPage() {
  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Moje zgłoszenia" />
      <main className="flex-1 p-4">
        <p className="text-muted-foreground text-center mt-10">Nie masz jeszcze żadnych zgłoszonych lądowisk.</p>
      </main>
    </div>
  );
}
