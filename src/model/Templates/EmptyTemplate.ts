import {Template} from "./Template";
import TaskModel from "../TaskModel";

export default class EmptyTemplate implements Template {

    public getName(): string {
        return "Empty";
    }

    public async applyOnModel(model: TaskModel) {
    }

}