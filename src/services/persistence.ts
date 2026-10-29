/**
 * Persistence layer to retain bids, wallet transactions, and auctions
 * across browser refreshes during user testing.
 */
export class PersistenceService {
  private static readonly STORAGE_PREFIX = 'lowwinner_us_';

  public static get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Ignore in non-browser or sandbox environments
    }
    return defaultValue;
  }

  public static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      // Ignore
    }
  }

  public static clear(): void {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(this.STORAGE_PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore
    }
  }
}
