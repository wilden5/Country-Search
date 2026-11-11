import { type CountryCard, mapCountryResponse, type RawCountry } from './map-country.js';
import { HttpError } from './http-error.js';

export async function searchOuntries(query: string, signal: AbortSignal): Promise<CountryCard[]> {
  const response = await fetch(`https://countries.dev/name/${encodeURIComponent(query)}`, {
    signal,
  });

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    } else {
      throw new HttpError(response.status);
    }
  }

  const raw: RawCountry[] = await response.json();

  return raw.map(mapCountryResponse);
}
