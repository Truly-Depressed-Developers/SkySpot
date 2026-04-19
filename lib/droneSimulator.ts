import { z } from 'zod';

const defaultMode = 'full-flow';
const defaultStep = 0.005;
const defaultIntervalMs = 1000;
const defaultBaseUrl = 'http://localhost:3000';
const krakowCenterLat = 50.06143;
const krakowCenterLng = 19.93658;

const modeSchema = z.enum(['telemetry-only', 'full-flow']);
const orderTypeSchema = z.enum(['STANDARD', 'FOOD', 'EMERGENCY_AED', 'MONITORING', 'BLOOD']);
const orderStatusSchema = z.enum(['ORDERED', 'PREPARING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']);

const coordsSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const droneStatusSchema = z.object({
  droneId: z.string(),
  currentPosition: coordsSchema,
  batteryLevel: z.number(),
  origin: coordsSchema,
  destination: coordsSchema,
  orderId: z.string(),
});

const dronesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(droneStatusSchema),
});

const orderSchema = z.object({
  orderId: z.string(),
  userId: z.string(),
  landingPadId: z.string(),
  type: orderTypeSchema,
  weight: z.number(),
  status: orderStatusSchema,
  destination: coordsSchema,
  description: z.string(),
});

const deliverySchema = z.object({
  id: z.string(),
  orderId: z.string(),
  droneProviderId: z.string(),
  landingPadId: z.string(),
  droneId: z.string(),
  reservedFrom: z.coerce.date(),
  reservedTo: z.coerce.date(),
});

const shipmentsReadyResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      delivery: deliverySchema,
      order: orderSchema,
    }),
  ),
});

const intakeResponseSchema = z.object({
  success: z.boolean(),
  data: orderSchema,
});

const reservationResponseSchema = z.object({
  success: z.boolean(),
  data: deliverySchema,
});

const nearbyLandingPadsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      coords: coordsSchema,
      distance: z.number(),
    }),
  ),
});

const availabilityResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    landingPadId: z.string(),
    available: z.boolean(),
    landingPadStatus: z.string(),
    conflictingReservations: z.array(
      z.object({
        id: z.string(),
        landingPadId: z.string(),
        droneProviderId: z.string(),
        droneId: z.string(),
        reservedFrom: z.coerce.date(),
        reservedTo: z.coerce.date(),
      }),
    ),
  }),
});

const confirmDeliveryResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    deliveryId: z.string(),
    orderStatus: z.string(),
  }),
});

type DroneStatusDTO = z.infer<typeof droneStatusSchema>;
type CoordsDTO = z.infer<typeof coordsSchema>;
type ShipmentDTO = z.infer<typeof shipmentsReadyResponseSchema>['data'][number];
type OrderDTO = z.infer<typeof orderSchema>;
type DeliveryDTO = z.infer<typeof deliverySchema>;
type NearbyLandingPadDTO = z.infer<typeof nearbyLandingPadsResponseSchema>['data'][number];

type ActiveFlight = {
  deliveryId: string;
  orderId: string;
  droneId: string;
  landingPadId: string;
  currentPosition: CoordsDTO;
  origin: CoordsDTO;
  destination: CoordsDTO;
  batteryLevel: number;
};

type SimulatorConfig = {
  mode: z.infer<typeof modeSchema>;
  apiKey: string;
  baseUrl: string;
  intervalMs: number;
  step: number;
  targetFlights: number | null;
};

type SimulatorState = {
  tick: number;
  activeFlightsByDeliveryId: Map<string, ActiveFlight>;
  originByLandingPadId: Map<string, CoordsDTO>;
  knownDroneIds: Set<string>;
};

const orderTypeCycle: Array<z.infer<typeof orderTypeSchema>> = [
  'STANDARD',
  'FOOD',
  'EMERGENCY_AED',
  'MONITORING',
  'BLOOD',
];

function parseRequiredArg(flagName: string, args: string[]): string {
  const index = args.findIndex((value) => value === flagName);

  if (index < 0 || !args[index + 1]) {
    throw new Error(`Brakuje parametru ${flagName}`);
  }

  return args[index + 1];
}

function parseOptionalArg(flagName: string, args: string[]): string | null {
  const index = args.findIndex((value) => value === flagName);

  if (index < 0 || !args[index + 1]) {
    return null;
  }

  return args[index + 1];
}

