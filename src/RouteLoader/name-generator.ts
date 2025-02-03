/**
 * Get a default name for unnamed routes.
 */
export function createNameGenerator(): () => string {
  let id = 0;
  return () => `_DEFAULT_ROUTE_NAME_${id++}`;
}