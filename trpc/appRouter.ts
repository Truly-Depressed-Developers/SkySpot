import { router } from './init';
import { deliveryRouter } from './routers/deliveryRouter';
import { droneStatusRouter } from './routers/droneStatusRouter';
import { landingPadRouter } from './routers/landingPadRouter';
import { providerOrderRouter } from './routers/providerOrderRouter';
import { userRouter } from './routers/userRouter';
import { userOrderRouter } from './routers/userOrderRouter';

export const appRouter = router({
  user: userRouter,
  landingPad: landingPadRouter,
  userOrder: userOrderRouter,
  providerOrder: providerOrderRouter,
  delivery: deliveryRouter,
  droneStatus: droneStatusRouter,
});

export type AppRouter = typeof appRouter;
