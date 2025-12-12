/**
 * Generates a unique ID for form elements
 * Uses a simple counter-based approach for SSR compatibility
 */
let counter = 0;

export function generateId(prefix: string = 'field'): string {
	counter++;
	return `${prefix}-${counter}-${Date.now()}`;
}
