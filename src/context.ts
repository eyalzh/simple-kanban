import TaskModel from "./model/TaskModel";
import TemplateCatalog from "./model/Templates/TemplateCatalog";

let model;
let templateCatalog;

export function setModel(m: TaskModel) {
    model = m;
}

export function getModel(): TaskModel {
    return model;
}

export function setCatalog(catalog: TemplateCatalog) {
    templateCatalog = catalog;
}

export function getCatalog(): TemplateCatalog {
    return templateCatalog;
}
