import {DB} from "./DB";
export default class LocalStorageDB implements DB {

    private storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    getItem(key: string): string {
        return this.storage.getItem(key);
    }

    getMap<T>(key: string): Map<string, T> {

        const json = this.storage.getItem(key);
        let map: Map<any, any>;

        if (json) {
            map = new Map(JSON.parse(json));
        } else {
            map = new Map();
        }

        return (map as Map<string, T>);

    }

    setItem(key: string, data: string | Map<string, any>): void {

        if (typeof data === "string") {
            this.storage.setItem(key, data);
        } else {
            this.storage.setItem(key, JSON.stringify(data));
        }

    }

    setMap(key: string, data: Map<string, any>): void {
        this.storage.setItem(key, JSON.stringify([...data]));
    }

    clear(): void {
        this.storage.clear();
    }

}
