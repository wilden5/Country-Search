import { searchCountries } from './search-countries.js';
export class SearchService {
    timeoutMs;
    cache = new Map();
    inFlight = new Map();
    constructor(timeoutMs) {
        this.timeoutMs = timeoutMs;
    }
    search(query, signal) {
        const cached = this.cache.get(query);
        if (cached)
            return Promise.resolve(cached);
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
        return new Promise((resolve, reject) => {
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
            entry.promise.then((cards) => {
                signal.removeEventListener('abort', onAbort);
                resolve(cards);
            }, (error) => {
                signal.removeEventListener('abort', onAbort);
                reject(error);
            });
        });
    }
}
//# sourceMappingURL=search-service.js.map