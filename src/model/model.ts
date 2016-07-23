import TaskModel from "./TaskModel";
import LocalStorageDB from "./DB/LocalStorageDB";

const taskModel = new TaskModel(new LocalStorageDB(localStorage));
export default taskModel;
