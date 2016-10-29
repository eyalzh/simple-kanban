export interface DBStoreDescriptor {
    storeName: string;
    storeKey: string;
}

export interface DB {

    init(stores: Array<DBStoreDescriptor>): Promise<void>;

    // limited key-value store for propeties
    getItem(key: string): Promise<string | null>;
    setItem(key: string, data: string | Map<string, any>): Promise<void>;

    // Indexes
    getMap<T>(key: string): Promise<Map<string, T>>;  // this is a getAll

    //setMap(key: string, data: Map<string, any>): Promise<void>; // This is a setAll (needed?)

    // Search the index for a key and return the stored object (can be an array etc.)
    getDocumentByKey<T>(storeName: string, key: string): Promise<T | undefined>;
    // Add addDocument, removeDocument, etc.

    addToStore(storeName: string, key: string, value: any): Promise<void>;
    modifyStore<T>(storeName: string, key: string, modifier: (value: T) => T): Promise<void>;

    deleteStoreItem(storeName: string, key: string): Promise<void>;

    clear(): Promise<void>;

}
