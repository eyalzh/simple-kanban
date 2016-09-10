export interface DB {

    getItem(key: string): string | null;
    getMap<T>(key: string): Map<string, T>;

    setItem(key: string, data: string | Map<string, any>): void;
    setMap(key: string, data: Map<string, any>): void;

    clear(): void;

}
