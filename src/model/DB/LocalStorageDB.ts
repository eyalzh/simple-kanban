import {DB} from "./DB";
export default class LocalStorageDB implements DB {

    private storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    init(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

    getItem(key: string): Promise<string | null> {
        return new Promise<string | null>((resolve, reject) => {
            resolve(this.storage.getItem(key));
        });
    }

    getMap<T>(key: string): Promise<Map<string, T>> {

        return new Promise<Map<string, T>>((resolve, reject) => {
            const json = this.storage.getItem(key);
            let map: Map<any, any>;

            if (json) {
                map = new Map(JSON.parse(json));
            } else {
                map = new Map();
            }

            resolve(map as Map<string, T>);
        });

    }

    setItem(key: string, data: string | Map<string, any>): Promise<void> {

        return new Promise<void>((resolve, reject) => {
            if (typeof data === "string") {
                this.storage.setItem(key, data);
            } else {
                this.storage.setItem(key, JSON.stringify(data));
            }
            resolve();
        });
    }

    getDocumentByKey<T>(storeName: string, key: string): Promise<T | undefined> {
        return new Promise<T | undefined>((resolve, reject) => {
            const json = this.storage.getItem(storeName);
            let map: Map<any, any>;

            if (json) {
                map = new Map(JSON.parse(json));
            } else {
                map = new Map();
            }

            const value = map.get(key);

            resolve(value);
        });
    }

    addToStore(storeName: string, key: string, value: any): Promise<void> {

        return new Promise<void>((resolve, reject) => {

            const json = this.storage.getItem(storeName);
            let map: Map<any, any>;

            if (json) {
                map = new Map(JSON.parse(json));
            } else {
                map = new Map();
            }

            map.set(key, value);
            this.storage.setItem(key, JSON.stringify(map));
            resolve();

        });

    }

    modifyStore<T>(storeName: string, key: string, modifier: (value: T) => T): Promise<void> {

        return new Promise<void>((resolve, reject) => {

            const json = this.storage.getItem(storeName);
            let map: Map<any, any>;

            if (json) {
                map = new Map(JSON.parse(json));
                const value = map.get(key);
                if (typeof value === "undefined") {
                    reject(`could not find item with key ${key}`);
                } else {
                    map.set(key, modifier(value));
                    this.storage.setItem(key, JSON.stringify(map));
                    resolve();
                }
            } else {
                reject(`could not find store ${storeName}`);
            }

        });

    }

    deleteStoreItem(storeName: string, key: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            const json = this.storage.getItem(storeName);
            let map: Map<any, any>;

            if (json) {
                map = new Map(JSON.parse(json));
                map.delete(key);
                this.storage.setItem(key, JSON.stringify(map));
                resolve();
            } else {
                reject(`store ${storeName} could not be found`);
            }

        });
    }

    clear(): Promise<void> {

        return new Promise<void>((resolve, reject) => {
            this.storage.clear();
            resolve();
        });
    }

}
