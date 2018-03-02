import {DB, DBStoreDescriptor} from "./DB";

const INTERNAL_PROPERTY_STORE: DBStoreDescriptor = {
    storeName: "__properties",
    storeKey: "itemId"
};

export default class LocalStorageDB implements DB {

    constructor(private storage: Storage) {}

    init(stores: Array<DBStoreDescriptor>): Promise<void> {
        return new Promise<void>((resolve) => {

            stores.forEach((store) => {
                if (this.storage.getItem(store.storeName) === null) {
                    this.storage.setItem(store.storeName, "[]");
                }
            });

            resolve();
        });
    }

    getItem<T>(key: string): Promise<T | null> {
        return this.getDocumentByKey<T>(INTERNAL_PROPERTY_STORE.storeName, key);
    }

    getAll<T>(storeName: string): Promise<Array<T>> {

        return new Promise<Array<T>>((resolve) => {
            const json = this.storage.getItem(storeName);
            let values: Array<T> = [];

            if (json) {
                const pairArray = JSON.parse(json);
                values = pairArray.map((pair) => pair[1]);
            }

            resolve(values);
        });

    }

    getAllKeys(storeName: string): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve) => {
            const json = this.storage.getItem(storeName);
            let values: Array<string> = [];

            if (json) {
                const pairArray = JSON.parse(json);
                values = pairArray.map((pair) => pair[0]);
            }

            resolve(values);
        });
    }


    setItem<T>(key: string, data: T | Map<T, any>): Promise<void> {
        return this.addToStore(INTERNAL_PROPERTY_STORE.storeName, key, data);
    }

    getDocumentByKey<T>(storeName: string, key: string): Promise<T | null> {
        return new Promise<T | null>((resolve, reject) => {
            const json = this.storage.getItem(storeName);
            let map: Map<any, any>;

            if (json) {
                map = new Map(JSON.parse(json));
            } else {
                map = new Map();
            }

            const value = map.get(key);

            if (typeof value !== "undefined") {
                resolve(value);
            } else {
                reject(new Error(`failed to find document with key ${key} in store ${storeName}`));
            }

        });
    }

    addToStore(storeName: string, key: string, value: any): Promise<void> {

        return new Promise<void>((resolve) => {

            const json = this.storage.getItem(storeName);
            let map: Map<any, any>;

            if (json) {
                map = new Map(JSON.parse(json));
            } else {
                map = new Map();
            }

            map.set(key, value);
            this.storage.setItem(storeName, JSON.stringify([...map]));
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
                    reject(new Error(`could not find item with key ${key}`));
                } else {

                    map.set(key, modifier(value));

                    this.storage.setItem(storeName, JSON.stringify([...map]));
                    resolve();
                }
            } else {
                reject(new Error(`could not find store ${storeName}`));
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
                this.storage.setItem(storeName, JSON.stringify([...map]));
                resolve();
            } else {
                reject(new Error(`store ${storeName} could not be found`));
            }

        });
    }

    clear(): Promise<void> {

        return new Promise<void>((resolve) => {
            this.storage.clear();
            resolve();
        });
    }

    runMaintenance(): Promise<void> {
        // no maintenance required for localstorage
        return Promise.resolve();
    }

}