function parseNumberArg(value: string | null, fallback: number, argName: string): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Parametr ${argName} musi być dodatnią liczbą`);
  }

  return parsed;
}

function parseModeArg(value: string | null): z.infer<typeof modeSchema> {
  if (!value) {
    return defaultMode;
  }

  const parsed = modeSchema.safeParse(value);

  if (!parsed.success) {
    throw new Error('Parametr --mode musi mieć wartość telemetry-only albo full-flow');
  }

  return parsed.data;
}

function parseTargetFlightsArg(value: string | null): number | null {
  if (!value || value === 'all') {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Parametr --target-flights musi być dodatnią liczbą albo wartością all');
  }

  return parsed;
}

function buildConfig(): SimulatorConfig {
  const args = process.argv.slice(2);

  const mode = parseModeArg(parseOptionalArg('--mode', args));
  const apiKey = parseRequiredArg('--api-key', args);
  const baseUrl = (parseOptionalArg('--base-url', args) ?? defaultBaseUrl).replace(/\/$/, '');
  const intervalMs = parseNumberArg(parseOptionalArg('--interval-ms', args), defaultIntervalMs, '--interval-ms');
  const step = parseNumberArg(parseOptionalArg('--step', args), defaultStep, '--step');
  const targetFlights = parseTargetFlightsArg(parseOptionalArg('--target-flights', args));

  return {
    mode,
    apiKey,
    baseUrl,
    intervalMs,
    step,
    targetFlights,
  };
}

function printUsage(): void {
  console.log(
    'Użycie: pnpm simulate -- --api-key <KLUCZ> [--mode <telemetry-only|full-flow>] [--base-url <URL>] [--interval-ms <MS>] [--step <WARTOŚĆ>] [--target-flights <N|all>]',
  );
}

async function readErrorBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

function buildApiUrl(config: SimulatorConfig, path: string): string {
  return `${config.baseUrl}${path}`;
}

async function requestWithAuth(
  config: SimulatorConfig,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set('x-drone-api-key', config.apiKey);

  if (init?.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  return fetch(buildApiUrl(config, path), {
    ...init,
    headers,
  });
}

async function parseOkJson<T>(response: Response, schema: z.ZodSchema<T>, endpointName: string): Promise<T> {
  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new Error(`Błąd endpointu ${endpointName} (${response.status}): ${body}`);
  }

  const rawData: unknown = await response.json();
  const parsed = schema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error(`Nieprawidłowa odpowiedź endpointu ${endpointName}`);
  }

  return parsed.data;
}

async function fetchDrones(config: SimulatorConfig): Promise<DroneStatusDTO[]> {
  const response = await requestWithAuth(config, '/api/drone-provider/drones', {
    method: 'GET',
  });
  const parsed = await parseOkJson(response, dronesResponseSchema, '/drones');

  if (!parsed.success) {
    throw new Error('Endpoint /drones zwrócił success=false');
  }

  return parsed.data;
}

async function sendTelemetry(config: SimulatorConfig, drone: DroneStatusDTO): Promise<void> {
  const response = await requestWithAuth(config, '/api/drone-provider/telemetry', {
    method: 'POST',
    body: JSON.stringify({
      droneId: drone.droneId,
      orderId: drone.orderId,
      currentPosition: drone.currentPosition,
      batteryLevel: drone.batteryLevel,
      origin: drone.origin,
      destination: drone.destination,
    }),
  });

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new Error(`Nie udało się zapisać telemetrii (${response.status}): ${body}`);
  }
}

async function fetchShipmentsReady(config: SimulatorConfig): Promise<ShipmentDTO[]> {
  const response = await requestWithAuth(config, '/api/drone-provider/shipments/ready', {
    method: 'GET',
  });
  const parsed = await parseOkJson(response, shipmentsReadyResponseSchema, '/shipments/ready');

  if (!parsed.success) {
    throw new Error('Endpoint /shipments/ready zwrócił success=false');
  }

  return parsed.data;
}

async function createIntakeOrder(
  config: SimulatorConfig,
  state: SimulatorState,
  destination: CoordsDTO,
  landingPadId: string,
): Promise<OrderDTO> {
  const type = orderTypeCycle[state.tick % orderTypeCycle.length];

  const response = await requestWithAuth(config, '/api/drone-provider/orders/intake', {
    method: 'POST',
    body: JSON.stringify({
      landingPadId,
      type,
      weight: 0.5 + (state.tick % 5) * 0.4,
      destination,
      description: `Symulowane zamówienie #${state.tick + 1}`,
    }),
  });
  const parsed = await parseOkJson(response, intakeResponseSchema, '/orders/intake');

  if (!parsed.success) {
    throw new Error('Endpoint /orders/intake zwrócił success=false');
  }

  return parsed.data;
}

