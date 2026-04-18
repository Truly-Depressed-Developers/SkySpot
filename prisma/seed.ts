import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser(
  email: string,
  firstName: string,
  lastName: string,
  plainPassword: string,
  role: UserRole,
) {
  const hashed = await bcrypt.hash(plainPassword, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      firstName,
      lastName,
      password: hashed,
      role,
    },
    create: {
      email,
      firstName,
      lastName,
      password: hashed,
      role,
    },
  });
  return user;
}

async function main() {
  console.log('Seeding database...\n');

  await prisma.deliveryRating.deleteMany();
  await prisma.droneStatus.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.order.deleteMany();
  await prisma.landingPad.deleteMany();

  const regularUser1 = await createUser(
    'jan@mail.com',
    'Jan',
    'Kowalski',
    'password123',
    UserRole.USER,
  );
  const regularUser2 = await createUser(
    'anna@mail.com',
    'Anna',
    'Nowak',
    'password123',
    UserRole.USER,
  );
  await createUser('mod@mail.com', 'Monika', 'Moderator', 'password123', UserRole.MODERATOR);
  const droneProvider1 = await createUser(
    'provider1@mail.com',
    'Dron',
    'Express',
    'password123',
    UserRole.DRONE_PROVIDER,
  );
  const droneProvider2 = await createUser(
    'provider2@mail.com',
    'Sky',
    'Fleet',
    'password123',
    UserRole.DRONE_PROVIDER,
  );

  await prisma.landingPad.createMany({
    data: [
      {
        id: 'lp-centrum',
        name: 'Lądowisko Rynek Główny',
        imageUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6',
        latitude: 50.0614,
        longitude: 19.9372,
        type: 'SQUARE',
        availability: 'PUBLIC',
        status: 'ACCEPTED',
      },
      {
        id: 'lp-agh',
        name: 'Lądowisko AGH',
        imageUrl: 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d',
        latitude: 50.0665,
        longitude: 19.9184,
        type: 'HOUSE_ROOF',
        availability: 'PUBLIC',
        status: 'ACCEPTED',
      },
      {
        id: 'lp-prywatne-1',
        name: 'Lądowisko Osiedle Podwawelskie',
        imageUrl: 'https://images.unsplash.com/photo-1517976547714-720226b864c1',
        latitude: 50.0467,
        longitude: 19.9312,
        type: 'DRIVEWAY',
        availability: 'PRIVATE',
        status: 'WAITING_FOR_REVIEW',
      },
    ],
  });

  await prisma.order.createMany({
    data: [
      {
        orderId: 'ord-001',
        userId: regularUser1.id,
        landingPadId: 'lp-centrum',
        type: 'FOOD',
        status: 'ORDERED',
        weight: 1.4,
        destinationLatitude: 50.0614,
        destinationLongitude: 19.9372,
        description: 'Zamówienie obiadowe',
      },
      {
        orderId: 'ord-002',
        userId: regularUser2.id,
        landingPadId: 'lp-agh',
        type: 'STANDARD',
        status: 'IN_TRANSIT',
        weight: 2.7,
        destinationLatitude: 50.0665,
        destinationLongitude: 19.9184,
        description: 'Paczka z elektroniką',
      },
      {
        orderId: 'ord-003',
        userId: regularUser1.id,
        landingPadId: 'lp-centrum',
        type: 'MONITORING',
        status: 'DELIVERED',
        weight: 0.3,
        destinationLatitude: 50.0614,
        destinationLongitude: 19.9372,
        description: 'Lot kontrolny osiedla',
      },
    ],
  });

  await prisma.delivery.createMany({
    data: [
      {
        id: 'del-001',
        orderId: 'ord-002',
        droneProviderId: droneProvider1.id,
        landingPadId: 'lp-agh',
        droneId: 'DRN-101',
        reservedFrom: new Date('2026-04-18T09:00:00.000Z'),
        reservedTo: new Date('2026-04-18T09:20:00.000Z'),
      },
      {
        id: 'del-002',
        orderId: 'ord-003',
        droneProviderId: droneProvider2.id,
        landingPadId: 'lp-centrum',
        droneId: 'DRN-202',
        reservedFrom: new Date('2026-04-17T12:00:00.000Z'),
        reservedTo: new Date('2026-04-17T12:15:00.000Z'),
      },
    ],
  });

  await prisma.deliveryRating.createMany({
    data: [
      {
        deliveryId: 'del-002',
        isSuccess: true,
        comment: 'Dostarczono bez problemów',
      },
    ],
  });

  await prisma.droneStatus.createMany({
    data: [
      {
        droneId: 'DRN-101',
        currentLatitude: 50.064,
        currentLongitude: 19.925,
        batteryLevel: 74,
        originLatitude: 50.0614,
        originLongitude: 19.9372,
        destinationLatitude: 50.0665,
        destinationLongitude: 19.9184,
        orderId: 'ord-002',
      },
      {
        droneId: 'DRN-202',
        currentLatitude: 50.0614,
        currentLongitude: 19.9372,
        batteryLevel: 100,
        originLatitude: 50.0467,
        originLongitude: 19.9312,
        destinationLatitude: 50.0614,
        destinationLongitude: 19.9372,
        orderId: 'ord-003',
      },
    ],
  });

  console.log('\nSeeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
