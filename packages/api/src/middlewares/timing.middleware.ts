import { t } from "../t";

const MIN_DELAY = 200;

export const timingMiddleware = t.middleware(async ({ next, path }) => {
  // artificial delay in dev
  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 100) + MIN_DELAY;
    await new Promise(resolve => setTimeout(resolve, waitMs));
  }
  return next();
});
