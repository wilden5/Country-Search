export const mapCountryResponse = (raw) => {
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
//# sourceMappingURL=map-country.js.map