import { renderSearchScreen } from './ui/search-screen.js';
import { SearchService } from './core/search-service.js';
import { SearchController } from './core/search-controller.js';

export const startApp = (root: HTMLElement): void => {
  const service = new SearchService(8000);

  const controller = new SearchController({
    service,
    onState: (state) => update(state),
  });

  const { update, renderDetail } = renderSearchScreen(root, {
    onInput: (query) => controller.handleInput(query),
    onRetry: () => controller.retry(),
    onCardClick: (card) => renderDetail(card),
  });
};
