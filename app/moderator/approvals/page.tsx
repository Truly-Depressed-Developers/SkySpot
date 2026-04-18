'use client';

import { PageHeader } from '@/components/PageHeader';

export default function ModeratorApprovalsPage() {
  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Akceptacja lądowisk" />
      <main className="flex-1 p-4">
        <p className="text-muted-foreground">Kolejka zgłoszeń do weryfikacji przez moderatora.</p>
      </main>
    </div>
  );
}
