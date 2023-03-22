"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRedactionCongruent = void 0;
/**
 * Check if a redacted string is congruent with the original string.
 * @param redacted the redacted content, redacted content is replaced by '*'
 * @param original the original content
 */
function isRedactionCongruent(redacted, original) {
    for (let i = 0; i < redacted.length; i++) {
        const areSame = redacted[i] === original[i]
            || redacted[i] === '*';
        if (!areSame)
            return false;
    }
    return true;
}
exports.isRedactionCongruent = isRedactionCongruent;