async function findNearbyLandingPads(config: SimulatorConfig, destination: CoordsDTO) {
  const params = new URLSearchParams({
    lat: String(destination.lat),
    lng: String(destination.lng),
    limit: '50',
  });

  const response = await requestWithAuth(
    config,
    `/api/drone-provider/landing-pads/nearby?${params.toString()}`,
    {
      method: 'GET',
    },
  );
  const parsed = await parseOkJson(
    response,
    nearbyLandingPadsResponseSchema,
    '/landing-pads/nearby',
  );

  if (!parsed.success) {
    throw new Error('Endpoint /landing-pads/nearby zwrócił success=false');
  }

  return parsed.data;
}

async function checkAvailability(
  config: SimulatorConfig,
  landingPadId: string,
  from: Date,
  to: Date,
): Promise<boolean> {
  const params = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
  });

  const response = await requestWithAuth(
    config,
    `/api/drone-provider/landing-pads/${landingPadId}/availability?${params.toString()}`,
    {
      method: 'GET',
    },
  );
  const parsed = await parseOkJson(
    response,
    availabilityResponseSchema,
    '/landing-pads/[id]/availability',
  );

  if (!parsed.success) {
    throw new Error('Endpoint /landing-pads/[id]/availability zwrócił success=false');
  }

  return parsed.data.available;
}

async function selectAvailableLandingPad(
  config: SimulatorConfig,
  nearbyPads: NearbyLandingPadDTO[],
  excludedLandingPadId: string,
): Promise<NearbyLandingPadDTO | null> {
  const now = new Date();
  const from = new Date(now.getTime() + 60_000);
  const to = new Date(now.getTime() + 2 * 60_000);

  for (const landingPad of nearbyPads) {
    if (landingPad.id === excludedLandingPadId) {
      continue;
    }

    const isAvailable = await checkAvailability(config, landingPad.id, from, to);

    if (isAvailable) {
      return landingPad;
    }
  }

  return null;
}

async function createReservation(
  config: SimulatorConfig,
  orderId: string,
  droneId: string,
): Promise<DeliveryDTO> {
  const now = new Date();
  const reservedFrom = new Date(now.getTime() + 60_000);
  const reservedTo = new Date(now.getTime() + 2 * 60_000);

  const response = await requestWithAuth(config, '/api/drone-provider/reservations', {
    method: 'POST',
    body: JSON.stringify({
      orderId,
      droneId,
      reservedFrom: reservedFrom.toISOString(),
      reservedTo: reservedTo.toISOString(),
    }),
  });
  const parsed = await parseOkJson(response, reservationResponseSchema, '/reservations');

  if (!parsed.success) {
    throw new Error('Endpoint /reservations zwrócił success=false');
  }

  return parsed.data;
}

async function confirmDelivery(config: SimulatorConfig, deliveryId: string): Promise<void> {
  const response = await requestWithAuth(
    config,
    `/api/drone-provider/deliveries/${deliveryId}/confirm`,
    {
      method: 'POST',
      body: JSON.stringify({
        isDelivered: true,
      }),
    },
  );
  const parsed = await parseOkJson(
    response,
    confirmDeliveryResponseSchema,
    '/deliveries/[id]/confirm',
  );

  if (!parsed.success) {
    throw new Error('Endpoint /deliveries/[id]/confirm zwrócił success=false');
  }
}

function nextDroneState(drone: DroneStatusDTO, step: number): DroneStatusDTO {
  const dLat = drone.destination.lat - drone.currentPosition.lat;
  const dLng = drone.destination.lng - drone.currentPosition.lng;
  const distance = Math.sqrt(dLat * dLat + dLng * dLng);

  if (distance < step) {
    console.log(`[Simulator] Dron ${drone.droneId} dotarł do celu. Reset pozycji na origin.`);
    return {
      ...drone,
      currentPosition: {
        lat: drone.origin.lat,
        lng: drone.origin.lng,
      },
      batteryLevel: 100,
    };
  }

  const ratio = step / distance;
  const newLat = drone.currentPosition.lat + dLat * ratio;
  const newLng = drone.currentPosition.lng + dLng * ratio;
  const batteryLevel = Math.random() > 0.9 ? Math.max(0, drone.batteryLevel - 1) : drone.batteryLevel;

  return {
    ...drone,
    currentPosition: {
      lat: newLat,
      lng: newLng,
    },
    batteryLevel,
  };
}

