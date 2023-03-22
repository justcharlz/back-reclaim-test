"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Template_1 = __importDefault(require("./Template"));
class Connection {
    constructor(template, creatorPrivateKey) {
        this.generateTemplate = (callbackId) => {
            const templateInstance = Object.assign(Object.assign({}, this.template), { callbackUrl: this.template.callbackUrl + callbackId });
            return new Template_1.default(templateInstance);
        };
        this.creatorPrivateKey = creatorPrivateKey;
        this.template = template;
    }
}
exports.default = Connection;
