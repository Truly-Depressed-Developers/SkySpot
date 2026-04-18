'use client';

import { RegisterForm } from '@/app/auth/register/RegisterForm';
import { useNavbar } from '@/hooks/useNavbar';
import { useEffect } from 'react';

export default function RegisterPage() {
  const { setIsVisible } = useNavbar();

  useEffect(() => {
    setIsVisible(false);
    return () => setIsVisible(true);
  }, [setIsVisible]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