function calculateNextFlightState(flight: ActiveFlight, step: number): {
  flight: ActiveFlight;
  arrived: boolean;
} {
  const dLat = flight.destination.lat - flight.currentPosition.lat;
  const dLng = flight.destination.lng - flight.currentPosition.lng;
  const distance = Math.sqrt(dLat * dLat + dLng * dLng);

  if (distance < step) {
    return {
      flight: {
        ...flight,
        currentPosition: {
          lat: flight.destination.lat,
          lng: flight.destination.lng,
        },
      },
      arrived: true,
    };
  }

  const ratio = step / distance;
  const newLat = flight.currentPosition.lat + dLat * ratio;
  const newLng = flight.currentPosition.lng + dLng * ratio;
  const batteryLevel = Math.random() > 0.9 ? Math.max(0, flight.batteryLevel - 1) : flight.batteryLevel;

  return {
    flight: {
      ...flight,
      currentPosition: {
        lat: newLat,
        lng: newLng,
      },
      batteryLevel,
    },
    arrived: false,
  };
}

function toDroneTelemetry(flight: ActiveFlight): DroneStatusDTO {
  return {
    droneId: flight.droneId,
    orderId: flight.orderId,
    currentPosition: flight.currentPosition,
    batteryLevel: flight.batteryLevel,
    origin: flight.origin,
    destination: flight.destination,
  };
}

function buildFallbackOrigin(destination: CoordsDTO, deliveryId: string): CoordsDTO {
  const offset = ((deliveryId.length % 9) + 1) * 0.0001;
  return {
    lat: destination.lat + offset,
    lng: destination.lng + offset,
  };
}

async function runTelemetryOnlyIteration(config: SimulatorConfig): Promise<void> {
  const drones = await fetchDrones(config);

  for (const drone of drones) {
    const updatedDrone = nextDroneState(drone, config.step);

    try {
      await sendTelemetry(config, updatedDrone);
    } catch (error) {
      console.error(`[Simulator] Błąd wysyłki telemetrii dla drona ${drone.droneId}:`, error);
    }
  }
}

