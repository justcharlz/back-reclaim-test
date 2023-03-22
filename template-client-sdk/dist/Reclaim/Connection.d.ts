import { Template } from "../types";
import TemplateInstance from "./Template";
export default class Connection {
    private template;
    private creatorPrivateKey;
    constructor(template: Template, creatorPrivateKey: string);
    generateTemplate: (callbackId: string) => TemplateInstance;
}
