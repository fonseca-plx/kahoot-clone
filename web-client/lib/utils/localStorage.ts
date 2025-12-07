/**
 * Salvar item no localStorage com tratamento de erro
 */
export function setLocalStorage<T>(key: string, value: T): boolean {
  try {
    if (typeof window === "undefined") return false;
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`[localStorage] Error setting ${key}:`, error);
    return false;
  }
}

/**
 * Buscar item do localStorage com tratamento de erro
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === "undefined") return defaultValue;
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error(`[localStorage] Error getting ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Remover item do localStorage
 */
export function removeLocalStorage(key: string): boolean {
  try {
    if (typeof window === "undefined") return false;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[localStorage] Error removing ${key}:`, error);
    return false;
  }
}

/**
 * Limpar todo o localStorage
 */
export function clearLocalStorage(): boolean {
  try {
    if (typeof window === "undefined") return false;
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("[localStorage] Error clearing:", error);
    return false;
  }
}