async function runFullFlowIteration(config: SimulatorConfig, state: SimulatorState): Promise<void> {
  const [currentShipments, currentDrones] = await Promise.all([
    fetchShipmentsReady(config),
    fetchDrones(config),
  ]);

  for (const shipment of currentShipments) {
    state.knownDroneIds.add(shipment.delivery.droneId);
  }

  for (const drone of currentDrones) {
    state.knownDroneIds.add(drone.droneId);
  }

  const targetFlights = config.targetFlights ?? state.knownDroneIds.size;
  const busyDroneIds = new Set(currentShipments.map((shipment) => shipment.delivery.droneId));
  const freeDroneIds = Array.from(state.knownDroneIds).filter((droneId) => !busyDroneIds.has(droneId));
  const missingFlights = Math.max(0, targetFlights - currentShipments.length);

  if (missingFlights > 0 && freeDroneIds.length > 0) {
    try {
      const nearbyPads = await findNearbyLandingPads(config, {
        lat: krakowCenterLat,
        lng: krakowCenterLng,
      });

      if (nearbyPads.length === 0) {
        console.log('[Simulator] Brak lądowisk w zasięgu symulacji.');
      } else if (nearbyPads.length < 2) {
        console.log('[Simulator] Za mało lądowisk, żeby wyznaczyć osobny start i cel lotu.');
      } else {
        let createdFlights = 0;
        const createLimit = Math.min(missingFlights, freeDroneIds.length);

        for (let i = 0; i < createLimit; i += 1) {
          const droneId = freeDroneIds[i];
          const destinationPad = nearbyPads[(state.tick + i) % nearbyPads.length];
          const destination = destinationPad.coords;
          const selectedPad = await selectAvailableLandingPad(config, nearbyPads, destinationPad.id);

          if (!selectedPad) {
            console.log('[Simulator] Brak dostępnego lądowiska dla nowego zlecenia w tym ticku.');
            continue;
          }

          state.originByLandingPadId.set(selectedPad.id, selectedPad.coords);

          const order = await createIntakeOrder(config, state, destination, selectedPad.id);
          const delivery = await createReservation(config, order.orderId, droneId);
          const preferredOrigin = state.originByLandingPadId.get(order.landingPadId);
          const fallbackOrigin = selectedPad.coords;

          state.activeFlightsByDeliveryId.set(delivery.id, {
            deliveryId: delivery.id,
            orderId: order.orderId,
            droneId: delivery.droneId,
            landingPadId: order.landingPadId,
            currentPosition: preferredOrigin ?? fallbackOrigin,
            origin: preferredOrigin ?? fallbackOrigin,
            destination: order.destination,
            batteryLevel: 100,
          });

          createdFlights += 1;

          console.log(
            `[Simulator] Utworzono rezerwację dla zamówienia ${order.orderId} dronem ${delivery.droneId} z ${order.landingPadId} do ${destinationPad.id}.`,
          );
        }

        if (createdFlights > 0) {
          console.log(`[Simulator] Utworzono ${createdFlights} nowych lotów w tym ticku.`);
        }
      }
    } catch (error) {
      console.error('[Simulator] Błąd w scenariuszu intake/reservation:', error);
    }
  }

  const shipments = await fetchShipmentsReady(config);
  const drones = await fetchDrones(config);
  const droneByOrderId = new Map(drones.map((drone) => [drone.orderId, drone]));
  const activeDeliveryIds = new Set<string>();

  for (const shipment of shipments) {
    activeDeliveryIds.add(shipment.delivery.id);

    const existingFlight = state.activeFlightsByDeliveryId.get(shipment.delivery.id);
    const droneStatus = droneByOrderId.get(shipment.order.orderId);

    const originFromMemory = state.originByLandingPadId.get(shipment.order.landingPadId);
    const fallbackOrigin = buildFallbackOrigin(shipment.order.destination, shipment.delivery.id);
    const origin = droneStatus?.origin ?? existingFlight?.origin ?? originFromMemory ?? fallbackOrigin;
    const currentPosition =
      droneStatus?.currentPosition ?? existingFlight?.currentPosition ?? origin;

    const flight: ActiveFlight = {
      deliveryId: shipment.delivery.id,
      orderId: shipment.order.orderId,
      droneId: shipment.delivery.droneId,
      landingPadId: shipment.order.landingPadId,
      currentPosition,
      origin,
      destination: shipment.order.destination,
      batteryLevel: droneStatus?.batteryLevel ?? existingFlight?.batteryLevel ?? 100,
    };

    const next = calculateNextFlightState(flight, config.step);

    if (next.arrived) {
      try {
        await sendTelemetry(config, toDroneTelemetry(next.flight));
        await confirmDelivery(config, shipment.delivery.id);
        state.activeFlightsByDeliveryId.delete(shipment.delivery.id);
        console.log(`[Simulator] Potwierdzono dostawę ${shipment.delivery.id}.`);
      } catch (error) {
        console.error(`[Simulator] Błąd finalizacji dostawy ${shipment.delivery.id}:`, error);
      }

      continue;
    }

    try {
      await sendTelemetry(config, toDroneTelemetry(next.flight));
      state.activeFlightsByDeliveryId.set(shipment.delivery.id, next.flight);
    } catch (error) {
      console.error(`[Simulator] Błąd telemetrii dla dostawy ${shipment.delivery.id}:`, error);
    }
  }

  for (const deliveryId of Array.from(state.activeFlightsByDeliveryId.keys())) {
    if (!activeDeliveryIds.has(deliveryId)) {
      state.activeFlightsByDeliveryId.delete(deliveryId);
    }
  }

  console.log(
    `[Simulator] Tick ${state.tick}: aktywne loty ${state.activeFlightsByDeliveryId.size}, przesyłki gotowe ${shipments.length}`,
  );
}

async function runIteration(config: SimulatorConfig): Promise<void> {
  await runTelemetryOnlyIteration(config);
}

let isRunning = false;

async function main() {
  let config: SimulatorConfig;

  try {
    config = buildConfig();
  } catch (error) {
    console.error('[Simulator] Błąd konfiguracji:', error);
    printUsage();
    process.exit(1);
    return;
  }

  console.log('--- Symulator Dronów Hacknarok 2026 ---');
  console.log('Tryb:', config.mode);
  console.log('Adres API:', config.baseUrl);
  const targetFlightsLabel = config.targetFlights === null ? 'wszystkie wykryte drony' : config.targetFlights;
  console.log(
    'Częstotliwość:',
    `${config.intervalMs}ms`,
    'Krok:',
    config.step,
    'Target lotów:',
    targetFlightsLabel,
  );
  console.log('Naciśnij Ctrl+C aby przerwać.');

  const state: SimulatorState = {
    tick: 0,
    activeFlightsByDeliveryId: new Map(),
    originByLandingPadId: new Map(),
    knownDroneIds: new Set(),
  };

  setInterval(async () => {
    if (isRunning) {
      return;
    }

    isRunning = true;

    try {
      if (config.mode === 'full-flow') {
        await runFullFlowIteration(config, state);
      } else {
        await runIteration(config);
      }

      state.tick += 1;
    } catch (error) {
      console.error('[Simulator] Błąd podczas iteracji:', error);
    } finally {
      isRunning = false;
    }
  }, config.intervalMs);
}

void main();
