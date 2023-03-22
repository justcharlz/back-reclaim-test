import { TemplateClaim } from "../types";
import Connection from "./Connection";
export declare class Reclaim {
    private creatorWallet;
    private callbackUrl;
    constructor(callbackUrl: string);
    getConsent: (templateName: string, templateClaims: TemplateClaim[]) => Promise<Connection>;
}
