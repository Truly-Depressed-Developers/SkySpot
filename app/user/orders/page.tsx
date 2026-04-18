'use client';

import { PageHeader } from '@/components/PageHeader';

export default function CompanyOrdersPage() {
  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Zlecenia firmy" />
      <main className="flex-1 p-4">
        <p className="text-muted-foreground">Lista aktualnie realizowanych i zakończonych dostaw.</p>
      </main>
    </div>
  );
}
