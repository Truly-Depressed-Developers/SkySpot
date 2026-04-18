import type { AdspacesWithBusinessDTO } from '@/types/dtos/adspace';

export function filterAdspaces(
  adspaces: AdspacesWithBusinessDTO[],
  filters: { search: string; typeId: string | null; availability: 'all' | 'available' | 'in_use' },
) {
  return adspaces.filter((adspace) => {
    // Search filter - matches business name or adspace name
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = adspace.name.toLowerCase().includes(searchLower);
      const matchesBusiness = adspace.business.name.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesBusiness) {
        return false;
      }
    }
    if (filters.typeId && adspace.type.id !== filters.typeId) {
      return false;
    }
    if (filters.availability === 'available' && adspace.inUse) {
      return false;
    }
    if (filters.availability === 'in_use' && !adspace.inUse) {
      return false;
    }
    return true;
  });
}
