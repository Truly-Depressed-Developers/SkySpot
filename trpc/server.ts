import { createContext } from './context';
import { createCallerFactory } from './init';
import { appRouter } from './appRouter';

export const trpc = createCallerFactory(appRouter)(createContext);
