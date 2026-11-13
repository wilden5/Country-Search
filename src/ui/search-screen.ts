import type { CountryCard } from '../core/map-country.js';
import { createText } from './elements.js';

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'results'; cards: CountryCard[] }
  | { status: 'error'; error: unknown };

export type SearchHandlers = {
  onInput: (query: string) => void;
  onRetry: () => void;
  onCardClick: (card: CountryCard) => void;
};

export const renderSearchScreen = (root: HTMLElement, handlers: SearchHandlers) => {
  const header = createText('h1', `Country Search Screen`);

  const input = createText('input');
  input.type = 'search';
  input.placeholder = 'Search country...';
  input.autofocus = true;

  const statusDiv = createText('div');

  const listDiv = createText('div');

  const detailsDiv = createText('div');

  input.addEventListener('input', () => {
    handlers.onInput(input.value);
  });

  root.append(header, input, statusDiv, listDiv, detailsDiv);

  const update = (state: SearchState) => {
    statusDiv.replaceChildren();
    listDiv.replaceChildren();
    detailsDiv.replaceChildren();

    switch (state.status) {
      case 'idle':
        break;
      case 'loading':
        statusDiv.replaceChildren(createText('p', 'Loading...'));
        break;
      case 'empty':
        statusDiv.replaceChildren(createText('p', 'No countries found.'));
        break;
      case 'results': {
        const ul = createText('ul');

        const items = state.cards.map((card) => {
          const li = createText('li');

          if (card.flagUrl) {
            const img = createText('img');
            img.src = card.flagUrl;
            img.alt = `Flag of ${card.name}`;
            li.append(img);
          }

          const title = createText('h2', card.name);
          const capital = createText('p', `Capital: ${card.capital}`);
          const region = createText('p', `Region: ${card.region}`);
          const population = createText(
            'p',
            `Population: ${card.population.toLocaleString('en-US')}`,
          );

          li.append(title, capital, region, population);

          li.addEventListener('click', () => {
            handlers.onCardClick(card);
          });

          return li;
        });

        ul.append(...items);
        listDiv.replaceChildren(ul);
        break;
      }
      case 'error': {
        const errorText = createText('p', 'Something went wrong.');
        const retryBtn = createText('button', 'Retry');
        retryBtn.type = 'button';

        retryBtn.addEventListener('click', () => {
          handlers.onRetry();
        });

        statusDiv.replaceChildren(errorText, retryBtn);
        break;
      }
    }
  };

  const getQuery = () => {};

  return { update, getQuery };
};
