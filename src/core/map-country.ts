export interface RawCountry {
  name: string;
  region: string;
  population: number;
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

export const mapCountryResponse = (_raw: RawCountry): CountryCard => {
  throw new Error('not implemented');
};
