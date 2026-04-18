import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser(
  email: string,
  firstName: string,
  lastName: string,
  plainPassword: string,
) {
  const hashed = await bcrypt.hash(plainPassword, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      firstName,
      lastName,
      password: hashed,
    },
  });
  return user;
}

async function main() {
  console.log('Seeding database...\n');

  // Create users
  const user1 = await createUser('jan@mail.com', 'Jan', 'Kowalski', 'password123');
  const user2 = await createUser('anna@mail.com', 'Anna', 'Nowak', 'password123');
  const user3 = await createUser('piotr@mail.com', 'Piotr', 'Wiśniewski', 'password123');
  const user4 = await createUser('maria@mail.com', 'Maria', 'Wójcik', 'password123');
  const user5 = await createUser('tomasz@mail.com', 'Tomasz', 'Kamiński', 'password123');
  const user6 = await createUser('kasia@mail.com', 'Katarzyna', 'Zielińska', 'password123');
  const user7 = await createUser('marek@mail.com', 'Marek', 'Szymański', 'password123');

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
