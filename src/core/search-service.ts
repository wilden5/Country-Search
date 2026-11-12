import type { CountryCard } from './map-country.js';
import { searchCountries } from './search-countries.js';

type InFlightEntry = {
  promise: Promise<CountryCard[]>;
  controller: AbortController;
  callers: number;
};

export class SearchService {
  private cache = new Map<string, CountryCard[]>();
  private inFlight = new Map<string, InFlightEntry>();

  constructor(private timeoutMs: number) {}

  public search(query: string, signal: AbortSignal): Promise<CountryCard[]> {
    const cached = this.cache.get(query);

    if (cached) return Promise.resolve(cached);

    let entry = this.inFlight.get(query);

    if (!entry) {
      const controller = new AbortController();
      const composedSignal = AbortSignal.any([
        controller.signal,
        AbortSignal.timeout(this.timeoutMs),
      ]);
      const promise = searchCountries(query, composedSignal)
        .then((cards) => {
          this.cache.set(query, cards);
          this.inFlight.delete(query);
          return cards;
        })
        .catch((error) => {
          this.inFlight.delete(query);
          throw error;
        });

      entry = { promise, controller, callers: 0 };
      this.inFlight.set(query, entry);
    }

    entry.callers += 1;

    return new Promise<CountryCard[]>((resolve, reject) => {
      const onAbort = () => {
        signal.removeEventListener('abort', onAbort);
        entry.callers -= 1;

        if (entry.callers === 0) {
          entry.controller.abort();
          this.inFlight.delete(query);
        }

        reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      };

      if (signal.aborted) {
        onAbort();
        return;
      }

      signal.addEventListener('abort', onAbort);

      entry.promise.then(
        (cards) => {
          signal.removeEventListener('abort', onAbort);
          resolve(cards);
        },
        (error) => {
          signal.removeEventListener('abort', onAbort);
          reject(error);
        },
      );
    });
  }
}
