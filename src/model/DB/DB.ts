export interface DBStoreDescriptor {
    storeName: string;
    storeKey: string;
}

export interface DB {

    init(stores: Array<DBStoreDescriptor>): Promise<void>;

    getItem<T>(key: string): Promise<T | null>;
    setItem<T>(key: string, data: T | Map<T, any>): Promise<void>;

    getAll<T>(storeName: string): Promise<Array<T>>;
    getAllKeys(storeName: string): Promise<Array<string>>;
    getDocumentByKey<T>(storeName: string, key: string): Promise<T>;

    addToStore(storeName: string, key: string, value: any): Promise<void>;
    modifyStore<T>(storeName: string, key: string, modifier: (value: T) => T): Promise<void>;

    deleteStoreItem(storeName: string, key: string): Promise<void>;

    clear(): Promise<void>;

}
