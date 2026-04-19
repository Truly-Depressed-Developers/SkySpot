import type { LandingPadStatus } from '@prisma/client';

import type { LandingPadReservationDTO } from '@/types/dtos';

type AvailabilityCacheData = {
  landingPadId: string;
  available: boolean;
  landingPadStatus: LandingPadStatus;
  conflictingReservations: LandingPadReservationDTO[];
};

type AvailabilityCacheEntry = {
  data: AvailabilityCacheData;
  version: number;
  createdAt: number;
};

type AvailabilityCacheKeyInput = {
  landingPadId: string;
  from: Date;
  to: Date;
};

const availabilityCache = new Map<string, AvailabilityCacheEntry>();
const landingPadVersions = new Map<string, number>();
const maxCacheAgeMs = 5 * 60 * 1000;
const maxEntries = 2_000;

function getLandingPadVersion(landingPadId: string): number {
  return landingPadVersions.get(landingPadId) ?? 0;
}

function buildCacheKey(input: AvailabilityCacheKeyInput): string {
  return `${input.landingPadId}:${input.from.toISOString()}:${input.to.toISOString()}`;
}

function pruneCacheIfNeeded(now: number): void {
  if (availabilityCache.size <= maxEntries) {
    return;
  }

  for (const [key, entry] of availabilityCache.entries()) {
    if (now - entry.createdAt > maxCacheAgeMs) {
      availabilityCache.delete(key);
    }
  }

  if (availabilityCache.size <= maxEntries) {
    return;
  }

  const keysInInsertOrder = Array.from(availabilityCache.keys());
  const overflow = availabilityCache.size - maxEntries;

  for (let i = 0; i < overflow; i += 1) {
    const key = keysInInsertOrder[i];

    if (key) {
      availabilityCache.delete(key);
    }
  }
}

export function getCachedLandingPadAvailability(
  input: AvailabilityCacheKeyInput,
): AvailabilityCacheData | null {
  const now = Date.now();
  const key = buildCacheKey(input);
  const cached = availabilityCache.get(key);

  if (!cached) {
    return null;
  }

  if (cached.version !== getLandingPadVersion(input.landingPadId)) {
    availabilityCache.delete(key);
    return null;
  }

  if (now - cached.createdAt > maxCacheAgeMs) {
    availabilityCache.delete(key);
    return null;
  }

  return cached.data;
}

export function setCachedLandingPadAvailability(
  input: AvailabilityCacheKeyInput,
  data: AvailabilityCacheData,
): void {
  const now = Date.now();
  const key = buildCacheKey(input);

  availabilityCache.set(key, {
    data,
    version: getLandingPadVersion(input.landingPadId),
    createdAt: now,
  });

  pruneCacheIfNeeded(now);
}

export function invalidateLandingPadAvailability(landingPadId: string): void {
  const currentVersion = getLandingPadVersion(landingPadId);
  landingPadVersions.set(landingPadId, currentVersion + 1);
}
