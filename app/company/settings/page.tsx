'use client';

import { PageHeader } from '@/components/PageHeader';

export default function CompanySettingsPage() {
  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Integracja / API" />
      <main className="flex-1 p-4">
        <div className="bg-muted p-6 rounded-lg border">
          <h3 className="font-bold mb-2">Twoje klucze API</h3>
          <p className="text-sm text-muted-foreground mb-4">Użyj tych kluczy do autoryzacji swojego systemu dronowego.</p>
          <div className="bg-background p-2 rounded border font-mono text-xs overflow-x-auto">
            sk_test_51Mz...
          </div>
        </div>
      </main>
    </div>
  );
}
