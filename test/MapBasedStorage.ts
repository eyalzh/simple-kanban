/**
 * storage implementation using Map for mocking purposes
 */
export class MapBasedStorage implements Storage {

    private data: Map<string, any>;

    length: number;

    constructor() {
        this.data = new Map();
    }

    clear(): void {
        this.data.clear();
    }

    getItem(key: string): any {
        return this.data.get(key);
    }

    key(index: number): string {
        return this.data.keys()[index];
    }

    removeItem(key: string): void {
        this.data.delete(key);
    }

    setItem(key: string, data: string): void {
        this.data.set(key, data);
    }

    [key: string]: any;
    [index: number]: string;

}