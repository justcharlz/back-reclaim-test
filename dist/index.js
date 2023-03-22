"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const template_client_sdk_1 = require("@questbook/template-client-sdk");
const cors_1 = __importDefault(require("cors"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
let singletonDb = undefined;
const getDb = () => __awaiter(void 0, void 0, void 0, function* () {
    if (singletonDb !== undefined)
        return singletonDb;
    const db = yield (0, sqlite_1.open)({
        filename: '/tmp/database.db',
        driver: sqlite3_1.default.cached.Database
    });
    yield db.exec('CREATE TABLE IF NOT EXISTS submitted_links (callback_id TEXT, status TEXT, username TEXT, template_id TEXT, claims TEXT)');
    return db;
});
// import { verifyEncryptedClaims } from '@questbook/reclaim-crypto-sdk';
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
const callbackUrl = process.env.CALLBACK_URL + '/callback/';
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const reclaim = new template_client_sdk_1.Reclaim(callbackUrl);
const connection = reclaim.getConsent('Questbook-Employee', [
    {
        provider: "google-login",
        params: {}
    }
]);
app.get('/home/:username', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield getDb();
    const username = req.params.username;
    const callbackId = 'user-' + (0, template_client_sdk_1.generateUuid)();
    const template = (yield connection).generateTemplate(callbackId);
    const url = template.url;
    const templateId = template.id;
    try {
        yield db.run("INSERT INTO submitted_links (callback_id, status, username, template_id) VALUES (?, ?, ?, ?)", callbackId, "pending", username, templateId);
    }
    catch (e) {
        res.send(`500 - Internal Server Error - ${e}`);
        return;
    }
    res.json({ url, callbackId });
}));
app.post('/callback/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Got callback for id: " + req.params.id);
    const db = yield getDb();
    if (!req.params.id) {
        res.send(`400 - Bad Request: callbackId is required`);
        return;
    }
    if (!req.body.claims) {
        res.send(`400 - Bad Request: claims are required`);
        return;
    }
    const callbackId = req.params.id;
    const claims = { claims: req.body.claims };
    try {
        yield db.run("UPDATE submitted_links SET claims = ?, status = ? WHERE callback_id = ?;", JSON.stringify(claims), 'verified', callbackId);
        console.log("updated");
    }
    catch (e) {
        console.log("error", e);
        res.send(`500 - Internal Server Error - ${e}`);
        return;
    }
    res.send("200 - OK");
}));
app.get('/status/:callbackId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield getDb();
    let row;
    if (!req.params.callbackId) {
        res.send(`400 - Bad Request: callbackId is required`);
        return;
    }
    const callbackId = req.params.callbackId;
    try {
        row = yield db.get("SELECT status FROM submitted_links WHERE callback_id = $1", [callbackId]);
    }
    catch (e) {
        res.send(`500 - Internal Server Error - ${e}`);
        return;
    }
    res.json({ status: row.status });
}));
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
