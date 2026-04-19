import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { encryptApiKeySecret, hashApiKeySecret } from '../lib/companyApiKeys';

const prisma = new PrismaClient();
const hardcodedProviderApiKey = 'ck_live_provider1_hacknarok2026';

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

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
  const seedNow = new Date();

  await prisma.deliveryRating.deleteMany();
  await prisma.droneStatus.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.order.deleteMany();
  await prisma.landingPad.deleteMany();
  await prisma.companyApiKey.deleteMany();

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

  await prisma.companyApiKey.create({
    data: {
      userId: droneProvider1.id,
      name: 'Klucz seed provider1',
      secretHash: hashApiKeySecret(hardcodedProviderApiKey),
      encryptedSecret: encryptApiKeySecret(hardcodedProviderApiKey),
      secretPrefix: hardcodedProviderApiKey.slice(0, 8),
      secretLast4: hardcodedProviderApiKey.slice(-4),
    },
  });

  await prisma.landingPad.createMany({
    data: [
      {
        id: 'lp-centrum',
        ownerId: regularUser1.id,
        name: 'Lądowisko Rynek Główny',
        description: 'Centralny punkt odbioru przy rynku.',
        imageUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6',
        latitude: 50.0614,
        longitude: 19.9372,
        type: 'SQUARE',
        availability: 'PUBLIC',
        status: 'ACCEPTED',
      },
      {
        id: 'lp-agh',
        ownerId: regularUser1.id,
        name: 'Lądowisko AGH',
        description: 'Punkt odbioru po zachodniej stronie miasta.',
        imageUrl: 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d',
        latitude: 50.0665,
        longitude: 19.9184,
        type: 'HOUSE_ROOF',
        availability: 'PUBLIC',
        status: 'ACCEPTED',
      },
      {
        id: 'lp-prywatne-1',
        ownerId: regularUser2.id,
        name: 'Lądowisko Osiedle Podwawelskie',
        description: 'Prywatny punkt na osiedlu z ograniczonym dostępem.',
        rejectionReason:
          'Za mała powierzchnia podejścia i przeszkody w bezpośrednim otoczeniu punktu.',
        imageUrl: 'https://images.unsplash.com/photo-1517976547714-720226b864c1',
        latitude: 50.0467,
        longitude: 19.9312,
        type: 'DRIVEWAY',
        availability: 'PRIVATE',
        status: 'REJECTED',
      },
      {
        id: 'lp-kazimierz-oczekujace',
        ownerId: regularUser1.id,
        name: 'Lądowisko Kazimierz',
        description: 'Nowy punkt zgłoszony do weryfikacji przy bulwarach.',
        imageUrl: 'https://images.unsplash.com/photo-1494526585095-c41746248156',
        latitude: 50.0491,
        longitude: 19.9446,
        type: 'SQUARE',
        availability: 'PUBLIC',
        status: 'WAITING_FOR_REVIEW',
      },
      {
        id: 'lp-kleparz-odrzucone',
        ownerId: regularUser1.id,
        name: 'Lądowisko Kleparz',
        description: 'Zgłoszenie z odrzuconą lokalizacją testową.',
        rejectionReason: 'Zbyt mało miejsca na bezpieczne lądowanie i zbyt duże ryzyko kolizji.',
        imageUrl: 'https://images.unsplash.com/photo-1493238792000-8113da705763',
        latitude: 50.0712,
        longitude: 19.9441,
        type: 'HOUSE_ROOF',
        availability: 'PRIVATE',
        status: 'REJECTED',
      },
      {
        id: 'lp-dest-001',
        name: 'Lądowisko Prądnik Czerwony',
        description: 'Docelowy punkt dostawy dla trasy drona DRN-101.',
        imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
        latitude: 50.0701,
        longitude: 19.945,
        type: 'SQUARE',
        availability: 'PUBLIC',
        status: 'ACCEPTED',
      },
      {
        id: 'lp-dest-002',
        name: 'Lądowisko Kazimierz Południe',
        description: 'Docelowy punkt dostawy dla trasy drona DRN-102.',
        imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
        latitude: 50.0491,
        longitude: 19.9446,
        type: 'HOUSE_ROOF',
        availability: 'PUBLIC',
        status: 'ACCEPTED',
      },
      {
        id: 'lp-dest-003',
        name: 'Lądowisko Grzegórzki Wschód',
        description: 'Docelowy punkt dostawy dla trasy drona DRN-202.',
        imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
        latitude: 50.0575,
        longitude: 19.955,
        type: 'SQUARE',
        availability: 'PUBLIC',
        status: 'ACCEPTED',
      },
      {
        id: 'lp-dest-004',
        name: 'Lądowisko Bronowice Zachód',
        description: 'Docelowy punkt dostawy dla trasy drona DRN-103.',
        imageUrl: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c',
        latitude: 50.073,
        longitude: 19.9005,
        type: 'DRIVEWAY',
        availability: 'PRIVATE',
        status: 'ACCEPTED',
      },
      {
        id: 'lp-dest-005',
        name: 'Lądowisko Dębniki Dolne',
        description: 'Docelowy punkt dostawy dla trasy drona DRN-104.',
        imageUrl: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6',
        latitude: 50.0405,
        longitude: 19.9202,
        type: 'OTHER',
        availability: 'PRIVATE',
        status: 'ACCEPTED',
      },
      {
        id: 'lp-dest-006',
        name: 'Lądowisko Łobzów Południe',
        description: 'Docelowy punkt dostawy dla trasy drona DRN-105.',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
        latitude: 50.054,
        longitude: 19.903,
        type: 'SQUARE',
        availability: 'PUBLIC',
        status: 'ACCEPTED',
      },
    ],
  });

  await prisma.order.createMany({
    data: [
      {
        orderId: 'ord-001',
        userId: regularUser1.id,
        landingPadId: 'lp-dest-001',
        type: 'FOOD',
        status: 'IN_TRANSIT',
        weight: 1.4,
        destinationLatitude: 50.0701,
        destinationLongitude: 19.945,
        description: 'Zamówienie obiadowe',
        createdAt: addMinutes(seedNow, -12),
      },
      {
        orderId: 'ord-002',
        userId: regularUser2.id,
        landingPadId: 'lp-dest-002',
        type: 'STANDARD',
        status: 'IN_TRANSIT',
        weight: 2.7,
        destinationLatitude: 50.0491,
        destinationLongitude: 19.9446,
        description: 'Paczka z elektroniką',
        createdAt: addMinutes(seedNow, -18),
      },
      {
        orderId: 'ord-003',
        userId: regularUser1.id,
        landingPadId: 'lp-dest-003',
        type: 'MONITORING',
        status: 'DELIVERED',
        weight: 0.3,
        destinationLatitude: 50.0575,
        destinationLongitude: 19.955,
        description: 'Lot kontrolny osiedla',
        createdAt: addMinutes(seedNow, -140),
      },
      {
        orderId: 'ord-004',
        userId: regularUser1.id,
        landingPadId: 'lp-dest-004',
        type: 'STANDARD',
        status: 'DELIVERED',
        weight: 1.9,
        destinationLatitude: 50.073,
        destinationLongitude: 19.9005,
        description: 'Paczka biurowa',
        createdAt: addMinutes(seedNow, -210),
      },
      {
        orderId: 'ord-005',
        userId: regularUser2.id,
        landingPadId: 'lp-dest-005',
        type: 'FOOD',
        status: 'CANCELLED',
        weight: 0.9,
        destinationLatitude: 50.0405,
        destinationLongitude: 19.9202,
        description: 'Anulowane zamówienie testowe',
        createdAt: addMinutes(seedNow, -90),
      },
      {
        orderId: 'ord-006',
        userId: regularUser1.id,
        landingPadId: 'lp-dest-006',
        type: 'STANDARD',
        status: 'IN_TRANSIT',
        weight: 1.1,
        destinationLatitude: 50.054,
        destinationLongitude: 19.903,
        description: 'Aktywna dostawa testowa',
        createdAt: addMinutes(seedNow, -8),
      },
    ],
  });

  await prisma.delivery.createMany({
    data: [
      {
        id: 'del-001',
        orderId: 'ord-001',
        droneProviderId: droneProvider1.id,
        landingPadId: 'lp-dest-001',
        droneId: 'DRN-100',
        reservedFrom: addMinutes(seedNow, -4),
        reservedTo: addMinutes(seedNow, 14),
        createdAt: addMinutes(seedNow, -5),
      },
      {
        id: 'del-002',
        orderId: 'ord-002',
        droneProviderId: droneProvider1.id,
        landingPadId: 'lp-dest-002',
        droneId: 'DRN-101',
        reservedFrom: addMinutes(seedNow, -6),
        reservedTo: addMinutes(seedNow, 18),
        createdAt: addMinutes(seedNow, -7),
      },
      {
        id: 'del-003',
        orderId: 'ord-003',
        droneProviderId: droneProvider2.id,
        landingPadId: 'lp-dest-003',
        droneId: 'DRN-202',
        reservedFrom: addMinutes(seedNow, -95),
        reservedTo: addMinutes(seedNow, -82),
        createdAt: addMinutes(seedNow, -96),
      },
      {
        id: 'del-004',
        orderId: 'ord-004',
        droneProviderId: droneProvider1.id,
        landingPadId: 'lp-dest-004',
        droneId: 'DRN-103',
        reservedFrom: addMinutes(seedNow, -180),
        reservedTo: addMinutes(seedNow, -165),
        createdAt: addMinutes(seedNow, -181),
      },
      {
        id: 'del-005',
        orderId: 'ord-005',
        droneProviderId: droneProvider1.id,
        landingPadId: 'lp-dest-005',
        droneId: 'DRN-104',
        reservedFrom: addMinutes(seedNow, -70),
        reservedTo: addMinutes(seedNow, -56),
        createdAt: addMinutes(seedNow, -71),
      },
      {
        id: 'del-006',
        orderId: 'ord-006',
        droneProviderId: droneProvider1.id,
        landingPadId: 'lp-dest-006',
        droneId: 'DRN-105',
        reservedFrom: addMinutes(seedNow, -4),
        reservedTo: addMinutes(seedNow, 16),
        createdAt: addMinutes(seedNow, -5),
      },
    ],
  });

  await prisma.deliveryRating.createMany({
    data: [
      {
        deliveryId: 'del-003',
        isSuccess: true,
        comment: 'Dostarczono bez problemów',
      },
      {
        deliveryId: 'del-004',
        isSuccess: true,
        comment: 'Zrealizowano poprawnie',
      },
      {
        deliveryId: 'del-005',
        isSuccess: false,
        comment: 'Zamówienie anulowane przez użytkownika',
      },
    ],
  });

  await prisma.droneStatus.createMany({
    data: [
      {
        droneId: 'DRN-101',
        currentLatitude: 50.0655,
        currentLongitude: 19.941,
        batteryLevel: 74,
        originLatitude: 50.0614,
        originLongitude: 19.9372,
        destinationLatitude: 50.0701,
        destinationLongitude: 19.945,
        orderId: 'ord-001',
      },
      {
        droneId: 'DRN-102',
        currentLatitude: 50.0478,
        currentLongitude: 19.9388,
        batteryLevel: 45,
        originLatitude: 50.0467,
        originLongitude: 19.9312,
        destinationLatitude: 50.0491,
        destinationLongitude: 19.9446,
        orderId: 'ord-002',
      },
      {
        droneId: 'DRN-202',
        currentLatitude: 50.0602,
        currentLongitude: 19.9433,
        batteryLevel: 100,
        originLatitude: 50.0665,
        originLongitude: 19.9184,
        destinationLatitude: 50.0575,
        destinationLongitude: 19.955,
        orderId: 'ord-003',
      },
      {
        droneId: 'DRN-103',
        currentLatitude: 50.067,
        currentLongitude: 19.915,
        batteryLevel: 48,
        originLatitude: 50.0491,
        originLongitude: 19.9446,
        destinationLatitude: 50.073,
        destinationLongitude: 19.9005,
        orderId: 'ord-004',
      },
      {
        droneId: 'DRN-104',
        currentLatitude: 50.055,
        currentLongitude: 19.932,
        batteryLevel: 22,
        originLatitude: 50.0712,
        originLongitude: 19.9441,
        destinationLatitude: 50.0405,
        destinationLongitude: 19.9202,
        orderId: 'ord-005',
      },
      {
        droneId: 'DRN-105',
        currentLatitude: 50.06,
        currentLongitude: 19.91,
        batteryLevel: 18,
        originLatitude: 50.0614,
        originLongitude: 19.9372,
        destinationLatitude: 50.054,
        destinationLongitude: 19.903,
        orderId: 'ord-006',
      },
    ],
  });

  console.log('\nSeeding completed!');
  console.log(`Hardcoded API key provider1: ${hardcodedProviderApiKey}`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
