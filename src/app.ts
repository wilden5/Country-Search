import { renderSearchScreen } from './ui/search-screen.js';
import { SearchService } from './core/search-service.js';
import { SearchController } from './core/search-controller.js';
import { addQuery, type HistoryStorage, loadHistory } from './core/search-history.js';

export const startApp = (root: HTMLElement): void => {
  const service = new SearchService(8000);
  const storage: HistoryStorage = window.localStorage;

  const { update, renderDetail, renderHistory } = renderSearchScreen(root, {
    onInput: (query) => controller.handleInput(query),
    onRetry: () => controller.retry(),
    onCardClick: (card) => renderDetail(card),
    onHistoryClick: (query) => controller.search(query),
  });

  const historyAwareService = {
    search: (query: string, signal: AbortSignal) =>
      service.search(query, signal).then((cards) => {
        const entries = addQuery(storage, query);
        renderHistory(entries);
        return cards;
      }),
  };

  const controller = new SearchController({
    service: historyAwareService,
    onState: (state) => update(state),
  });

  renderHistory(loadHistory(storage));
};
