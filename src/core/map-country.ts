export interface RawCountry {
  name: string;
  region: string;
  population: number;
  flags?: { png: string; svg: string };
  capital?: string;
  subregion?: string;
  area?: number;
  nativeName?: string;
  languages?: Array<{ name: string }>;
  currencies?: Array<{ code: string; name: string }>;
  borders?: string[];
}

export interface CountryCard {
  name: string;
  flagUrl: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
  currencies: string[];
  borders: string[];
  subregion: string;
  area: number;
  nativeName: string;
}

export const mapCountryResponse = (raw: RawCountry): CountryCard => {
  return {
    name: raw.name,
    flagUrl: raw.flags?.png ?? '',
    capital: raw.capital ?? '',
    region: raw.region,
    population: raw.population,
    languages: raw.languages?.map((item) => item.name) ?? [],
    currencies: raw.currencies?.map((item) => `${item.name} (${item.code})`) ?? [],
    borders: raw.borders ?? [],
    subregion: raw.subregion ?? '',
    area: raw.area ?? 0,
    nativeName: raw.nativeName ?? '',
  };
};
