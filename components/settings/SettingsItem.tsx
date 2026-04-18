'use client';

import Link from 'next/link';
import { CaretRightIcon, Icon } from '@phosphor-icons/react';

type Props = {
  icon: Icon;
  label: string;
  href: string;
};

export const SettingsItem = ({ icon: Icon, label, href }: Props) => {
  return (
    <Link
      href={href}
      prefetch={true}
      className="flex w-full items-center justify-between py-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground text-chart-4">
          <Icon size={28} />
        </div>
        <span className="text-base font-medium">{label}</span>
      </div>
      <CaretRightIcon size={28} weight="regular" className="text-chart-4" />
    </Link>
  );
};
