/**
 * A helper to strip certain fields from an object.
 */
export function omit<T, K extends keyof T>(o: T, fields: K[]): Omit<T, K> {
  const result: Partial<T> = { ...o };
  for (const field of fields) {
    delete result[field];
  }
  return <Omit<T, K>>result;
}
