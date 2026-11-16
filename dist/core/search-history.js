export const HISTORY_KEY = 'country-search-history';
export const HISTORY_LIMIT = 10;
export const isHistoryEntry = (value) => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const record = value;
    return typeof record.query === 'string' && typeof record.date === 'string';
};
export const loadHistory = (storage) => {
    try {
        const raw = storage.getItem(HISTORY_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter(isHistoryEntry);
    }
    catch {
        return [];
    }
};
export const saveHistory = (storage, entries) => {
    storage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
};
export const addQuery = (storage, query) => {
    const trimmed = query.trim();
    const entries = loadHistory(storage);
    if (!trimmed) {
        return entries;
    }
    const rest = entries.filter((entry) => entry.query !== trimmed);
    const entry = { query: trimmed, date: new Date().toISOString() };
    const next = [entry, ...rest].slice(0, HISTORY_LIMIT);
    saveHistory(storage, next);
    return next;
};
//# sourceMappingURL=search-history.js.map