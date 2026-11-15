import { describe, it, expect, vi, afterEach } from 'vitest';
import type { RawCountry } from '../map-country.js';
import { SearchService } from '../search-service.js';
import { SearchController, type SearchState } from '../search-controller.js';

describe('Search Race', () => {
  const rawGeorgia: RawCountry = {
    name: 'Georgia',
    capital: 'Tbilisi',
    region: 'Asia',
    population: 3714000,
    flags: {
      png: 'https://flagcdn.com',
      svg: '',
    },
  };

  const rawGermany: RawCountry = {
    name: 'Germany',
    capital: 'Berlin',
    region: 'Europe',
    population: 83240000,
    flags: {
      png: 'https://flagcdn.com',
      svg: '',
    },
  };

  function mockJsonResponse(data: RawCountry[]) {
    return {
      ok: true,
      status: 200,
      json: async () => data,
    };
  }

  interface FetchCall {
    url: string;
    signal: AbortSignal;
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('cancels stale request and ignores its late response', async () => {
    vi.useFakeTimers();
    const calls: FetchCall[] = [];

    const fetchMock = vi.fn((input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const signal = init?.signal as AbortSignal;

      return new Promise((resolve, reject) => {
        calls.push({ url, signal, resolve, reject });

        if (signal.aborted) {
          reject(signal.reason);
          return;
        }
        signal.addEventListener('abort', () => {
          reject(signal.reason);
        });
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    const service = new SearchService(10_000);
    const states: SearchState[] = [];
    const controller = new SearchController({
      service,
      onState: (state) => {
        states.push(state);
      },
      debounceMs: 300,
    });

    controller.handleInput('ge');
    await vi.advanceTimersByTimeAsync(300);

    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toContain('ge');
    expect(calls[0]!.signal.aborted).toBe(false);

    controller.handleInput('germany');
    expect(calls[0]!.signal.aborted).toBe(true);

    await vi.advanceTimersByTimeAsync(300);
    expect(calls).toHaveLength(2);
    expect(calls[1]!.url).toContain('germany');

    calls[1]!.resolve(mockJsonResponse([rawGermany]));
    await vi.advanceTimersByTimeAsync(0);

    const lastStateAfterGermany = states[states.length - 1];
    expect(lastStateAfterGermany?.status).toBe('results');
    if (lastStateAfterGermany?.status === 'results') {
      expect(lastStateAfterGermany.cards[0]?.name).toBe('Germany');
    }

    calls[0]!.resolve(mockJsonResponse([rawGeorgia]));
    await vi.advanceTimersByTimeAsync(0);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(calls[0]!.signal.aborted).toBe(true);

    const hasErrorState = states.some((s) => s.status === 'error');
    expect(hasErrorState).toBe(false);

    const hasGeorgia = states.some(
      (s) => s.status === 'results' && s.cards.some((c) => c.name === 'Georgia'),
    );
    expect(hasGeorgia).toBe(false);

    const finalState = states[states.length - 1];
    expect(finalState?.status).toBe('results');
    if (finalState?.status === 'results') {
      expect(finalState.cards).toHaveLength(1);
      expect(finalState.cards[0]?.name).toBe('Germany');
    }
  });
});
