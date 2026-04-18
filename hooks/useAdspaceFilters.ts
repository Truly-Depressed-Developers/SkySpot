'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export type FilterState = {
  search: string;
  typeId: string | null;
  availability: 'all' | 'available' | 'in_use';
};

export function useAdspaceFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: FilterState = {
    search: searchParams.get('q') || '',
    typeId: searchParams.get('type') || null,
    availability: (searchParams.get('availability') as FilterState['availability']) || 'all',
  };

  const setFilters = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newFilters.search) {
        params.set('q', newFilters.search);
      } else {
        params.delete('q');
      }

      if (newFilters.typeId) {
        params.set('type', newFilters.typeId);
      } else {
        params.delete('type');
      }

      if (newFilters.availability !== 'all') {
        params.set('availability', newFilters.availability);
      } else {
        params.delete('availability');
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters({ ...filters, [key]: value });
    },
    [filters, setFilters],
  );

  const clearFilters = useCallback(() => {
    setFilters({ search: '', typeId: null, availability: 'all' });
  }, [setFilters]);

  // Count only extended filters (not search)
  const activeFiltersCount = (filters.typeId ? 1 : 0) + (filters.availability !== 'all' ? 1 : 0);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    activeFiltersCount,
  };
}
