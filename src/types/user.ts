/**
 * Minimal shape kept for parity with the Prisma User model. Not used by any
 * real auth flow yet (see hooks/use-library.ts for the local-only stand-in) —
 * exists so wiring a real session later is a type-compatible drop-in.
 */
export type User = {
  id: string;
  email: string;
  name?: string;
};
