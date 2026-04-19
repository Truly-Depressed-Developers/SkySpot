import { UserRole } from '@prisma/client';

import { hashApiKeySecret } from '@/lib/companyApiKeys';
import { prisma } from '@/prisma/prisma';

export type DroneProviderAuth = {
  apiKeyId: string;
  userId: string;
};

export const droneProviderApiKeyHeaderName = 'x-drone-api-key';

export const authenticateDroneProviderRequest = async (
  request: Request,
): Promise<DroneProviderAuth | null> => {
  const apiKey = request.headers.get(droneProviderApiKeyHeaderName);

  if (!apiKey) {
    return null;
  }

  const apiKeyRecord = await prisma.companyApiKey.findFirst({
    where: {
      secretHash: hashApiKeySecret(apiKey),
      user: {
        role: UserRole.DRONE_PROVIDER,
      },
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!apiKeyRecord) {
    return null;
  }

  return {
    apiKeyId: apiKeyRecord.id,
    userId: apiKeyRecord.userId,
  };
};