import { describe, it, expect } from 'vitest';
import { mapCountryResponse, type RawCountry } from '../map-country.js';

describe('map-country', () => {
  const spain: RawCountry = {
    name: 'Spain',
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

  const atlantis: RawCountry = {
    name: 'Atlantis',
    region: 'Europe',
    population: 1000,
  };

  it('should correctly map full country data (Spain)', () => {
    const result = mapCountryResponse(spain);

    expect(result).toEqual({
      name: 'Spain',
      capital: 'Madrid',
      region: 'Europe',
      population: 47351567,
      languages: [{ name: 'Spanish' }],
      currencies: [{ code: 'EUR', name: 'Euro' }],
      borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
      subregion: 'Southern Europe',
      area: 505992,
      nativeName: 'España',
    });
  });

  it('should correctly map minimal country data with missing optional fields (Atlantis)', () => {
    const result = mapCountryResponse(atlantis);

    expect(result).toEqual({
      name: 'Atlantis',
      flagUrl: '',
      capital: '',
      region: 'Europe',
      population: 1000,
      languages: [],
      currencies: [],
      borders: [],
      subregion: '',
      area: 0,
      nativeName: '',
    });
  });
});
