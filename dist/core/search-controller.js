import { debounce } from './debounce.js';
import { classifyError } from './error-classifier.js';
export class SearchController {
    deps;
    currentController = null;
    lastQuery = '';
    debouncedSearch;
    constructor(deps) {
        this.deps = deps;
        const delay = deps.debounceMs ?? 600;
        this.debouncedSearch = debounce((query) => {
            void this.runSearch(query);
        }, delay);
    }
    handleInput(query) {
        this.currentController?.abort();
        this.debouncedSearch(query);
    }
    retry() {
        void this.runSearch(this.lastQuery);
    }
    search(query) {
        void this.runSearch(query);
    }
    async runSearch(rawQuery) {
        const query = rawQuery.trim();
        if (!query) {
            this.lastQuery = '';
            this.currentController?.abort();
            this.currentController = null;
            this.deps.onState({ status: 'idle' });
            return;
        }
        this.lastQuery = query;
        this.currentController?.abort();
        const controller = new AbortController();
        this.currentController = controller;
        this.deps.onState({ status: 'loading' });
        try {
            const cards = await this.deps.service.search(query, controller.signal);
            if (cards.length > 0) {
                this.deps.onState({ status: 'results', cards });
            }
            else {
                this.deps.onState({ status: 'empty' });
            }
        }
        catch (error) {
            if (classifyError(error) === 'aborted') {
                return;
            }
            this.deps.onState({ status: 'error', error });
        }
    }
}
//# sourceMappingURL=search-controller.js.map