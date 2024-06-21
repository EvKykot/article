export const JWT = 'JWT';

export const isBrowser = (): boolean => typeof window !== 'undefined';

export const nextLocalStorage = (): Storage | null => {
    if (!isBrowser()) return null;
    return window.localStorage;
};

export const getLocalStorage = (key: string) => {
    const result = nextLocalStorage()?.getItem(key);
    return result ? JSON.parse(result) : null;
};

export const getJwtLocalStorage = () => nextLocalStorage()?.getItem(JWT) || null;

export const getStringLocalStorage = (key: string) => nextLocalStorage()?.getItem(key) || null;

export const removeLocalStorage = (key: string) => nextLocalStorage()?.removeItem(key);

export const setLocalStorage = (key: string, data: string) => nextLocalStorage()?.setItem(key, data);