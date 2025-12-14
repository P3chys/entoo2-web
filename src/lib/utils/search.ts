import type { MeilisearchHit, SearchResult } from '$types';

export function transformMeilisearchHit(hit: MeilisearchHit): SearchResult {
	const isDocument = hit.mime_type !== undefined;

	return {
		type: isDocument ? 'document' : 'subject',
		id: hit.id,
		title: isDocument
			? hit.original_name || 'Unnamed Document'
			: hit.name_en || hit.name_cs || 'Unnamed Subject',
		description: isDocument
			? hit.content_text?.substring(0, 200) || 'No description'
			: hit.description_en || hit.description_cs || '',
		score: 0,
		subject_id: hit.subject_id,
		mime_type: hit.mime_type,
		file_size: hit.file_size,
		created_at: hit.created_at,
		code: hit.code,
		credits: hit.credits,
		highlight: extractHighlight(hit)
	};
}

export function extractHighlight(hit: MeilisearchHit): string | undefined {
	if (hit._formatted?.content_text) {
		return hit._formatted.content_text.substring(0, 200);
	}
	return undefined;
}

export function highlightText(text: string, query: string): string {
	if (!query.trim()) return escapeHtml(text);

	const escaped = escapeHtml(text);
	const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
	return escaped.replace(regex, '<mark class="search-highlight">$1</mark>');
}

function escapeHtml(text: string): string {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

function escapeRegex(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function formatFileSize(bytes?: number): string {
	if (!bytes) return '';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout>;
	return function (...args: Parameters<T>) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}
