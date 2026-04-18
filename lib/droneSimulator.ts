import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Prędkość drona (zmiana współrzędnych na sekundę)
const STEP = 0.0002; 

async function simulate() {
  try {
    const drones = await prisma.droneStatus.findMany();

    for (const drone of drones) {
      const { currentLatitude, currentLongitude, destinationLatitude, destinationLongitude, originLatitude, originLongitude } = drone;

      // Oblicz dystans do celu (prosta Euklidesowa dla małych odległości)
      const dLat = destinationLatitude - currentLatitude;
      const dLng = destinationLongitude - currentLongitude;
      const distance = Math.sqrt(dLat * dLat + dLng * dLng);

      if (distance < STEP) {
        // Dron doleciał do celu - zresetujmy go na start dla celów demonstracyjnych
        await prisma.droneStatus.update({
          where: { droneId: drone.droneId },
          data: {
            currentLatitude: originLatitude,
            currentLongitude: originLongitude,
            batteryLevel: 100,
            updatedAt: new Date(),
          },
        });
        console.log(`[Simulator] Dron ${drone.droneId} dotarł do celu. Resetowanie pozycji.`);
      } else {
        // Wykonaj krok w stronę celu
        const ratio = STEP / distance;
        const newLat = currentLatitude + dLat * ratio;
        const newLng = currentLongitude + dLng * ratio;

        await prisma.droneStatus.update({
          where: { droneId: drone.droneId },
          data: {
            currentLatitude: newLat,
            currentLongitude: newLng,
            // Losowe zużycie baterii (średnio co 10 sekund -1%)
            batteryLevel: Math.random() > 0.9 ? Math.max(0, drone.batteryLevel - 1) : drone.batteryLevel,
            updatedAt: new Date(),
          },
        });
      }
    }
  } catch (error) {
    console.error('[Simulator] Błąd podczas symulacji:', error);
  }
}

console.log('--- Symulator Dronów Hacknarok 2026 ---');
console.log('Częstotliwość: 1s, Krok:', STEP);
console.log('Naciśnij Ctrl+C aby przerwać.');

// Uruchom symulację co sekundę
setInterval(simulate, 1000);
