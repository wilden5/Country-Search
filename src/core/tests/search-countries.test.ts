import { describe, it, expect, vi, afterEach } from 'vitest';
import type { RawCountry } from '../map-country.js';
import { searchCountries } from '../search-сountries.js';

describe('Search Countries', () => {
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

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should fetch Spain', async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [spain],
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await searchCountries('spain', controller.signal);

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Spain');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://countries.dev/name/spain',
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it('should return empty array on 404', async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await searchCountries('unknown', controller.signal);

    expect(result).toEqual([]);
  });

  it('should throw HttpError on 500 status', async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCountries('spain', controller.signal)).rejects.toMatchObject({
      name: 'HttpError',
      status: 500,
    });
  });

  it('should rethrow network error', async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('fetch failed'));

    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCountries('spain', controller.signal)).rejects.toThrow(TypeError);
  });
});
