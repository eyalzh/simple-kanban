import TaskModel from "./TaskModel";
import LocalStorageDB from "./DB/LocalStorageDB";
import IndexedDBImpl from "./DB/IndexedDBImpl";
import {DB} from "./DB/DB";
import {config} from "../config";
import DataExporter from "./export/DataExporter";

let dbImpl: DB;
if (config.useIndexedDB) {
    dbImpl = new IndexedDBImpl(window.indexedDB);
} else {
    dbImpl = new LocalStorageDB(localStorage);
}

const taskModel = new TaskModel(dbImpl);
const modelExporter = new DataExporter(taskModel);

export {taskModel, modelExporter};
