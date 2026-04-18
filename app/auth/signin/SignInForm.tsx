'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { toast } from 'sonner';
import Link from 'next/link';

const signInSchema = z.object({
  email: z.email('Wpisz prawidłowy adres email'),
  password: z.string().min(1, 'Hasło jest wymagane'),
});

type SignInFormData = z.infer<typeof signInSchema>;

type QuickLoginOption = {
  label: string;
  email: string;
  password: string;
};

const quickLoginOptions: QuickLoginOption[] = [
  {
    label: 'Szybkie logowanie: User',
    email: 'jan@mail.com',
    password: 'password123',
  },
  {
    label: 'Szybkie logowanie: Moderator',
    email: 'mod@mail.com',
    password: 'password123',
  },
  {
    label: 'Szybkie logowanie: Provider',
    email: 'provider1@mail.com',
    password: 'password123',
  },
];

export function SignInForm() {
  const router = useRouter();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        toast.error('Nieprawidłowy email lub hasło');
        return;
      }

      toast.success('Zalogowano pomyślnie!');
      router.push('/');
      router.refresh();
    } catch (error) {
      toast.error('Wystąpił błąd podczas logowania');
    }
  };

  const handleQuickLogin = async (option: QuickLoginOption) => {
    form.setValue('email', option.email, { shouldValidate: true });
    form.setValue('password', option.password, { shouldValidate: true });
    await onSubmit({ email: option.email, password: option.password });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Zaloguj się</CardTitle>
        <CardDescription>Wprowadź swoje dane dostępowe</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Adres email</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    placeholder="jan@example.com"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Hasło</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    placeholder="••••••••"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>Wpisz hasło użyte podczas rejestracji</FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </div>
        </CardContent>

        <div className="flex flex-col gap-4 border-t p-6">
          <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
          </Button>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Szybkie logowanie (konta seedowe)</p>
            {quickLoginOptions.map((option) => (
              <Button
                key={option.email}
                type="button"
                variant="outline"
                className="w-full"
                disabled={form.formState.isSubmitting}
                onClick={() => handleQuickLogin(option)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Nie masz konta?{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Zarejestruj się
            </Link>
          </p>
        </div>
      </form>
    </Card>
  );
}
