'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

type Props = {
  title: string;
  onBack?: () => void;
};

export function PageHeaderWithBack({ title, onBack }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="sticky top-0 z-10 shrink-0 flex items-center justify-center p-4 border-b bg-background">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="absolute size-12 left-4 rounded-full"
      >
        <ArrowLeftIcon size={28} />
      </Button>
      <h1 className="text-lg font-semibold">{title}</h1>
    </div>
  );
}
