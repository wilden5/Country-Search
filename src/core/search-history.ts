export const HISTORY_KEY = 'country-search-history';
export const HISTORY_LIMIT = 10;

export interface HistoryEntry {
  query: string;
  date: string;
}

export interface HistoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const isHistoryEntry = (value: unknown): value is HistoryEntry => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.query === 'string' && typeof record.date === 'string';
};

export const loadHistory = (storage: HistoryStorage): HistoryEntry[] => {
  try {
    const raw = storage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isHistoryEntry);
  } catch {
    return [];
  }
};

export const saveHistory = (storage: HistoryStorage, entries: HistoryEntry[]): void => {
  storage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
};

export const addQuery = (storage: HistoryStorage, query: string): HistoryEntry[] => {
  const trimmed = query.trim();
  const entries = loadHistory(storage);
  if (!trimmed) {
    return entries;
  }
  const last = entries[0];
  if (last && last.query === trimmed) {
    return entries;
  }
  const entry: HistoryEntry = { query: trimmed, date: new Date().toISOString() };
  const next = [entry, ...entries].slice(0, HISTORY_LIMIT);
  saveHistory(storage, next);
  return next;
};
