import { PageHeader } from '@/components/PageHeader';
import { PasswordForm } from '@/components/settings/PasswordForm';

export default function SettingsPage() {
  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Ustawienia konta" />

      <main className="flex-1 p-4">
        <PasswordForm />
      </main>
    </div>
  );
}
