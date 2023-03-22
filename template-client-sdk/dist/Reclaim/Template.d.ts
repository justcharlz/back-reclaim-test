import { Template } from "../types";
export default class TemplateInstance {
    private _template;
    constructor(template: Template);
    get template(): Template;
    get id(): string;
    get url(): string;
}
