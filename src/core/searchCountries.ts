import type { CountryCard } from './map-country.js';

export async function searchCountries(
  _query: string,
  _signal: AbortSignal,
): Promise<CountryCard[]> {
  throw new Error('not implemented');
}
