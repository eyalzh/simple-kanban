import TaskModel from "./TaskModel";
import LocalStorageDB from "./DB/LocalStorageDB";
import IndexedDBImpl from "./DB/IndexedDBImpl";
import {DB} from "./DB/DB";
import {config} from "../config";
import TemplateCatalog from "./Templates/TemplateCatalog";

let dbImpl: DB;
if (config.useIndexedDB) {
    dbImpl = new IndexedDBImpl(window.indexedDB);
} else {
    dbImpl = new LocalStorageDB(localStorage);
}

const taskModel = new TaskModel(dbImpl);

export default taskModel;

