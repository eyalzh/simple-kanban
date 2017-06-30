import {Template} from "./Template";

export default class EmptyTemplate implements Template {

    public getName(): string {
        return "Empty";
    }

    public async applyOnModel() {
    }

}