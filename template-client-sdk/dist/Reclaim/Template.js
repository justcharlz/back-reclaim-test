"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
class TemplateInstance {
    constructor(template) {
        this._template = template;
    }
    get template() {
        return this._template;
    }
    get id() {
        return this._template.id;
    }
    get url() {
        return config_1.RECLAIM_APP_URL + encodeURIComponent(JSON.stringify(this._template));
    }
}
exports.default = TemplateInstance;
