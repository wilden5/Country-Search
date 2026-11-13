import { renderSearchScreen } from './ui/search-screen.js';
import { SearchService } from './core/search-service.js';
import { classifyError } from './core/error-classifier.js';
import { debounce } from './core/debounce.js';

export const startApp = (root: HTMLElement): void => {
  const service = new SearchService(8000);
  let currentController: AbortController | null = null;
  let lastQuery: string = '';

  const runSearch = async (rawQuery: string): Promise<void> => {
    const query = rawQuery.trim();

    if (!query) {
      lastQuery = '';
      currentController?.abort();
      currentController = null;
      update({ status: 'idle' });
      return;
    }

    lastQuery = query;

    currentController?.abort();
    const controller = new AbortController();
    currentController = controller;

    update({ status: 'loading' });

    try {
      const cards = await service.search(query, controller.signal);

      if (cards.length > 0) {
        update({ status: 'results', cards });
      } else {
        update({ status: 'empty' });
      }
    } catch (error) {
      if (classifyError(error) === 'aborted') {
        return;
      }
      update({ status: 'error', error });
    }
  };

  const debouncedSearch = debounce((query: string) => {
    void runSearch(query);
  }, 300);

  const { update } = renderSearchScreen(root, {
    onInput: (query) => {
      currentController?.abort();
      debouncedSearch(query);
    },
    onRetry: () => {
      runSearch(lastQuery);
    },
    onCardClick: (card) => {
      console.log('Card clicked:', card);
    },
  });
};
