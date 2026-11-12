import { describe, it, expect, vi, afterEach } from 'vitest';
import type { RawCountry } from '../map-country.js';
import { SearchService } from '../search-service.js';

describe('Search Service', () => {
  const spain: RawCountry = {
    name: 'Spain',
    flags: {
      png: 'https://flagcdn.com',
      svg: '',
    },
    capital: 'Madrid',
    region: 'Europe',
    population: 47351567,
    languages: [{ name: 'Spanish' }],
    currencies: [{ code: 'EUR', name: 'Euro' }],
    borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
    subregion: 'Southern Europe',
    area: 505992,
    nativeName: 'España',
  };

  const createDeferredFetch = () => {
    let resolve!: (value: unknown) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise((res) => {
          resolve = res;
        }),
    );

    vi.stubGlobal('fetch', fetchMock);

    return { fetchMock, resolve };
  };

  const createAbortableFetch = () => {
    let lastSignal: AbortSignal | undefined;
    const fetchMock = vi.fn((_url: string, opts?: { signal?: AbortSignal }) => {
      lastSignal = opts?.signal;
      return new Promise((_resolve, reject) => {
        if (opts?.signal?.aborted) {
          reject(opts.signal.reason);
          return;
        }

        opts?.signal?.addEventListener('abort', () => {
          reject(opts.signal?.reason);
        });
      });
    });

    vi.stubGlobal('fetch', fetchMock);
    return { fetchMock, getLastSignal: () => lastSignal };
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should cache result by query', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [spain],
    });
    vi.stubGlobal('fetch', fetchMock);

    const controllerA = new AbortController();
    const controllerB = new AbortController();
    const service = new SearchService(10_000);
    const firstResult = await service.search('spain', controllerA.signal);
    const secondResult = await service.search('spain', controllerB.signal);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(secondResult).toBe(firstResult);
  });

  it('should deduplicate concurrent identical requests', async () => {
    const { fetchMock, resolve } = createDeferredFetch();
    const controllerA = new AbortController();
    const controllerB = new AbortController();
    const service = new SearchService(10_000);

    const firstPromise = service.search('spain', controllerA.signal);
    const secondPromise = service.search('spain', controllerB.signal);

    resolve({ ok: true, status: 200, json: async () => [spain] });

    const [firstResult, secondResult] = await Promise.all([firstPromise, secondPromise]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(firstResult[0]?.name).toBe('Spain');
    expect(secondResult[0]?.name).toBe('Spain');
  });

  it('should not cancel second request when first is aborted', async () => {
    const { resolve } = createDeferredFetch();
    const controllerA = new AbortController();
    const controllerB = new AbortController();
    const service = new SearchService(10_000);

    const firstPromise = service.search('spain', controllerA.signal);
    const secondPromise = service.search('spain', controllerB.signal);

    controllerA.abort();

    await expect(firstPromise).rejects.toMatchObject({ name: 'AbortError' });

    resolve({ ok: true, status: 200, json: async () => [spain] });

    const cards = await secondPromise;

    expect(cards).toHaveLength(1);
    expect(cards[0]?.name).toBe('Spain');
  });

  it('should abort fetch request when the only caller aborts', async () => {
    const { getLastSignal } = createAbortableFetch();
    const controller = new AbortController();
    const service = new SearchService(10_000);
    const promise = service.search('spain', controller.signal);

    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
    expect(getLastSignal()?.aborted).toBe(true);
  });

  it('should reject on timeout and not cache failed request', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce((_url: string, opts?: { signal?: AbortSignal }) => {
        return new Promise((_resolve, reject) => {
          if (opts?.signal?.aborted) {
            reject(opts.signal.reason);
            return;
          }
          opts?.signal?.addEventListener('abort', () => {
            reject(opts.signal?.reason);
          });
        });
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [spain],
      });

    vi.stubGlobal('fetch', fetchMock);

    const service = new SearchService(5);
    const controllerA = new AbortController();

    await expect(service.search('spain', controllerA.signal)).rejects.toMatchObject({
      name: 'TimeoutError',
    });

    const controllerB = new AbortController();
    const result = await service.search('spain', controllerB.signal);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result[0]?.name).toBe('Spain');
  });
});
