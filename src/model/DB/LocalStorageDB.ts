import {DB} from "./DB";
export default class LocalStorageDB implements DB {

    private storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    getItem(key: string): Promise<string | null> {
        console.log("getItem");
        return new Promise<string | null>((resolve, reject) => {
            resolve(this.storage.getItem(key));
        });
    }

    getMap<T>(key: string): Promise<Map<string, T>> {

        console.log("getmap");

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

        console.log("setItem");

        return new Promise<void>((resolve, reject) => {
            if (typeof data === "string") {
                this.storage.setItem(key, data);
            } else {
                this.storage.setItem(key, JSON.stringify(data));
            }
            resolve();
        });
    }

    setMap(key: string, data: Map<string, any>): Promise<void> {

        console.log("setMap");

        return new Promise<void>((resolve, reject) => {
            this.storage.setItem(key, JSON.stringify([...data]));
            resolve();
        });
    }

    clear(): Promise<void> {

        console.log("clear");

        return new Promise<void>((resolve, reject) => {
            this.storage.clear();
            resolve();
        });
    }

}
