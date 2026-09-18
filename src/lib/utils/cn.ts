/**
 * Joins conditional class names into a single string, skipping falsy values.
 * Deliberately minimal (no class-conflict resolution) — this project's
 * components never pass colliding utility classes for the same property,
 * so a small joiner is enough and avoids an extra dependency.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
