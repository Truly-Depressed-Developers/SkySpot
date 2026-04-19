'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { trpc } from '@/trpc/client';
import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { CopyIcon, EyeIcon, EyeSlashIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { CompanyApiKeyDTO, CreatedCompanyApiKeyDTO } from '@/types/dtos/companyApiKey';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function maskSecret(secretPrefix: string, secretLast4: string) {
  return `${secretPrefix}${'•'.repeat(12)}${secretLast4}`;
}

export default function CompanySettingsPage() {
  const { data: session } = useSession();
  const isProvider = session?.user?.role === UserRole.DRONE_PROVIDER;
  const deliveriesQuery = trpc.delivery.getAll.useQuery(undefined, {
    enabled: isProvider,
  });
  const apiKeysQuery = trpc.companyApiKey.getMine.useQuery(undefined, {
    enabled: isProvider,
  });
  const createApiKeyMutation = trpc.companyApiKey.create.useMutation();
  const revealApiKeyMutation = trpc.companyApiKey.revealSecret.useMutation();
  const deleteApiKeyMutation = trpc.companyApiKey.delete.useMutation();
  const utils = trpc.useUtils();

  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<CreatedCompanyApiKeyDTO | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [secretValues, setSecretValues] = useState<Record<string, string>>({});
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  const apiKeys: CompanyApiKeyDTO[] = apiKeysQuery.data ?? [];

  const currentSecretById = useMemo(() => {
    const map = new Map<string, string>();

    if (generatedKey) {
      map.set(generatedKey.id, generatedKey.secret);
    }

    for (const [keyId, secret] of Object.entries(secretValues)) {
      map.set(keyId, secret);
    }

    return map;
  }, [generatedKey, secretValues]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Klucz API skopiowany');
    } catch {
      toast.error('Nie udało się skopiować klucza API');
    }
  };

  const revealSecret = async (keyId: string) => {
    if (currentSecretById.has(keyId)) {
      setVisibleSecrets((current) => ({
        ...current,
        [keyId]: true,
      }));
      return currentSecretById.get(keyId) ?? '';
    }

    const response = await revealApiKeyMutation.mutateAsync({ id: keyId });
    setSecretValues((current) => ({
      ...current,
      [keyId]: response.secret,
    }));
    setVisibleSecrets((current) => ({
      ...current,
      [keyId]: true,
    }));

    return response.secret;
  };

  const toggleSecretVisibility = async (keyId: string) => {
    if (visibleSecrets[keyId]) {
      setVisibleSecrets((current) => ({
        ...current,
        [keyId]: false,
      }));
      return;
    }

    await revealSecret(keyId);
  };

  const copySecret = async (keyId: string) => {
    const secret = await revealSecret(keyId);

    if (!secret) {
      return;
    }

    await handleCopy(secret);
  };

  const handleCreateApiKey = async () => {
    try {
      if (!newApiKeyName.trim()) {
        toast.error('Podaj nazwę klucza API');
        return;
      }

      const result = await createApiKeyMutation.mutateAsync({ name: newApiKeyName.trim() });
      setGeneratedKey(result);
      setCreateDialogOpen(false);
      setNewApiKeyName('');
      toast.success('Nowy klucz API został utworzony');
      await utils.companyApiKey.getMine.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nie udało się utworzyć klucza API');
    }
  };

  const handleDeleteApiKey = async () => {
    if (!keyToDelete) {
      return;
    }

    try {
      await deleteApiKeyMutation.mutateAsync({ id: keyToDelete });
      setVisibleSecrets((current) => {
        const next = { ...current };
        delete next[keyToDelete];
        return next;
      });
      setSecretValues((current) => {
        const next = { ...current };
        delete next[keyToDelete];
        return next;
      });
      setKeyToDelete(null);
      toast.success('Klucz API został usunięty');
      await utils.companyApiKey.getMine.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nie udało się usunąć klucza API');
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Integracja / API" />
      <main className="flex-1 space-y-4 px-0 pb-6">
        {!isProvider && (
          <p className="text-sm text-muted-foreground">Ta podstrona jest dostępna tylko dla providera dronów.</p>
        )}

        {isProvider && (
          <div className="space-y-4">
            <section className="space-y-3">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground pt-4">
                    Klucze API służą do przyszłej autentykacji zewnętrznego API jako ta firma
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-sm text-muted-foreground">Liczba dostaw providera: {deliveriesQuery.data?.length ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Aktywne klucze API: {apiKeys.length}</p>
                </div>

                <div className="pt-2 pb-2">
                  <Button type="button" onClick={() => setCreateDialogOpen(true)}>
                    <PlusIcon size={16} />
                    Nowy klucz
                  </Button>
                </div>
              </div>

              {apiKeys.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nie masz jeszcze żadnych kluczy API.</p>
              ) : (
                <div className="grid gap-2">
                  {apiKeys.map((apiKey) => {
                    const isVisible = visibleSecrets[apiKey.id] ?? false;
                    const revealedSecret = currentSecretById.get(apiKey.id);
                    const displayedValue = isVisible && revealedSecret ? revealedSecret : maskSecret(apiKey.secretPrefix, apiKey.secretLast4);

                    return (
                      <Card key={apiKey.id}>
                        <CardHeader className="flex flex-row items-start justify-between gap-3">
                          <div className="space-y-1">
                            <CardTitle>{apiKey.name}</CardTitle>
                            <CardDescription>Utworzono {formatDate(apiKey.createdAt)}</CardDescription>
                          </div>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setKeyToDelete(apiKey.id)}
                            aria-label={`Usuń klucz ${apiKey.name}`}
                          >
                            <TrashIcon size={16} />
                          </Button>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Klucz API</p>
                            <p className="break-all font-mono text-sm">{displayedValue}</p>
                          </div>
                        </CardContent>

                        <CardFooter className="flex items-center justify-end gap-2 border-t pt-6">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void toggleSecretVisibility(apiKey.id)}
                          >
                            {isVisible ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
                            {isVisible ? 'Ukryj' : 'Pokaż'}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => void copySecret(apiKey.id)}
                          >
                            <CopyIcon size={16} />
                            Kopiuj
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nowy klucz API</DialogTitle>
                  <DialogDescription>Podaj nazwę, żeby później łatwo odróżnić ten klucz od pozostałych.</DialogDescription>
                </DialogHeader>

                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="api-key-name">Nazwa klucza</FieldLabel>
                    <Input
                      id="api-key-name"
                      value={newApiKeyName}
                      onChange={(event) => setNewApiKeyName(event.target.value)}
                      placeholder="Np. Integracja produkcyjna"
                    />
                    <FieldError />
                  </FieldContent>
                </Field>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Anuluj
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleCreateApiKey()}
                    disabled={createApiKeyMutation.isPending}
                  >
                    Utwórz klucz
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={generatedKey !== null} onOpenChange={(open) => !open && setGeneratedKey(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Klucz API został utworzony</DialogTitle>
                  <DialogDescription>
                    Zapisz go teraz. Później będzie można go ponownie odsłonić, ale domyślnie pozostaje ukryty.
                  </DialogDescription>
                </DialogHeader>

                {generatedKey && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Nazwa</p>
                      <p className="text-sm font-medium">{generatedKey.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Klucz API</p>
                      <p className="break-all font-mono text-sm">
                        {visibleSecrets[generatedKey.id]
                          ? generatedKey.secret
                          : maskSecret(generatedKey.secretPrefix, generatedKey.secretLast4)}
                      </p>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {generatedKey && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setVisibleSecrets((current) => ({
                          ...current,
                          [generatedKey.id]: !current[generatedKey.id],
                        }))
                      }
                    >
                      {visibleSecrets[generatedKey.id] ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
                      {visibleSecrets[generatedKey.id] ? 'Ukryj' : 'Pokaż'}
                    </Button>
                  )}
                  {generatedKey && (
                    <Button type="button" variant="ghost" onClick={() => void handleCopy(generatedKey.secret)}>
                      <CopyIcon size={16} />
                      Kopiuj
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog open={keyToDelete !== null} onOpenChange={(open) => !open && setKeyToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Usunąć klucz API?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tego działania nie można cofnąć. Klucz przestanie działać od razu po usunięciu.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => void handleDeleteApiKey()}>
                    Usuń klucz
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </main>
    </div>
  );
}
