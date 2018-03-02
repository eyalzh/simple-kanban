import {DB, DBStoreDescriptor} from "./DB";

const DATABASE_NAME = "simple_kanban_store";
const DATABASE_VERSION = 2;
const INTERNAL_PROPERTY_STORE: DBStoreDescriptor = {
    storeName: "__properties",
    storeKey: "itemId"
};

// extend IDBObjectStore with the recently-supported getAll and getAllKeys methods
interface ExtendedIDBObjectStore extends IDBObjectStore {
    getAll(): IDBRequest;
    getAllKeys(): IDBRequest;
}

export default class IndexedDBImpl implements DB {

    private db!: IDBDatabase;
    private stores: Array<DBStoreDescriptor> = [];

    constructor(private dbFactory: IDBFactory) {}

    init(stores: Array<DBStoreDescriptor>): Promise<void> {

        this.stores = stores.concat(INTERNAL_PROPERTY_STORE);

        return new Promise<void>((resolve, reject) => {

            if (this.db) {
                console.log("db already exists", this.db);
                resolve();
            } else {

                console.log("db connection does not exist, creating it...");

                const request = this.dbFactory.open(DATABASE_NAME, DATABASE_VERSION);

                request.addEventListener("success", () => {
                    this.db = request.result;
                    console.log("successfully created db connection");
                    resolve();
                });

                request.addEventListener("upgradeneeded", () => {

                    const db = request.result;

                    this.stores
                        .forEach((descriptor: DBStoreDescriptor) => {
                            db.createObjectStore(descriptor.storeName);
                            console.log("created object store", descriptor.storeName);
                        });

                });

                request.addEventListener("blocked", () => {
                    reject(new Error("open database - blocked"));
                });

                request.addEventListener("error", (ev: Event) => {
                    const errorEvent = ev as ErrorEvent;
                    reject(new Error(`open database - error: ${errorEvent.message}`));
                });
            }

        });

    }

    getItem<T>(key: string): Promise<T | null> {
        return this.getDocumentByKey(INTERNAL_PROPERTY_STORE.storeName, key);
    }

    setItem<T>(key: string, data: T|Map<T, any>): Promise<void> {
        return this.putInStore(INTERNAL_PROPERTY_STORE.storeName, key, data);
    }

    getAll<T>(storeName: string): Promise<Array<T>> {

        return new Promise<Array<T>>((resolve, reject) => {

            const request = (this.db.transaction(storeName).objectStore(storeName) as ExtendedIDBObjectStore).getAll();

            request.addEventListener("success", () => {
                resolve(request.result);
            });

            request.addEventListener("error", () => {
                reject(new Error(`failed to get all items in ${storeName}`));
            });

        });
    }

    getAllKeys(storeName: string): Promise<Array<string>> {

        return new Promise<Array<string>>((resolve, reject) => {

            const request = (this.db.transaction(storeName).objectStore(storeName) as ExtendedIDBObjectStore).getAllKeys();

            request.addEventListener("success", () => {
                resolve(request.result);
            });

            request.addEventListener("error", () => {
                reject(new Error(`failed to get all keys in ${storeName}`));
            });

        });
    }

    getDocumentByKey<T>(storeName: string, key: string): Promise<T|null> {
        return new Promise<T | null>((resolve, reject) => {

            const request = this.db.transaction(storeName).objectStore(storeName).get(key);

            request.addEventListener("success", () => {

                if (typeof request.result === "undefined") {
                    resolve(null);
                } else {
                    resolve(request.result);
                }

            });

            request.addEventListener("error", () => {
                reject(new Error(`failed to get document from store ${storeName}`));
            });

        });
    }

    addToStore(storeName: string, key: string, value: any): Promise<void> {

        return new Promise<void>((resolve, reject) => {

            const request = this.db.transaction(storeName, "readwrite").objectStore(storeName).add(value, key);

            request.addEventListener("success", () => {
                resolve();
            });

            request.addEventListener("error", () => {
                reject(new Error(`failed to add document with key ${key} to store ${storeName}`));
            });

        });

    }

    putInStore(storeName: string, key: string, value: any): Promise<void> {

        return new Promise<void>((resolve, reject) => {

            const request = this.db.transaction(storeName, "readwrite").objectStore(storeName).put(value, key);

            request.addEventListener("success", () => {
                resolve();
            });

            request.addEventListener("error", () => {
                reject(new Error(`failed to add document with key ${key} to store ${storeName}`));
            });

        });

    }

    modifyStore<T>(storeName: string, key: string, modifier: (value: T) => T): Promise<void> {

        return this.getDocumentByKey<T | null>(storeName, key).then<void>((value: T | null) => {

            if (value === null) {
                return Promise.resolve();
            }

            return new Promise<void>((resolve, reject) => {

                const request = this.db.transaction(storeName, "readwrite").objectStore(storeName).put(modifier(value), key);

                request.addEventListener("success", () => {
                    resolve();
                });

                request.addEventListener("error", () => {
                    reject(new Error(`failed to updated document with key ${key} in store ${storeName}`));
                });

            });

        });
    }

    deleteStoreItem(storeName: string, key: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            const request = this.db.transaction(storeName, "readwrite").objectStore(storeName).delete(key);

            request.addEventListener("success", () => {
               resolve();
            });

            request.addEventListener("error", () => {
                reject(new Error(`could not delete item from store ${storeName} with key ${key}`));
            });

        });
    }


    clear(): Promise<void> {

        return new Promise<void>((resolve) => {

            this.dbFactory.deleteDatabase(DATABASE_NAME);
            resolve();

        });
    }

    runMaintenance(): Promise<void> {

        return new Promise<void>((resolve) => {

            for (let store of this.stores) {

                const storeName = store.storeName;
                const request = this.db.transaction(storeName, "readwrite").objectStore(storeName).openCursor();

                request.addEventListener("success", () => {

                    const cursor: IDBCursorWithValue = request.result;
                    if (cursor) {

                        if (cursor.value === null) {
                            console.warn("found null values in DB");
                            cursor.update(new Array(0));
                        }

                        cursor.continue();

                    } else {
                        resolve();
                    }

                });

            }

        });

    }

    dumpStore(storeName: string): Promise<any> {

        return new Promise<any>((resolve, reject) => {

            let storeObj = {};

            const request = this.db.transaction(storeName, "readonly").objectStore(storeName).openCursor();

            request.addEventListener("success", () => {

                const cursor: IDBCursorWithValue = request.result;
                if (cursor) {

                    if (typeof cursor.key !== "string") {
                        reject("could not dump store with non-string key");
                        return;
                    }

                    storeObj[cursor.key] = cursor.value;
                    cursor.continue();

                } else {
                    resolve(storeObj);
                }

            });

        });
    }

}
