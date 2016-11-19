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

    private dbFactory: IDBFactory;
    private db: IDBDatabase;

    constructor(dbFactory: IDBFactory) {
        this.dbFactory = dbFactory;
    }

    init(stores: Array<DBStoreDescriptor>): Promise<void> {

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

                    stores
                        .concat(INTERNAL_PROPERTY_STORE)
                        .forEach((descriptor: DBStoreDescriptor) => {
                            db.createObjectStore(descriptor.storeName, {keyPath: descriptor.storeKey});
                            console.log("created object store", descriptor.storeName);
                        });

                });

                request.addEventListener("blocked", () => {
                    reject(new Error("open database - blocked"));
                });

                request.addEventListener("error", (ev: ErrorEvent) => {
                    reject(new Error(`open database - error: ${ev.message}`));
                });
            }

        });

    }

    getItem(key: string): Promise<string|any> {
        console.log("getItem", key);
        return this.getDocumentByKey(INTERNAL_PROPERTY_STORE.storeName, key);
    }

    setItem(key: string, data: string|Map<string, any>): Promise<void> {
        console.log("setItem", key);
        return this.modifyStore(INTERNAL_PROPERTY_STORE.storeName, key, () => data);
    }

    getAll<T>(storeName: string): Promise<Array<T>> {

        console.log("getAll");

        return new Promise<Array<T>>((resolve, reject) => {

            const request = (this.db.transaction(storeName).objectStore(storeName) as ExtendedIDBObjectStore).getAll();

            request.addEventListener("success", () => {

                console.log("successfully got all items in %s", storeName);
                resolve(request.result);

            });

            request.addEventListener("error", () => {
                reject(new Error(`failed to get all items in ${storeName}`));
            });

        });
    }

    getAllKeys(storeName: string): Promise<Array<string>> {

        console.log("getAllKeys");

        return new Promise<Array<string>>((resolve, reject) => {

            const request = (this.db.transaction(storeName).objectStore(storeName) as ExtendedIDBObjectStore).getAllKeys();

            request.addEventListener("success", () => {

                console.log("successfully got all keys in %s", storeName);
                resolve(request.result);

            });

            request.addEventListener("error", () => {
                reject(new Error(`failed to get all keys in ${storeName}`));
            });

        });
    }

    getDocumentByKey<T>(storeName: string, key: string): Promise<T> {
        return new Promise<T | undefined>((resolve, reject) => {

            const request = this.db.transaction(storeName).objectStore(storeName).get(key);

            request.addEventListener("success", () => {

                console.log("successfully got document from index %s with key %s", storeName, key);
                resolve(request.result);

            });

            request.addEventListener("error", () => {
                reject(new Error(`failed to get document from store ${storeName}`));
            });

        });
    }

    addToStore(storeName: string, key: string, value: any): Promise<void> {

        console.log("addToStore");

        return new Promise<void>((resolve, reject) => {

            const request = this.db.transaction(storeName, "readwrite").objectStore(storeName).add(value, key);

            console.log("addToStore", request);

            request.addEventListener("success", () => {

                console.log("successfully added document to index %s with key %s", storeName, key);
                resolve();

            });

            request.addEventListener("error", () => {
                reject(new Error(`failed to add document with key ${key} to store ${storeName}`));
            });

        });
    }

    modifyStore<T>(storeName: string, key: string, modifier: (value: T) => T): Promise<void> {
        return this.getDocumentByKey(storeName, key).then((value: T) => {

            return new Promise<void>((resolve, reject) => {

                const request = this.db.transaction(storeName, "readwrite").objectStore(storeName).put(modifier(value), key);

                request.addEventListener("success", () => {

                    console.log("successfully updated document in index %s with key %s", storeName, key);
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

            const request = this.db.transaction(storeName).objectStore(storeName).delete(key);

            request.addEventListener("success", () => {
               resolve();
            });

            request.addEventListener("error", () => {
                reject(new Error(`could not delete item from store ${storeName} with key ${key}`));
            });

        });
    }


    clear(): Promise<void> {

        return new Promise<void>((resolve, reject) => {

            const request = this.dbFactory.deleteDatabase(DATABASE_NAME);

            request.addEventListener("success", () => {
                resolve();
            });

            request.addEventListener("blocked", () => {
                reject(new Error("deleteDatabase - blocked"));
            });

            request.addEventListener("error", (ev: ErrorEvent) => {
                console.log("deleteDatabase - error: ", ev.message);
                reject(new Error(`deleteDatabase - error: ${ev.message}`));
            });

        });
    }

}
