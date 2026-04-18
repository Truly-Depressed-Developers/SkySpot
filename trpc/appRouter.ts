import { router } from './init';
import { deliveryRouter } from './routers/deliveryRouter';
import { droneStatusRouter } from './routers/droneStatusRouter';
import { companyApiKeyRouter } from './routers/companyApiKeyRouter';
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
  companyApiKey: companyApiKeyRouter,
});

export type AppRouter = typeof appRouter;
