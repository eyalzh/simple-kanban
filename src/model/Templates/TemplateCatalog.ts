import {Template} from "./Template";
import ProjectTemplate from "./ProjectTemplate";
import EmptyTemplate from "./EmptyTemplate";
import BrainstormingTemplate from "./BrainstormingTemplate";
import DailyTemplate from "./DailyTemplate";

export default class TemplateCatalog {

    private readonly templates: Array<Template>;

    constructor() {
        this.templates = [
            new EmptyTemplate(),
            new ProjectTemplate(),
            new BrainstormingTemplate(),
            new DailyTemplate(),
        ];
    }

    public getTemplates(): Array<Template> {
        return this.templates;
    }

    public getTemplateByName(name: string): Template | undefined {
        return this.templates.find(template => template.getName() === name);
    }

}
