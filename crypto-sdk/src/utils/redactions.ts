
/**
 * Check if a redacted string is congruent with the original string.
 * @param redacted the redacted content, redacted content is replaced by '*'
 * @param original the original content
 */
export function isRedactionCongruent(redacted: string, original: string): boolean {
	for(let i = 0;i < redacted.length;i++) {
		const areSame = redacted[i] === original[i]
			|| redacted[i] === '*'
		if(!areSame) return false
	}
	  
	return true
}