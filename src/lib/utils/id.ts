/**
 * Generates a unique ID for form elements
 * Uses crypto.randomUUID() when available for better uniqueness,
 * falls back to counter-based approach for SSR compatibility
 */
let counter = 0;

export function generateId(prefix: string = 'id'): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return `${prefix}-${crypto.randomUUID()}`;
	}
	return `${prefix}-${++counter}-${Date.now()}`;
}
