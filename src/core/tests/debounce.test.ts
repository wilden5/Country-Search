import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../debounce.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call the debounced function after fake timer', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalled();
  });

  it('should reset the timer after second call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();

    vi.advanceTimersByTime(200);

    debounced();

    vi.advanceTimersByTime(200);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call the function with latest args', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('sp');

    vi.advanceTimersByTime(100);

    debounced('spain');

    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('spain');
  });
});
