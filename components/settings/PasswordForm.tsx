'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { toast } from 'sonner';
import { trpc } from '@/trpc/client';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Obecne hasło jest wymagane'),
    newPassword: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Hasła nie pasują do siebie',
    path: ['confirmNewPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function PasswordForm() {
  const changePasswordMutation = trpc.user.changePassword.useMutation();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'onBlur',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success('Hasło zostało zmienione pomyślnie!');
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Błąd podczas zmiany hasła');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Zmień hasło</CardTitle>
        <CardDescription>Wprowadź swoje obecne hasło, aby ustawić nowe.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Controller
              control={form.control}
              name="currentPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Obecne hasło</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nowe hasło</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="confirmNewPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Potwierdź nowe hasło</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </div>
        </CardContent>

        <div className="flex flex-col gap-4 border-t p-6">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={form.formState.isSubmitting || changePasswordMutation.isPending}
          >
            {form.formState.isSubmitting || changePasswordMutation.isPending
              ? 'Zmienianie...'
              : 'Zmień hasło'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
