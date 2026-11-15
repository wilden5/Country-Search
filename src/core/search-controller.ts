import type { SearchService } from './search-service.js';
import type { CountryCard } from './map-country.js';
import { debounce } from './debounce.js';
import { classifyError } from './error-classifier.js';

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'results'; cards: CountryCard[] }
  | { status: 'error'; error: unknown };

export type SearchControllerDeps = {
  service: Pick<SearchService, 'search'>;
  onState: (state: SearchState) => void;
  debounceMs?: number;
};

export class SearchController {
  private currentController: AbortController | null = null;
  private lastQuery = '';
  private debouncedSearch: (query: string) => void;

  constructor(private deps: SearchControllerDeps) {
    const delay = deps.debounceMs ?? 300;
    this.debouncedSearch = debounce((query: string) => {
      void this.runSearch(query);
    }, delay);
  }

  public handleInput(query: string): void {
    this.currentController?.abort();
    this.debouncedSearch(query);
  }

  public retry(): void {
    void this.runSearch(this.lastQuery);
  }

  private async runSearch(rawQuery: string): Promise<void> {
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
      } else {
        this.deps.onState({ status: 'empty' });
      }
    } catch (error) {
      if (classifyError(error) === 'aborted') {
        return;
      }

      this.deps.onState({ status: 'error', error });
    }
  }
}
