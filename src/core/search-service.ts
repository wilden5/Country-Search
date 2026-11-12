import type { CountryCard } from './map-country.js';

export class SearchService {
  constructor(private timeoutMs: number) {}

  public search(_query: string, _signal: AbortSignal): Promise<CountryCard[]> {
    throw new Error('not implemented');
  }
}
