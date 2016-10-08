export interface DB {

    getItem(key: string): Promise<string | null>;
    getMap<T>(key: string): Promise<Map<string, T>>;

    setItem(key: string, data: string | Map<string, any>): Promise<void>;
    setMap(key: string, data: Map<string, any>): Promise<void>;

    clear(): Promise<void>;

}
