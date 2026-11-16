import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CountryCard } from '../map-country.js';
import { SearchController, type SearchState } from '../search-controller.js';

describe('Search Controller', () => {
  const mockSpain: CountryCard = {
    name: 'Spain',
    capital: 'Madrid',
    region: 'Europe',
    subregion: 'Southern Europe',
    population: 47351567,
    area: 505992,
    flagUrl: 'https://flagcdn.com',
    nativeName: 'España',
    languages: ['Spanish'],
    currencies: ['Euro'],
    borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createSetup = () => {
    const states: SearchState[] = [];
    const searchMock = vi.fn();
    const controller = new SearchController({
      service: { search: searchMock },
      onState: (state) => states.push(state),
      debounceMs: 300,
    });

    return { controller, states, searchMock };
  };

  it(' should set idle state and does not call service on empty input', async () => {
    const { controller, states, searchMock } = createSetup();

    controller.handleInput('   ');
    vi.advanceTimersByTime(300);
    await Promise.resolve();

    expect(states).toEqual([{ status: 'idle' }]);
    expect(searchMock).not.toHaveBeenCalled();
  });

  it('should transits to loading then results with trimmed query', async () => {
    const { controller, states, searchMock } = createSetup();
    searchMock.mockResolvedValueOnce([mockSpain]);

    controller.handleInput('  spain  ');
    vi.advanceTimersByTime(300);
    await Promise.resolve();

    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(searchMock).toHaveBeenCalledWith('spain', expect.any(AbortSignal));
    expect(states).toEqual([{ status: 'loading' }, { status: 'results', cards: [mockSpain] }]);
  });

  it('should transits to loading then empty when no countries found', async () => {
    const { controller, states, searchMock } = createSetup();
    searchMock.mockResolvedValueOnce([]);

    controller.handleInput('atlantis');
    vi.advanceTimersByTime(300);
    await Promise.resolve();

    expect(states).toEqual([{ status: 'loading' }, { status: 'empty' }]);
  });

  it('Should ignore AbortError without transitioning to error state', async () => {
    const { controller, states, searchMock } = createSetup();
    searchMock.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));

    controller.handleInput('spain');
    vi.advanceTimersByTime(300);
    await Promise.resolve();

    expect(states).toEqual([{ status: 'loading' }]);
  });

  it('should transitions to error state on non-abort error', async () => {
    const { controller, states, searchMock } = createSetup();
    const networkError = new Error('Network failed');
    searchMock.mockRejectedValueOnce(networkError);

    controller.handleInput('spain');
    vi.advanceTimersByTime(300);
    await Promise.resolve();

    expect(states).toEqual([{ status: 'loading' }, { status: 'error', error: networkError }]);
  });

  it('should retry() repeats the last query after an error', async () => {
    const { controller, states, searchMock } = createSetup();
    searchMock.mockRejectedValueOnce(new Error('Server 500')).mockResolvedValueOnce([mockSpain]);

    controller.handleInput('spain');
    vi.advanceTimersByTime(300);
    await Promise.resolve();

    controller.retry();
    await Promise.resolve();

    expect(searchMock).toHaveBeenCalledTimes(2);
    expect(searchMock).toHaveBeenNthCalledWith(2, 'spain', expect.any(AbortSignal));
    expect(states.at(-1)).toEqual({ status: 'results', cards: [mockSpain] });
  });

  it('should abort active request immediately on every new input before debounce fires', () => {
    const { controller, searchMock } = createSetup();
    const signals: AbortSignal[] = [];

    searchMock.mockImplementation((_query: string, signal: AbortSignal) => {
      signals.push(signal);
      return new Promise(() => {});
    });

    controller.handleInput('ge');
    vi.advanceTimersByTime(300);

    expect(signals).toHaveLength(1);
    expect(signals[0]?.aborted).toBe(false);

    controller.handleInput('ger');

    expect(signals[0]?.aborted).toBe(true);
  });
});
