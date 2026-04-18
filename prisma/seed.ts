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
        name: 'Lądowisko Centrum',
        imageUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6',
        latitude: 52.2297,
        longitude: 21.0122,
        type: 'SQUARE',
        availability: 'PUBLIC',
        status: 'ACCEPTED',
      },
      {
        id: 'lp-zachod',
        name: 'Lądowisko Zachód',
        imageUrl: 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d',
        latitude: 52.232,
        longitude: 20.952,
        type: 'HOUSE_ROOF',
        availability: 'PUBLIC',
        status: 'ACCEPTED',
      },
      {
        id: 'lp-prywatne-1',
        name: 'Lądowisko Osiedle Północ',
        imageUrl: 'https://images.unsplash.com/photo-1517976547714-720226b864c1',
        latitude: 52.267,
        longitude: 21.03,
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
        destinationLatitude: 52.23,
        destinationLongitude: 21.01,
        description: 'Zamówienie obiadowe',
      },
      {
        orderId: 'ord-002',
        userId: regularUser2.id,
        landingPadId: 'lp-zachod',
        type: 'STANDARD',
        status: 'IN_TRANSIT',
        weight: 2.7,
        destinationLatitude: 52.228,
        destinationLongitude: 20.975,
        description: 'Paczka z elektroniką',
      },
      {
        orderId: 'ord-003',
        userId: regularUser1.id,
        landingPadId: 'lp-centrum',
        type: 'MONITORING',
        status: 'DELIVERED',
        weight: 0.3,
        destinationLatitude: 52.231,
        destinationLongitude: 21.004,
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
        landingPadId: 'lp-zachod',
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
        currentLatitude: 52.229,
        currentLongitude: 20.981,
        batteryLevel: 74,
        originLatitude: 52.232,
        originLongitude: 20.952,
        destinationLatitude: 52.228,
        destinationLongitude: 20.975,
        orderId: 'ord-002',
      },
      {
        droneId: 'DRN-202',
        currentLatitude: 52.231,
        currentLongitude: 21.004,
        batteryLevel: 100,
        originLatitude: 52.2297,
        originLongitude: 21.0122,
        destinationLatitude: 52.231,
        destinationLongitude: 21.004,
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
