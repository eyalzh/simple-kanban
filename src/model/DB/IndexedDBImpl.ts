import {DB, DBStoreDescriptor} from "./DB";

const DATABASE_NAME = "simple_kanban_store";
const DATABASE_VERSION = 2;
const INTERNAL_PROPERTY_STORE: DBStoreDescriptor = {
    storeName: "__properties",
    storeKey: "itemId"
};

// extend IDBObjectStore with the recently-supported getAll method
interface ExtendedIDBObjectStore extends IDBObjectStore {
    getAll(): IDBRequest;
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

                console.log("db does not exist, creating it...");

                const request = this.dbFactory.open(DATABASE_NAME, DATABASE_VERSION);

                request.addEventListener("success", () => {
                    this.db = request.result;
                    console.log("successfully created db");
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
                    console.log("open database - blocked");
                    reject();
                });

                request.addEventListener("error", (ev: ErrorEvent) => {
                    console.log("open database - error: ", ev.message);
                    reject();
                });
            }

        });

    }

    getItem(key: string): Promise<string|any> {

        return new Promise<void>((resolve, reject) => {

        });

    }

    setItem(key: string, data: string|Map<string, any>): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            // TODO - set item

        });
    }

    getMap<T>(key: string): Promise<Map<string, T>> {

        console.log("getMap");

        return new Promise<Map<string, T>>((resolve, reject) => {

            const request = (this.db.transaction(key).objectStore(key) as ExtendedIDBObjectStore).getAll();

            request.addEventListener("success", () => {

                console.log("successfully got all items in %s", key);
                resolve(request.result);

            });

            request.addEventListener("error", () => {
                console.error("failed to get all items in %s", key);
                reject();
            });

        });
    }

    getDocumentByKey<T>(storeName: string, key: string): Promise<T | undefined> {
        return new Promise<T | undefined>((resolve, reject) => {

            const request = this.db.transaction(storeName).objectStore(storeName).get(key);

            request.addEventListener("success", () => {

                console.log("successfully got document from index %s with key %s", storeName, key);
                resolve(request.result);

            });

            request.addEventListener("error", () => {
                console.error("failed to get document from store %s", storeName);
                reject();
            });

        });
    }

    addToStore(storeName: string, key: string, value: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            const request = this.db.transaction(storeName).objectStore(storeName).add(value, key);

            request.addEventListener("success", () => {

                console.log("successfully added document to index %s with key %s", storeName, key);
                resolve();

            });

            request.addEventListener("error", () => {
                console.error("failed to add document with key %s to store %s", key, storeName);
                reject();
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
                    console.error("failed to updated document with key %s in store %s", key, storeName);
                    reject();
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
                reject();
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
                console.log("deleteDatabase - blocked");
                reject();
            });

            request.addEventListener("error", (ev: ErrorEvent) => {
                console.log("deleteDatabase - error: ", ev.message);
                reject();
            });

        });
    }

}
