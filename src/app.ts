import { renderSearchScreen } from './ui/search-screen.js';

export const startApp = (root: HTMLElement): void => {
  renderSearchScreen(root, {
    onInput: (query) => {
      console.log('Input query:', query);
    },
    onRetry: () => {
      console.log('Retry clicked');
    },
    onCardClick: (card) => {
      console.log('Card clicked:', card);
    },
  });
};
