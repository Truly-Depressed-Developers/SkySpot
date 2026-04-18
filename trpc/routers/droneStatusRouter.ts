import { prisma } from '@/prisma/prisma';
import { mapDroneStatusToDTO } from '@/types/dtos';
import { mapCoordsToDTO } from '@/types/dtos/common';
import type { ProviderDroneListItemDTO } from '@/types/dtos/providerDrone';
import { OrderStatus, UserRole } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, providerProcedure, publicProcedure, router } from '../init';

function getPackageSizeLabel(weight: number): ProviderDroneListItemDTO['packageSize'] {
  if (weight <= 0.8) {
    return 'Mała';
  }

  if (weight <= 3) {
    return 'Średnia';
  }

  return 'Duża';
}

export const droneStatusRouter = router({
  getAllMine: protectedProcedure.query(async ({ ctx }) => {
    let where;

    switch (ctx.user.role) {
      case UserRole.USER:
        where = {
          order: {
            userId: ctx.user.id,
          },
        };
        break;

      case UserRole.DRONE_PROVIDER:
        where = {
          order: {
            delivery: {
              is: {
                droneProviderId: ctx.user.id,
              },
            },
          },
        };
        break;

      default:
        throw new TRPCError({ code: 'FORBIDDEN' });
    }

    const droneStatuses = await prisma.droneStatus.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return droneStatuses.map(mapDroneStatusToDTO);
  }),

  getProviderDroneList: providerProcedure.query(async ({ ctx }) => {
    const deliveries = await prisma.delivery.findMany({
      where: {
        droneProviderId: ctx.user.id,
      },
      include: {
        order: {
          include: {
            user: true,
            landingPad: true,
            droneStatus: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const latestByDroneId = new Map<string, (typeof deliveries)[number]>();

    for (const delivery of deliveries) {
      if (!latestByDroneId.has(delivery.droneId)) {
        latestByDroneId.set(delivery.droneId, delivery);
      }
    }

    return Array.from(latestByDroneId.values()).map((delivery) => {
      const droneStatus = delivery.order.droneStatus;
      const isActive =
        droneStatus !== null &&
        delivery.order.status !== OrderStatus.DELIVERED &&
        delivery.order.status !== OrderStatus.CANCELLED;

      return {
        droneId: delivery.droneId,
        droneName: `Dron ${delivery.droneId}`,
        serialNumber: delivery.droneId,
        isActive,
        batteryLevel: droneStatus?.batteryLevel ?? null,
        orderId: delivery.order.orderId,
        orderStatus: delivery.order.status,
        packageSize: getPackageSizeLabel(delivery.order.weight),
        packageWeightKg: delivery.order.weight,
        recipientFirstName: delivery.order.user.firstName,
        recipientLastName: delivery.order.user.lastName,
        landingPadType: delivery.order.landingPad.type,
        landingPadAvailability: delivery.order.landingPad.availability,
        landingPadImageUrl: delivery.order.landingPad.imageUrl,
        landingPadDescription: delivery.order.landingPad.description,
        landingPadCoords: mapCoordsToDTO(
          delivery.order.landingPad.latitude,
          delivery.order.landingPad.longitude,
        ),
        origin: mapCoordsToDTO(
          droneStatus?.originLatitude ?? delivery.order.destinationLatitude,
          droneStatus?.originLongitude ?? delivery.order.destinationLongitude,
        ),
        destination: mapCoordsToDTO(
          droneStatus?.destinationLatitude ?? delivery.order.destinationLatitude,
          droneStatus?.destinationLongitude ?? delivery.order.destinationLongitude,
        ),
        currentPosition: droneStatus
          ? mapCoordsToDTO(droneStatus.currentLatitude, droneStatus.currentLongitude)
          : null,
        updatedAt: droneStatus?.updatedAt ?? null,
      } satisfies ProviderDroneListItemDTO;
    });
  }),
});
