export const localStored = <T>(key: string): ManagedLocalStorage<T> => {
    return {
        get (): T | undefined {
            const value = localStorage.getItem(key);
            if (value === null) {
                return undefined;
            }
            return JSON.parse(value);
        },
        set (value: T) {
            localStorage.setItem(key, JSON.stringify(value));
        },
        clear () {
            localStorage.removeItem(key);
        }
    }
}
