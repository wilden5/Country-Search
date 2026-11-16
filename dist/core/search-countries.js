import { mapCountryResponse } from './map-country.js';
import { HttpError } from './http-error.js';
export async function searchCountries(query, signal) {
    const response = await fetch(`https://countries.dev/name/${encodeURIComponent(query)}`, {
        signal,
    });
    if (!response.ok) {
        if (response.status === 404) {
            return [];
        }
        else {
            throw new HttpError(response.status);
        }
    }
    const raw = await response.json();
    return raw.map(mapCountryResponse);
}
//# sourceMappingURL=search-countries.js.map